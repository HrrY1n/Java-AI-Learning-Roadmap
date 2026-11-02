package com.javaroadmap.algo.divideconquer;

import java.util.Arrays;

/**
 * 分治策略：分解 → 解决 → 合并
 * 对应《Hello 算法》第 12 章
 */
public class App {

    // 分治求区间和：分解为左右两半分别求和，合并即相加
    static long rangeSum(int[] a, int lo, int hi, int[] depth) {
        if (lo == hi) return a[lo]; // 基线：单个元素直接返回
        int mid = lo + (hi - lo) / 2;
        depth[0]++;
        return rangeSum(a, lo, mid, depth) + rangeSum(a, mid + 1, hi, depth);
    }

    // 归并排序是分治的经典落地：分到最小，再有序合并
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
        int[] data = {8, 3, 5, 1, 9, 2};
        int[] depth = {0};
        long sum = rangeSum(data, 0, data.length - 1, depth);
        System.out.println("分治求和 8+3+5+1+9+2 = " + sum);
        System.out.println("递归分解次数：" + depth[0]);
        int[] sorted = data.clone();
        mergeSort(sorted, 0, sorted.length - 1, new int[sorted.length]);
        System.out.println("分治排序结果：" + Arrays.toString(sorted));
        System.out.println("三步模型：把问题分解成子问题，分别求解，再把子解合并成原问题的解。");
    }
}
