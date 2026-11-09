package com.javaroadmap.algo.complexity;

/**
 * 算法效率评估与渐近复杂度分析
 * 对应《Hello 算法》第 2 章 2.1 节
 *
 * 核心思考：
 * 1. 为什么不能仅靠「实际运行计时」评价算法好坏？
 *    - 硬件平台差异大（不同 CPU、内存架构测得结果不一致）
 *    - 输入规模小时可能产生相反结论
 * 2. 渐近复杂度（Asymptotic Analysis）关注随着数据规模 n 增大时，计算资源的增长趋势。
 */
public class App {

    // 算法 A：累加求和 O(n)
    public static long sumLinear(long n) {
        long sum = 0;
        for (long i = 1; i <= n; i++) {
            sum += i;
        }
        return sum;
    }

    // 算法 B：高斯公式求和 O(1)
    // 边界提醒：n*(n+1) 在 long 下约 n > 4.3e9 就会溢出——O(1) 只描述步数，不代表任意输入都安全
    public static long sumConstant(long n) {
        return n * (n + 1) / 2;
    }

    public static void main(String[] args) {
        System.out.println("=== 算法效率评估与渐近复杂度 ===");
        long n = 1000L;

        long resultA = sumLinear(n);
        long resultB = sumConstant(n);

        System.out.println("线性累加 O(n) 结果：" + resultA);
        System.out.println("数学公式 O(1) 结果：" + resultB);
        System.out.println("计算结果一致性：" + (resultA == resultB));

        // 观察：当 n 从 1,000 放大到 1,000,000,000 时，
        // O(n) 的运算次数同步放大 100 万倍，而 O(1) 仍是恒定 3 次基础运算。
        System.out.println("复杂度启示：选择更优渐近复杂度的算法，在规模扩大时有质的差距。");
    }
}
