package com.javaroadmap.algo.binarysearch;

/**
 * 二分查找与插入点
 * 对应《Hello 算法》第 10 章
 */
public class App {

    // 标准二分：找到返回下标，找不到返回 -1
    static int binarySearch(int[] sorted, int target) {
        int lo = 0;
        int hi = sorted.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (sorted[mid] == target) return mid;
            if (sorted[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }

    // 查找插入点：返回第一个大于等于 target 的下标
    static int searchInsertPoint(int[] sorted, int target) {
        int lo = 0;
        int hi = sorted.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (sorted[mid] < target) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }

    public static void main(String[] args) {
        int[] sorted = {1, 3, 5, 7, 9, 11};
        System.out.println("查找 7 的下标：" + binarySearch(sorted, 7));
        System.out.println("查找 4 的结果（不存在）：" + binarySearch(sorted, 4));
        System.out.println("4 的插入点下标：" + searchInsertPoint(sorted, 4));
        System.out.println("12 的插入点下标：" + searchInsertPoint(sorted, 12));
        System.out.println("边界提醒：二分只适用于有序数组，mid 必须用 lo+(hi-lo)/2 防止整型溢出。");
    }
}
