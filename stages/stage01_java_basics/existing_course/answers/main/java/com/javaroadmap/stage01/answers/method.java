package com.javaroadmap.stage01.answers;

public class method {
    public static void main(String[] args) {
        int[] scores = {78, 90, 66, 100, 59};

        int total = getTotal(scores);
        int max = getMax(scores);
        int min = getMin(scores);
        int passCount = getPassCount(scores);
        double average = getAverage(scores);

        System.out.println("总分：" + total);
        System.out.println("最高分：" + max);
        System.out.println("最低分：" + min);
        System.out.println("及格人数：" + passCount);
        System.out.println("平均分：" + average);
    }

    public static int getTotal(int[] scores) {
        int total = 0;

        for (int i = 0; i < scores.length; i++) {
            total = total + scores[i];
        }

        return total;
    }

    public static int getPassCount(int[] scores) {
        int passCount = 0;

        for (int i = 0; i < scores.length; i++) {
            if (scores[i] >= 60) {
                passCount++;
            }
        }

        return passCount;
    }

    public static int getMax(int[] scores) {
        int max = scores[0];

        for (int i = 0; i < scores.length; i++) {
            if (scores[i] > max) {
                max = scores[i];
            }
        }

        return max;
    }

    public static int getMin(int[] scores) {
        int min = scores[0];

        for (int i = 0; i < scores.length; i++) {
            if (scores[i] < min) {
                min = scores[i];
            }
        }

        return min;
    }

    public static double getAverage(int[] scores) {
        int total = getTotal(scores);
        return total * 1.0 / scores.length;
    }
}