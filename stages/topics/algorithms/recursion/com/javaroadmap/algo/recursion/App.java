package com.javaroadmap.algo.recursion;

/**
 * 迭代与递归：控制流与调用栈开销
 * 对应《Hello 算法》第 2 章 2.2 节
 *
 * 核心心智模型：
 * - 迭代：在一个栈帧中通过变量变迁实现循环，空间复杂度通常为 O(1)。
 * - 递归：函数调用自身，每次调用创建新栈帧（保存局部变量、返回地址），递归深度为 d 则额外占用 O(d) 栈空间。
 */
public class App {

    // 迭代求和
    public static int sumByLoop(int n) {
        int res = 0;
        for (int i = 1; i <= n; i++) {
            res += i;
        }
        return res;
    }

    // 递归求和：终止条件（Base Case）+ 递推步骤
    public static int sumByRecursion(int n) {
        if (n <= 1) {
            return n;
        }
        return n + sumByRecursion(n - 1);
    }

    // 斐波那契递归观察（树状调用展开）
    public static int fib(int n) {
        if (n <= 0) return 0;
        if (n == 1) return 1;
        return fib(n - 1) + fib(n - 2);
    }

    public static void main(String[] args) {
        System.out.println("=== 迭代与递归原理对比 ===");
        int n = 10;
        int loopResult = sumByLoop(n);
        int recResult = sumByRecursion(n);

        System.out.println("迭代求和(1.." + n + ")：" + loopResult);
        System.out.println("递归求和(1.." + n + ")：" + recResult);
        System.out.println("斐波那契第 7 项：" + fib(7));

        // 观察提示：递归必须有严谨的终止条件；Java 默认栈深度约为数千到一万层，
        // 递归过深会触发 StackOverflowError。
        System.out.println("调用栈特性：递归更贴近分治数学定义，但每次深入都有压栈开销。");
    }
}
