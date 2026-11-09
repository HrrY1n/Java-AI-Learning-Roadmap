package com.javaroadmap.algo.knapsack;

import java.util.Arrays;

/**
 * 动态规划实战：0-1 背包与完全背包。
 * 对应《Hello 算法》14.4、14.5 节。
 *
 * 场景：背包容量有限，每件物品有重量与价值——拿什么让总价值最大？
 * 0-1 背包每件至多拿一次；完全背包每件可以拿任意多次。
 */
public class App {

    // 0-1 背包（纯算法）：dp[i][c] = 前 i 件物品、容量 c 下的最大价值。
    // 只计算不输出——返回完整 DP 表，最大价值就是最后一格，便于独立测试与复用。
    static int[][] knapsack01Table(int[] weights, int[] values, int cap) {
        int[][] dp = new int[weights.length + 1][cap + 1];
        for (int i = 1; i <= weights.length; i++) {
            for (int c = 0; c <= cap; c++) {
                dp[i][c] = dp[i - 1][c]; // 不拿第 i 件
                if (weights[i - 1] <= c) { // 拿得起才考虑拿：价值 = 去掉它后的最优 + 本件价值
                    int take = dp[i - 1][c - weights[i - 1]] + values[i - 1];
                    if (take > dp[i][c]) dp[i][c] = take;
                }
            }
        }
        return dp;
    }

    // 最大价值 = DP 表最后一格；打表观察属于入口层职责（见 main）。
    static int knapsack01(int[] weights, int[] values, int cap) {
        int[][] dp = knapsack01Table(weights, values, cap);
        return dp[weights.length][cap];
    }

    // 完全背包：滚动到一行；内层正序遍历，dp[c - w] 是"本行"，同一物品可重复拿
    static int unboundedKnapsack(int[] weights, int[] values, int cap) {
        int[] dp = new int[cap + 1];
        for (int i = 0; i < weights.length; i++) {
            for (int c = weights[i]; c <= cap; c++) {
                dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);
            }
        }
        return dp[cap];
    }

    public static void main(String[] args) {
        int[] weights = {1, 2, 3, 4};
        int[] values = {10, 15, 40, 30};
        int cap = 5;
        System.out.println("0-1 背包 DP 表（行=前 i 件物品，列=容量 c）：");
        for (int[] row : knapsack01Table(weights, values, cap)) {
            System.out.println("  " + Arrays.toString(row));
        }
        System.out.println("0-1 背包最大价值：" + knapsack01(weights, values, cap));

        int[] w2 = {2, 3};
        int[] v2 = {3, 4};
        System.out.println("完全背包（重 {2,3} 价值 {3,4}，容量 7）最大价值："
                + unboundedKnapsack(w2, v2, 7));
    }
}
