package com.javaroadmap.algo.noncomparisonsort;

import java.util.Arrays;

/**
 * 计数排序与基数排序：不比较元素，靠"值计数"与"逐位分桶"。
 * 对应《Hello 算法》11.8 桶排序、11.9 计数排序、11.10 基数排序。
 *
 * 它们突破比较排序 O(n log n) 下界的前提：数据本身有可数的结构
 * （值域小、位数固定）；没有这个前提就退回比较排序。
 */
public class App {

    // 计数排序：值域 0..9 的整数，count[v] 数出现次数后按值展开
    static int[] countingSort(int[] nums) {
        int[] count = new int[10];
        for (int v : nums) count[v]++;
        int[] out = new int[nums.length];
        int idx = 0;
        for (int v = 0; v < count.length; v++) {
            for (int c = 0; c < count[v]; c++) out[idx++] = v;
        }
        return out;
    }

    // 基数排序（LSD）：按个位、十位……逐位做一次"稳定"排序
    static int[] radixSort(int[] nums) {
        String[] digitNames = {"个位", "十位", "百位", "千位"};
        int max = 0;
        for (int v : nums) max = Math.max(max, v);
        int[] out = nums;
        for (int exp = 1; max / exp > 0; exp *= 10) {
            out = countingSortByDigit(out, exp);
            System.out.println("按" + digitNames[Integer.numberOfTrailingZeros(exp)] + "分桶收集后：" + Arrays.toString(out));
        }
        return out;
    }

    // 用计数的思想给某一位排序：前缀和给出每个数字在结果中的"结束位置"
    static int[] countingSortByDigit(int[] nums, int exp) {
        int[] count = new int[10];
        for (int v : nums) count[(v / exp) % 10]++;
        for (int d = 1; d < 10; d++) count[d] += count[d - 1];
        int[] out = new int[nums.length];
        for (int i = nums.length - 1; i >= 0; i--) { // 从右往左放：同位相同者保持原有顺序
            int d = (nums[i] / exp) % 10;
            out[--count[d]] = nums[i];
        }
        return out;
    }

    public static void main(String[] args) {
        int[] scores = {3, 1, 4, 1, 5, 9, 2, 6};
        System.out.println("计数排序：" + Arrays.toString(countingSort(scores))
                + "（值域 0..9，时间 O(n+k)、空间 O(k)）");

        int[] ids = {329, 457, 657, 839, 436, 720, 355};
        System.out.println("原始：" + Arrays.toString(ids));
        System.out.println("基数排序：" + Arrays.toString(radixSort(ids))
                + "（位数固定 d 时为 O(d·(n+k))）");
    }
}
