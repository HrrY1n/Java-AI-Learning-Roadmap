package com.javaroadmap.stage02.earlyprojects.project03simplebanksystem;

/** 项目类：Account。 */
public class Account {
    private String owner;
    private double balance;

    public Account(String owner, double balance) {
        this.owner = owner;
        this.balance = balance;
    }

    public void deposit(double money) {
        if (money <= 0) {
            System.out.println("存钱金额必须大于 0");
            return;
        }

        balance = balance + money;
        System.out.println("存钱成功");
    }

    public void withdraw(double money) {
        if (money <= 0) {
            System.out.println("取钱金额必须大于 0");
            return;
        }

        if (money > balance) {
            System.out.println("余额不足");
            return;
        }

        balance = balance - money;
        System.out.println("取钱成功");
    }

    public void showBalance() {
        System.out.println(owner + " 的当前余额：" + balance);
    }
}

