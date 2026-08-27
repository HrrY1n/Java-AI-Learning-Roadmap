package com.javaroadmap.stage02.day03encapsulation;

/** 知识点：private 与公共方法。 */
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
    }

    public void showBalance() {
        System.out.println(owner + " 的余额：" + balance);
    }
}

