package com.javaroadmap.algo.heaptopk;

import java.util.Arrays;

/**
 * 自底向上建堆与 Top-K 问题。
 * 对应《Hello 算法》8.2、8.3 节。
 *
 * 场景：从一批成绩里挑前 3 名——数据可以一次性给出，也可以一条条到来；
 * 用大小为 K 的小顶堆维护"当前最大的 K 个"，内存只需 O(K)。
 */
public class App {

    // 小顶堆下沉：与较小的孩子交换，返回交换次数（演示用）
    static int siftDown(int[] heap, int n, int i) {
        int swaps = 0;
        while (true) {
            int l = 2 * i + 1, r = 2 * i + 2, smallest = i;
            if (l < n && heap[l] < heap[smallest]) smallest = l;
            if (r < n && heap[r] < heap[smallest]) smallest = r;
            if (smallest == i) return swaps;
            int tmp = heap[i];
            heap[i] = heap[smallest];
            heap[smallest] = tmp;
            swaps++;
            i = smallest;
        }
    }

    // 自底向上建堆：从最后一个非叶节点倒序逐个下沉，总计 O(n)
    static int buildHeap(int[] heap) {
        int swaps = 0;
        for (int i = heap.length / 2 - 1; i >= 0; i--) {
            swaps += siftDown(heap, heap.length, i);
        }
        return swaps;
    }

    public static void main(String[] args) {
        int[] data = {9, 4, 7, 1, 8, 3, 5};
        int swaps = buildHeap(data);
        System.out.println("建堆后（小顶堆）：" + Arrays.toString(data));
        System.out.println("建堆总交换次数：" + swaps + "（自底向上约 O(n)，逐个 push 则要 O(n log n)）");

        // Top-K：流式到来，堆里只保留"当前最大的 K 个"
        int[] stream = {5, 12, 3, 20, 8, 15, 1, 9};
        int k = 3;
        int[] top = Arrays.copyOf(stream, k); // 先放前 k 个
        buildHeap(top);                       // 建成小顶堆，top[0] 是 K 个里最小的
        for (int i = k; i < stream.length; i++) {
            if (stream[i] > top[0]) { // 比"守门员"大，才有资格进前 K
                top[0] = stream[i];
                siftDown(top, k, 0);
            }
        }
        Arrays.sort(top);
        System.out.println("流中最大的 " + k + " 个：" + Arrays.toString(top));
    }
}
