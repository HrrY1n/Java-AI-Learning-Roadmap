package com.javaroadmap.algo.bigo;

/**
 * 常见时间复杂度与大 O 阶梯
 * 对应《Hello 算法》第 2 章 2.3 节
 *
 * 阶梯排列（效率从高到低）：
 * O(1) 常数阶 < O(log n) 对数阶 < O(n) 线性阶 < O(n log n) 线性对数阶 < O(n^2) 平方阶 < O(2^n) 指数阶
 */
public class App {

    // O(1) 常数阶：操作次数与输入规模 n 无关
    public static int constantOrder(int[] arr) {
        if (arr == null || arr.length == 0) return 0;
        return arr[0];
    }

    // O(log n) 对数阶：每次迭代将问题规模减半（如二分法）
    public static int logOrder(int n) {
        int count = 0;
        while (n > 1) {
            n /= 2;
            count++;
        }
        return count;
    }

    // O(n) 线性阶：遍历单层规模
    public static int linearOrder(int n) {
        int count = 0;
        for (int i = 0; i < n; i++) {
            count++;
        }
        return count;
    }

    // O(n^2) 平方阶：两层嵌套循环（常见于简单冒泡、选择排序）
    public static int quadraticOrder(int n) {
        int count = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                count++;
            }
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println("=== 常见时间复杂度阶梯 ===");
        int n = 16;
        int[] data = {42, 10, 88};

        System.out.println("O(1) 常数阶首元素：" + constantOrder(data));
        System.out.println("O(log n) 折半步数(n=" + n + ")：" + logOrder(n));
        System.out.println("O(n) 线性步数(n=" + n + ")：" + linearOrder(n));
        System.out.println("O(n^2) 平方步数(n=" + n + ")：" + quadraticOrder(n));

        System.out.println("大 O 规则：忽略低阶项与常数系数，保留最高阶增长趋势。");
    }
}
