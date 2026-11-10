package com.javaroadmap.stage01.answers;

/**
 * 练习 1"成绩统计"参考答案：满足题面全部验收——
 * 求和/最值/计数各写成独立方法，空数组先处理（打印提示后结束，不取 scores[0]）。
 *
 * 验证方式：把 main 里的数组依次换成练习三组用例（正常/单元素/空）编译运行，
 * 与网站练习的预期输出逐行比对。
 */
public class ScoreStatisticsAnswer {
    public static void main(String[] args) {
        int[] scores = {88, 92, 67, 100, 55};

        if (scores.length == 0) {
            // 空数组的处理放在入口：任何"取第一个"的方法都不该收到空数组。
            System.out.println("暂无成绩数据");
            return;
        }

        System.out.println("总分：" + totalOf(scores));
        System.out.println("平均分：" + averageOf(scores));
        System.out.println("最高分：" + maxOf(scores));
        System.out.println("最低分：" + minOf(scores));
        System.out.println("及格人数：" + countPassed(scores, 60));
    }

    static int totalOf(int[] scores) {
        int total = 0;
        for (int i = 0; i < scores.length; i++) {
            total = total + scores[i];
        }
        return total;
    }

    static double averageOf(int[] scores) {
        // 乘 1.0 把整数除法变成小数除法（day02/deep02 的关键点）。
        return totalOf(scores) * 1.0 / scores.length;
    }

    static int maxOf(int[] scores) {
        int max = scores[0];
        for (int i = 1; i < scores.length; i++) {
            if (scores[i] > max) {
                max = scores[i];
            }
        }
        return max;
    }

    static int minOf(int[] scores) {
        int min = scores[0];
        for (int i = 1; i < scores.length; i++) {
            if (scores[i] < min) {
                min = scores[i];
            }
        }
        return min;
    }

    static int countPassed(int[] scores, int passLine) {
        int count = 0;
        for (int i = 0; i < scores.length; i++) {
            if (scores[i] >= passLine) {
                count++;
            }
        }
        return count;
    }
}
