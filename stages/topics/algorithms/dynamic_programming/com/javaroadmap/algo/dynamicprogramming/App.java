package com.javaroadmap.algo.dynamicprogramming;

import java.util.Arrays;

/**
 * 动态规划：重叠子问题与最优子结构
 * 对应《Hello 算法》第 14 章
 */
public class App {

    // 爬楼梯：f(n) = f(n-1) + f(n-2)，自底向上填表
    static int climbStairs(int n) {
        if (n <= 2) return n;
        int[] dp = new int[n + 1];
        dp[1] = 1;
        dp[2] = 2;
        for (int i = 3; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        return dp[n];
    }

    // 零钱兑换：凑出 amount 的最少硬币数，凑不出返回 -1
    static int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1); // 初值表示“尚不可达”
        dp[0] = 0;
        for (int coin : coins) {
            for (int i = coin; i <= amount; i++) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }

    public static void main(String[] args) {
        System.out.println("爬楼梯 f(10)：" + climbStairs(10));
        System.out.println("零钱兑换 coins=[1,5,11] amount=15：" + coinChange(new int[]{1, 5, 11}, 15));
        System.out.println("零钱兑换 coins=[2] amount=3（凑不出）：" + coinChange(new int[]{2}, 3));
        System.out.println("核心机制：把指数级暴力递归改为按依赖顺序填表，每个子问题只计算一次。");
    }
}
