package com.javaroadmap.algo.binaryboundary;

import java.util.Arrays;

/**
 * 二分查找的左右边界：重复元素找第一个/最后一个位置。
 * 对应《Hello 算法》10.3 节。
 *
 * 场景：日志文件按时间排序，查询"某秒内有多少条记录"——
 * 需要的不是"找到一条"，而是第一处和最后一处出现的位置。
 */
public class App {

    // 第一个等于 target 的下标：命中后不停，继续向左半段找
    static int findFirst(int[] nums, int target) {
        int left = 0, right = nums.length - 1, found = -1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] < target) {
                left = mid + 1;
            } else if (nums[mid] > target) {
                right = mid - 1;
            } else {
                found = mid;      // 先记下这个位置
                right = mid - 1;  // 但区间继续向左收缩
            }
        }
        return found;
    }

    // 最后一个等于 target 的下标：命中后区间继续向右收缩
    static int findLast(int[] nums, int target) {
        int left = 0, right = nums.length - 1, found = -1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] < target) {
                left = mid + 1;
            } else if (nums[mid] > target) {
                right = mid - 1;
            } else {
                found = mid;
                left = mid + 1;
            }
        }
        return found;
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 4, 4, 4, 5, 6, 6};
        System.out.println("数组：" + Arrays.toString(nums));

        int first = findFirst(nums, 4);
        int last = findLast(nums, 4);
        System.out.println("4 的首个下标=" + first + "，末个下标=" + last
                + "，共 " + (last - first + 1) + " 个");
        System.out.println("6 的首个下标=" + findFirst(nums, 6)
                + "，末个下标=" + findLast(nums, 6));
        System.out.println("3 的首个下标=" + findFirst(nums, 3) + "（不存在时为 -1）");
    }
}
