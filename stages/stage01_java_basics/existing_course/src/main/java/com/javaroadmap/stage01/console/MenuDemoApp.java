package com.javaroadmap.stage01.console;

import java.util.Scanner;

/** 控制台菜单示例。 */
public class MenuDemoApp {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        while (true) {
            printMenu();
            int choice = scanner.nextInt();

            switch (choice) {
                case 1:
                    System.out.println("你好，欢迎学习 Java 后端。");
                    break;
                case 2:
                    System.out.println("当前目标：先打牢 Java 基础，再进入 MySQL 和 Spring Boot。");
                    break;
                case 0:
                    System.out.println("程序结束。");
                    scanner.close();
                    return;
                default:
                    System.out.println("没有这个选项，请重新输入。");
                    break;
            }
        }
    }

    public static void printMenu() {
        System.out.println();
        System.out.println("=== Java 学习菜单 ===");
        System.out.println("1. 打招呼");
        System.out.println("2. 查看学习目标");
        System.out.println("0. 退出");
        System.out.print("请选择：");
    }
}

