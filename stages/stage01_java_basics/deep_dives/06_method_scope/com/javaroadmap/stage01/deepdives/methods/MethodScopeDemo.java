package com.javaroadmap.stage01.deepdives.methods;

/**
 * 深化课 06：方法、作用域与"一个方法一件事"。
 *
 * 场景：day06 学了方法语法；ScoreStatisticsApp 演示了拆分。本课回答两个
 * 更深的问题：① 为什么变量出了方法就"不存在"？② 拆方法的判断标准是什么？
 *
 * 心智模型：每个方法调用都会创建一块独立的"局部变量区"（栈帧），
 * 方法返回时整块销毁。所以局部变量天然私有于"这一次调用"。
 * 判断要不要拆方法：能否用一句话说清"这个方法做什么"——说不清就拆。
 *
 * Observe：先预测编译结果与输出，再运行。
 */
public class MethodScopeDemo {
    // 类级变量（字段）：属于类，所有方法可见，生命周期与类相同。
    static int callCount = 0;

    public static void main(String[] args) {
        int total = add(3, 4);
        // System.out.println(a + b);   // 取消注释会编译失败：a、b 只存在于 add 的那一次调用里
        System.out.println("1) total = " + total);

        total = add(10, 20);            // 同一个方法再次调用，又是全新的一块局部变量区
        System.out.println("2) total = " + total);

        System.out.println("3) callCount = " + callCount);
        describe(88);
        describe(55);
        System.out.println("4) callCount = " + callCount);
    }

    static int add(int a, int b) {
        int sum = a + b;                // sum、a、b 都是"这次调用"的局部变量
        return sum;                     // 返回的是值的副本，sum 随方法结束销毁
    }

    // "一个方法一件事"：describe 只负责"打印一条评语"，它调用 grade 而不是自己判分。
    static void describe(int score) {
        callCount++;                    // 类级变量在所有方法间共享
        System.out.println("第 " + callCount + " 次评价：" + grade(score));
    }

    // grade 只做一件事：分数 -> 评语。改评语规则时只动这里，describe 不用看。
    static String grade(int score) {
        if (score >= 90) {
            return "优秀";
        } else if (score >= 60) {
            return "及格";
        }
        return "不及格";
    }
}
