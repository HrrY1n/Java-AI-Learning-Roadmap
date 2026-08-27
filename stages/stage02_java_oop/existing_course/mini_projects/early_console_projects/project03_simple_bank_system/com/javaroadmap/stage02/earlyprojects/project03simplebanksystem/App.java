package com.javaroadmap.stage02.earlyprojects.project03simplebanksystem;

import java.util.Scanner;

/** 项目：简单银行系统。 */
public class App {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Account account = new Account("小明", 100.0);

        while (true) {
            System.out.println();
            System.out.println("=== 简单银行系统 ===");
            System.out.println("1. 查看余额");
            System.out.println("2. 存钱");
            System.out.println("3. 取钱");
            System.out.println("0. 退出");
            System.out.print("请选择：");

            int choice = scanner.nextInt();

            if (choice == 1) {
                account.showBalance();
            } else if (choice == 2) {
                System.out.print("请输入存钱金额：");
                double money = scanner.nextDouble();
                account.deposit(money);
            } else if (choice == 3) {
                System.out.print("请输入取钱金额：");
                double money = scanner.nextDouble();
                account.withdraw(money);
            } else if (choice == 0) {
                System.out.println("感谢使用");
                break;
            } else {
                System.out.println("没有这个选项");
            }
        }

        scanner.close();
    }
}

