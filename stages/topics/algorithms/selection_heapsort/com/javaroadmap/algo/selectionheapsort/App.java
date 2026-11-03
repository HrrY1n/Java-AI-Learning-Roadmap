package com.javaroadmap.algo.selectionheapsort;

import java.util.Arrays;

/**
 * 选择排序与堆排序：都是"每轮选出最值放到边界"，选法不同。
 * 对应《Hello 算法》11.2、11.7 节。
 *
 * 选择排序每轮线性扫描找最小值 O(n)；堆排序把"找最值"换成
 * 从大顶堆取堆顶 O(log n)，总复杂度从 O(n²) 降到 O(n log n)。
 */
public class App {

    static void selectionSort(int[] nums) {
        for (int i = 0; i < nums.length - 1; i++) {
            int min = i;
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[j] < nums[min]) min = j; // 内层扫描：只记录下标，不交换
            }
            int tmp = nums[i]; // 一轮只交换一次
            nums[i] = nums[min];
            nums[min] = tmp;
            System.out.println("第 " + (i + 1) + " 轮选出 " + nums[i] + " 后：" + Arrays.toString(nums));
        }
    }

    // 大顶堆下沉
    static void siftDown(int[] heap, int n, int i) {
        while (true) {
            int l = 2 * i + 1, r = 2 * i + 2, largest = i;
            if (l < n && heap[l] > heap[largest]) largest = l;
            if (r < n && heap[r] > heap[largest]) largest = r;
            if (largest == i) return;
            int tmp = heap[i];
            heap[i] = heap[largest];
            heap[largest] = tmp;
            i = largest;
        }
    }

    static void heapSort(int[] nums) {
        for (int i = nums.length / 2 - 1; i >= 0; i--) { // 自底向上建大顶堆 O(n)
            siftDown(nums, nums.length, i);
        }
        for (int end = nums.length - 1; end > 0; end--) {
            int tmp = nums[0]; // 堆顶（当前最大）换到末尾固定下来
            nums[0] = nums[end];
            nums[end] = tmp;
            siftDown(nums, end, 0); // 剩余前 end 个元素重新堆化
        }
    }

    public static void main(String[] args) {
        int[] a = {5, 2, 8, 2, 6};
        selectionSort(a);
        System.out.println("选择排序结果：" + Arrays.toString(a)
                + "（相等元素的相对顺序可能被打乱：不稳定）");

        int[] b = {5, 2, 8, 2, 6};
        heapSort(b);
        System.out.println("堆排序结果：" + Arrays.toString(b)
                + "（建堆 O(n) + n 次 O(log n) 取出）");
    }
}
