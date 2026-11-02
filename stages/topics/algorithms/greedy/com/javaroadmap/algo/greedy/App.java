package com.javaroadmap.algo.greedy;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 贪心：每一步取局部最优
 * 对应《Hello 算法》第 15 章
 */
public class App {

    // 活动选择：按结束时间贪心，选出最多的互不重叠区间
    static List<int[]> selectActivities(int[][] activities) {
        Arrays.sort(activities, (x, y) -> x[1] - y[1]); // 贪心策略：最早结束优先
        List<int[]> selected = new ArrayList<>();
        int lastEnd = Integer.MIN_VALUE;
        for (int[] act : activities) {
            if (act[0] >= lastEnd) {
                selected.add(act);
                lastEnd = act[1];
            }
        }
        return selected;
    }

    public static void main(String[] args) {
        int[][] activities = {{1, 4}, {3, 5}, {0, 6}, {5, 7}, {8, 9}};
        List<int[]> selected = selectActivities(activities);
        StringBuilder out = new StringBuilder();
        for (int[] a : selected) {
            out.append("[").append(a[0]).append(",").append(a[1]).append("] ");
        }
        System.out.println("选中活动数：" + selected.size());
        System.out.println("选中活动：" + out.toString().trim());
        System.out.println("边界提醒：贪心需要可证明的贪心策略；找零问题在任意币制下不一定最优（如币制 1,3,4 凑 6）。");
    }
}
