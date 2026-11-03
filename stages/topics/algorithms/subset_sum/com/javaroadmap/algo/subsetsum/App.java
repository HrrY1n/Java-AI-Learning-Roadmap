package com.javaroadmap.algo.subsetsum;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 回溯实战：子集和问题（找出所有和为 target 的组合）。
 * 对应《Hello 算法》13.3 节。
 *
 * 回溯的统一模式：做选择 → 递归 → 撤销选择；
 * N 皇后（13.4）只是把"选择"换成"在哪一列放皇后"，框架完全相同。
 */
public class App {

    static void backtrack(int[] nums, int start, int remaining,
                          List<Integer> chosen, List<String> solutions) {
        if (remaining == 0) { // 剩余额度刚好用完：得到一个解
            solutions.add(chosen.toString());
            return;
        }
        for (int i = start; i < nums.length; i++) {
            if (nums[i] > remaining) break; // 数组已排序：后面只会更大，剪掉整段
            if (i > start && nums[i] == nums[i - 1]) continue; // 同一层跳过重复值，避免重复解
            chosen.add(nums[i]);                              // 做选择
            backtrack(nums, i + 1, remaining - nums[i], chosen, solutions); // 只向后选：元素不重复用
            chosen.remove(chosen.size() - 1);                 // 撤销选择，尝试下一个
        }
    }

    public static void main(String[] args) {
        int[] nums = {1, 1, 2, 3, 5};
        int target = 4;
        Arrays.sort(nums); // 排序是剪枝和去重的前提
        List<String> solutions = new ArrayList<>();
        backtrack(nums, 0, target, new ArrayList<>(), solutions);
        System.out.println("和为 " + target + " 的组合共 " + solutions.size() + " 个：");
        for (String s : solutions) {
            System.out.println("  " + s);
        }
    }
}
