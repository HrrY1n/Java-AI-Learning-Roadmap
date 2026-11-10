package com.javaroadmap.stage02.day03encapsulation;

/** 知识点：private 与公共方法。 */
public class Account {
    private String owner;
    private double balance;

    public Account(String owner, double balance) {
        // 出生即把关：禁止带着负余额进入系统，防止"非法状态进不来"只停留在口号。
        if (balance < 0) {
            throw new IllegalArgumentException("初始余额不能为负：" + balance);
        }
        this.owner = owner;
        this.balance = balance;
    }

    // 说明：此处为了入门演示简化为打印提示后返回；正式工程中实体方法应返回 boolean
    // 或抛出异常（让调用方明确感知失败），见后续银行练习与 Entity/Service 深化课。
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

