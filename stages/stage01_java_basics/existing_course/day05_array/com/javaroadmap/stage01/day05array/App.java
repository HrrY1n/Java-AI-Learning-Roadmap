package com.javaroadmap.stage01.day05array;

/** 知识点：数组。 */
public class App {
    public static void main(String[] args) {
        int[] scores = {90, 85, 76, 100};


        System.out.println("第一个分数：" + scores[0]);

        System.out.println("数组长度：" + scores.length);

        int sum = 0;
        // 使用 for 循环遍历数组，下标从 0 到 scores.length - 1。
        for (int i = 0; i < scores.length; i++) {
            sum = sum + scores[i];
        }

        // sum * 1.0 可以把整数计算变成小数计算，避免平均值只保留整数。
        double average = sum * 1.0 / scores.length;
        System.out.println("总分：" + sum);
        System.out.println("平均分：" + average);
    }
}
