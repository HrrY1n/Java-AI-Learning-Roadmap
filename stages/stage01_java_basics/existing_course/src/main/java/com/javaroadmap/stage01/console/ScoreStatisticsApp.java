package com.javaroadmap.stage01.console;

/** 成绩统计小程序。 */
public class ScoreStatisticsApp {
    public static void main(String[] args) {
        int[] scores = {88, 92, 67, 100, 55};

        int total = calculateTotal(scores);
        int max = findMax(scores);
        int min = findMin(scores);
        int passCount = countPass(scores);
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

