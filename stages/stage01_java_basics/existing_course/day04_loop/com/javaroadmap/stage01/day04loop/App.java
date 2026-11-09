package com.javaroadmap.stage01.day04loop;

/**
 * 知识点：for 与 while——重复做事情的两种写法。
 *
 * 心智模型：for 把"起点/终点/步进"写在同一行，适合次数已知的重复；
 * while 只问"条件还成立吗"，适合次数未知、由条件决定何时停的重复。
 *
 * Observe：先预测三段输出，再运行核对。
 * Modify：把 1 到 100 改成 1 到 1000（预测和；对照高斯公式）；
 * 把 while 的 count-- 删掉再运行——它会怎样停？（想想怎么终止它。）
 */
public class App {
    public static void main(String[] args) {
        // for：次数已知——从 1 数到 5，步进 1。
        for (int i = 1; i <= 5; i++) {
            System.out.println("for 循环：" + i);
        }

        // 累加是循环最典型的用途：格子 sum 从 0 开始，每次"带上"一个新的 i。
        int sum = 0;
        for (int i = 1; i <= 100; i++) {
            sum = sum + i;
        }
        System.out.println("1 到 100 的和：" + sum);

        // while：条件先于动作——count 数到 0 时条件不成立，循环才停。
        int count = 3;
        while (count > 0) {
            System.out.println("while 倒计时：" + count);
            count--;
        }
    }
}
