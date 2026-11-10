package com.javaroadmap.algo.editdistance;

import java.util.Arrays;

/**
 * 动态规划实战：编辑距离（把一个单词改成另一个所需的最少操作数）。
 * 对应《Hello 算法》14.6 节。
 *
 * 场景：搜索框纠错、git diff 的最小差异——本质都是"两个序列有多像"。
 * 三种操作：插入、删除、替换一个字符。
 */
public class App {

    // 编辑距离（纯算法）：返回完整 DP 表，dp[m][n] 即最少操作数；只计算不输出。
    static int[][] editDistanceTable(String s, String t) {
        int m = s.length(), n = t.length();
        // dp[i][j] = s 的前 i 个字符变成 t 的前 j 个字符的最少操作数
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i; // 变成空串：只能一路删除
        for (int j = 0; j <= n; j++) dp[0][j] = j; // 从空串变来：只能一路插入
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (s.charAt(i - 1) == t.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1]; // 末字符相同：这一步不用操作
                } else {
                    int edit = Math.min(dp[i][j - 1], dp[i - 1][j]); // 插入 / 删除
                    dp[i][j] = 1 + Math.min(edit, dp[i - 1][j - 1]); // 或替换
                }
            }
        }
        return dp;
    }

    static int editDistance(String s, String t) {
        int[][] dp = editDistanceTable(s, t);
        return dp[s.length()][t.length()];
    }

    public static void main(String[] args) {
        // 打表观察属于入口层职责：先看 DP 表怎么长出来，再看最终答案。
        for (int[] row : editDistanceTable("horse", "ros")) {
            System.out.println("  " + Arrays.toString(row));
        }
        System.out.println("horse → ros 的编辑距离：" + editDistance("horse", "ros"));
    }
}
