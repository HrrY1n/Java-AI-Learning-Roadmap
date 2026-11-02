package com.javaroadmap.algo.heap;

import java.util.ArrayList;
import java.util.List;

/**
 * 数组实现小顶堆与优先队列
 * 对应《Hello 算法》第 8 章
 */
public class App {

    static class MinHeap {
        private final List<Integer> heap = new ArrayList<>();

        int size() {
            return heap.size();
        }

        void push(int val) {
            heap.add(val);
            int i = heap.size() - 1;
            while (i > 0) { // 自底向上堆化：与父节点比较交换
                int parent = (i - 1) / 2;
                if (heap.get(parent) <= heap.get(i)) break;
                swap(i, parent);
                i = parent;
            }
        }

        int pop() {
            if (heap.isEmpty()) {
                throw new IllegalStateException("堆为空");
            }
            int top = heap.get(0);
            int last = heap.remove(heap.size() - 1);
            if (!heap.isEmpty()) {
                heap.set(0, last);
                int i = 0;
                while (true) { // 自顶向下堆化：与较小子节点交换
                    int l = 2 * i + 1;
                    int r = 2 * i + 2;
                    int smallest = i;
                    if (l < heap.size() && heap.get(l) < heap.get(smallest)) smallest = l;
                    if (r < heap.size() && heap.get(r) < heap.get(smallest)) smallest = r;
                    if (smallest == i) break;
                    swap(i, smallest);
                    i = smallest;
                }
            }
            return top;
        }

        private void swap(int a, int b) {
            int t = heap.get(a);
            heap.set(a, heap.get(b));
            heap.set(b, t);
        }
    }

    public static void main(String[] args) {
        MinHeap heap = new MinHeap();
        int[] input = {7, 2, 9, 4, 1};
        StringBuilder in = new StringBuilder();
        for (int v : input) {
            heap.push(v);
            in.append(v).append(' ');
        }
        StringBuilder out = new StringBuilder();
        while (heap.size() > 0) {
            out.append(heap.pop()).append(' ');
        }
        System.out.println("入堆顺序：" + in.toString().trim());
        System.out.println("依次出堆（升序）：" + out.toString().trim());
        System.out.println("核心机制：完全二叉树用数组存储，父子下标满足 2i+1 与 2i+2，pop 恒取最小。");
    }
}
