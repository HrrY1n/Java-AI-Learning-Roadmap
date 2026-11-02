package com.javaroadmap.algo.sorting;

import java.util.Arrays;

/**
 * 基础排序与分治排序
 * 对应《Hello 算法》第 11 章
 */
public class App {

    // 冒泡排序：相邻比较交换，最大值逐轮“冒”到末尾
    static void bubbleSort(int[] a) {
        for (int i = a.length - 1; i > 0; i--) {
            boolean swapped = false;
            for (int j = 0; j < i; j++) {
                if (a[j] > a[j + 1]) {
                    int t = a[j];
                    a[j] = a[j + 1];
                    a[j + 1] = t;
                    swapped = true;
                }
            }
            if (!swapped) break; // 一轮无交换说明已有序，提前退出
        }
    }

    // 插入排序：像整理扑克牌，把新元素插入左侧已排序区间
    static void insertionSort(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int base = a[i];
            int j = i - 1;
            while (j >= 0 && a[j] > base) {
                a[j + 1] = a[j];
                j--;
            }
            a[j + 1] = base;
        }
    }

    // 快速排序：选基准划分两侧，再递归处理子区间
    static void quickSort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int pivot = a[lo];
        int i = lo;
        int j = hi;
        while (i < j) {
            while (i < j && a[j] >= pivot) j--;
            while (i < j && a[i] <= pivot) i++;
            int t = a[i];
            a[i] = a[j];
            a[j] = t;
        }
        a[lo] = a[i];
        a[i] = pivot;
        quickSort(a, lo, i - 1);
        quickSort(a, i + 1, hi);
    }

    // 归并排序：分到最小，再按序合并（稳定）
    static void mergeSort(int[] a, int lo, int hi, int[] tmp) {
        if (lo >= hi) return;
        int mid = lo + (hi - lo) / 2;
        mergeSort(a, lo, mid, tmp);
        mergeSort(a, mid + 1, hi, tmp);
        int i = lo;
        int j = mid + 1;
        int k = lo;
        while (i <= mid && j <= hi) {
            tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
        }
        while (i <= mid) tmp[k++] = a[i++];
        while (j <= hi) tmp[k++] = a[j++];
        System.arraycopy(tmp, lo, a, lo, hi - lo + 1);
    }

    public static void main(String[] args) {
        int[] original = {5, 2, 9, 1, 7, 3};
        int[] a = original.clone();
        bubbleSort(a);
        System.out.println("冒泡排序：" + Arrays.toString(a));
        a = original.clone();
        insertionSort(a);
        System.out.println("插入排序：" + Arrays.toString(a));
        a = original.clone();
        quickSort(a, 0, a.length - 1);
        System.out.println("快速排序：" + Arrays.toString(a));
        a = original.clone();
        mergeSort(a, 0, a.length - 1, new int[a.length]);
        System.out.println("归并排序：" + Arrays.toString(a));
        System.out.println("稳定性提醒：冒泡/插入/归并稳定，快排不稳定；快排平均 O(n log n)、最坏 O(n^2)。");
    }
}
