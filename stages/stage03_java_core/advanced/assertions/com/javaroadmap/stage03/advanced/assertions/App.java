package com.javaroadmap.stage03.advanced.assertions;

/**
 * 断言与防御式校验：让代码自己报告“我算错了”。
 * 对应《On Java 8》第 16 章（代码校验）的入门部分。
 *
 * 两道防线职责不同：
 * 前置条件（IllegalArgumentException）守入口，永远生效；
 * assert 守内部不变量，只在 java -ea 下启用，不替代参数校验。
 */
public class App {

    // 前置条件：公开方法先验证参数，失败立刻抛异常
    static double bmi(double weightKg, double heightM) {
        if (weightKg <= 0 || heightM <= 0) {
            throw new IllegalArgumentException("体重与身高必须为正数：" + weightKg + ", " + heightM);
        }
        return weightKg / (heightM * heightM);
    }

    // 后置条件：结果合理性由 assert 复核——只在 -ea 下生效
    static double approximateSqrt(double x) {
        double r = x;
        for (int i = 0; i < 20; i++) {
            r = (r + x / r) / 2; // 牛顿迭代逼近平方根
        }
        assert Math.abs(r * r - x) < 1e-6 : "牛顿迭代结果不合理：r=" + r;
        return r;
    }

    public static void main(String[] args) {
        boolean assertionsOn = false;
        assert assertionsOn = true; // 利用断言副作用探测 -ea 是否启用
        System.out.println("断言状态：" + (assertionsOn ? "开启" : "关闭（用 java -ea 重新运行观察区别）"));

        // 最小自测：把“输入 → 期望输出”写进用例表，改代码后重跑
        double[][] cases = {{60, 1.7}, {80, 1.8}};
        double[] expected = {20.76, 24.69}; // 与实现无关的独立期望值
        int failed = 0;
        for (int i = 0; i < cases.length; i++) {
            double actual = bmi(cases[i][0], cases[i][1]);
            if (Math.abs(actual - expected[i]) > 0.01) {
                System.out.println("自测失败：用例 " + i);
                failed++;
            }
        }
        System.out.println("最小自测：2 个用例，失败 " + failed + " 个");

        System.out.println("√2 ≈ " + approximateSqrt(2));

        try {
            bmi(-50, 1.7);
        } catch (IllegalArgumentException e) {
            System.out.println("前置条件拦截：" + e.getMessage());
        }
    }
}
