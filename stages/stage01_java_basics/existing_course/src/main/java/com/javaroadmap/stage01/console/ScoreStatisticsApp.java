package com.javaroadmap.stage01.console;

/**
 * 参考示例 / Concept Card：方法拆分。
 * Scenario：统计逻辑全塞进 main 时，修改规则和定位错误都会越来越难。
 * Mental model：main 组织流程和少量结果组合；每个方法接收输入，只计算并返回一个明确结果。
 * Observe：先预测加入一个分数后哪些输出会变化，再运行验证；本示例假设数组非空。
 * Modify：把及格线改为 70，观察为什么只有及格人数的规则需要变化。
 * Exercise：独立设计“指定分数区间人数”方法，并先说明上下界是否包含。
 */
public class ScoreStatisticsApp {
    public static void main(String[] args) {
        int[] scores = {88, 92, 67, 100, 55};

        // 这里把流程留在 main，把每一种统计规则交给有名字的方法。
        int total = calculateTotal(scores);
        int max = findMax(scores);
        int min = findMin(scores);
        int passCount = countPass(scores);
        // 乘以 1.0 是为了使用浮点除法，避免整数除法丢失小数部分。
        double average = total * 1.0 / scores.length;

        System.out.println("总分：" + total);
        System.out.println("平均分：" + average);
        System.out.println("最高分：" + max);
        System.out.println("最低分：" + min);
        System.out.println("及格人数：" + passCount);
    }

    public static int calculateTotal(int[] scores) {
        int total = 0;
        for (int i = 0; i < scores.length; i++) {
            total = total + scores[i];
        }
        return total;
    }

    public static int findMax(int[] scores) {
        int max = scores[0];
        for (int i = 1; i < scores.length; i++) {
            if (scores[i] > max) {
                max = scores[i];
            }
        }
        return max;
    }

    public static int findMin(int[] scores) {
        int min = scores[0];
        for (int i = 1; i < scores.length; i++) {
            if (scores[i] < min) {
                min = scores[i];
            }
        }
        return min;
    }

    public static int countPass(int[] scores) {
        int count = 0;
        for (int i = 0; i < scores.length; i++) {
            if (scores[i] >= 60) {
                count++;
            }
        }
        return count;
    }
}
