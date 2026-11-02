package com.javaroadmap.algo.space;

/**
 * 空间复杂度分析与 JVM 内存结构
 * 对应《Hello 算法》第 2 章 2.4 节
 *
 * 内存分布心智模型：
 * 1. 栈空间（Stack）：方法调用的局部变量、操作数栈、方法返回地址。
 * 2. 堆空间（Heap）：动态分配的对象实例、数组。
 *
 * 常见空间复杂度：
 * - O(1)：仅使用固定数量的辅助标量变量。
 * - O(n)：申请与输入规模 n 成正比的数组或对象集合。
 * - O(n)（递归栈）：递归深度达到 n 层。
 */
public class App {

    // 辅助空间 O(1)
    public static int constantSpace(int[] arr) {
        int maxVal = Integer.MIN_VALUE;
        for (int v : arr) {
            if (v > maxVal) maxVal = v;
        }
        return maxVal;
    }

    // 辅助空间 O(n)：堆中动态创建大小为 n 的数组
    public static int[] linearSpace(int n) {
        int[] buffer = new int[n];
        for (int i = 0; i < n; i++) {
            buffer[i] = i * i;
        }
        return buffer;
    }

    // 递归栈深度 O(n)
    public static void recursiveStack(int depth) {
        if (depth <= 0) return;
        recursiveStack(depth - 1);
    }

    public static void main(String[] args) {
        System.out.println("=== 空间复杂度与内存分布 ===");
        int[] sample = {3, 7, 2, 9, 5};
        System.out.println("O(1) 辅助空间最大值：" + constantSpace(sample));

        int n = 5;
        int[] squares = linearSpace(n);
        System.out.println("O(n) 堆空间数组长度：" + squares.length);

        recursiveStack(10);
        System.out.println("O(n) 递归调用深度已达 10 层并安全返回");

        System.out.println("空间优化准则：能原地（In-place）修改的尽量避免开辟新容器。");
    }
}
