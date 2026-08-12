package com.javaroadmap.stage01.answers;

/** 成绩统计练习参考答案。 */
public class ScoreStatisticsAnswer {
    public static void main(String[] args) {
        int[] scores = {78, 90, 66, 100, 59};

        int total = 0;
        int max = scores[0];
        int min = scores[0];
        int passCount = 0;

        for (int i = 0; i < scores.length; i++) {
            total = total + scores[i];

            if (scores[i] > max) {
                max = scores[i];
            }

            if (scores[i] < min) {
                min = scores[i];
            }

            if (scores[i] >= 60) {
                passCount++;
            }
        }

        System.out.println("总分：" + total);
        System.out.println("平均分：" + total * 1.0 / scores.length);
        System.out.println("最高分：" + max);
        System.out.println("最低分：" + min);
        System.out.println("及格人数：" + passCount);
    }
}

