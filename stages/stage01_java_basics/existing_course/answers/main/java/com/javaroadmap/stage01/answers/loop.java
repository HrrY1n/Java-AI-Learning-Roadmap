package com.javaroadmap.stage01.answers;

import java.util.Scanner;

public class loop {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        while (true) {
            System.out.println("===== Java 学习菜单 =====");
            System.out.println("1. 打招呼");
            System.out.println("2. 查看学习目标");
            System.out.println("0. 退出");
            System.out.print("请输入你的选择：");

            int choice = scanner.nextInt();

            switch (choice) {
                case 1:
                    System.out.println("你好，欢迎学习 Java！");
                    break;
                case 2:
                    System.out.println("今天的学习目标：掌握变量、判断、循环和方法。");
                    break;
                case 0:
                    System.out.println("程序已退出。");
                    scanner.close();
                    return;
                default:
                    System.out.println("输入错误，请重新输入。");
                    break;
            }

            System.out.println();
        }
    }
}