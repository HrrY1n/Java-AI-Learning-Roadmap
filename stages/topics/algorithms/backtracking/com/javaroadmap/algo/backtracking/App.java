package com.javaroadmap.algo.backtracking;

import java.util.ArrayList;
import java.util.List;

/**
 * 回溯：路径 + 选择列表 + 撤销选择
 * 对应《Hello 算法》第 13 章
 */
public class App {

    // 全排列：used 标记已用元素，做选择 → 递归 → 撤销选择
    static void permute(int[] nums, boolean[] used, List<Integer> path, List<String> result) {
        if (path.size() == nums.length) {
            result.add(path.toString());
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue; // 剪枝：跳过已在路径中的元素
            used[i] = true;
            path.add(nums[i]);
            permute(nums, used, path, result);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }

    // 子集：每个节点本身就是一个解，向后扩展避免重复
    static void subsets(int[] nums, int start, List<Integer> path, List<String> result) {
        result.add(path.toString());
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            subsets(nums, i + 1, path, result);
            path.remove(path.size() - 1);
        }
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 3};
        List<String> perms = new ArrayList<>();
        permute(nums, new boolean[nums.length], new ArrayList<>(), perms);
        List<String> subs = new ArrayList<>();
        subsets(nums, 0, new ArrayList<>(), subs);
        System.out.println("全排列共 " + perms.size() + " 个，其中两个：" + perms.get(0) + " 与 " + perms.get(perms.size() - 1));
        System.out.println("子集共 " + subs.size() + " 个");
        System.out.println("模板要点：做选择 → 递归 → 撤销选择；剪枝提前排除无效分支。");
    }
}
