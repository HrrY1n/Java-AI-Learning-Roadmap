package com.javaroadmap.stage01.answers;

import java.util.InputMismatchException;
import java.util.Scanner;

/**
 * 练习 3"循环菜单"参考答案：满足题面全部验收——
 * 非法数字与非数字都反馈后回到菜单，坏记号被消费，0 正常退出，全程不崩溃。
 *
 * 与旧版 loop.java 的差别：旧版裸 nextInt() 输入字母直接抛异常崩溃，
 * 且退出措辞与用例契约不一致；新版用"先问再读 + 捕获后消费坏记号"双防线。
 */
public class LearningMenuAnswer {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        while (true) {
            System.out.println("===== Java 学习菜单 =====");
            System.out.println("1. 打招呼");
            System.out.println("2. 查看学习目标");
            System.out.println("0. 退出");
            System.out.print("请输入你的选择：");

            int choice;
            try {
                choice = scanner.nextInt();
            } catch (InputMismatchException e) {
                // 非数字记号：提示 + 消费坏记号（否则它永远堵在缓冲区里）。
                System.out.println("没有这个选项，请重新输入");
                scanner.next();
                continue;
            }

            switch (choice) {
                case 1:
                    System.out.println("你好，欢迎学习 Java！");
                    break;
                case 2:
                    System.out.println("今天的学习目标：掌握变量、判断、循环和方法。");
                    break;
                case 0:
                    System.out.println("程序结束。");
                    scanner.close();
                    return;
                default:
                    System.out.println("没有这个选项，请重新输入");
                    break;
            }

            System.out.println();
        }
    }
}
