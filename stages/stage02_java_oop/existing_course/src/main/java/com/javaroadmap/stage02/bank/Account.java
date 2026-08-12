package com.javaroadmap.stage02.bank;

/** 银行账户实体类。 */
public class Account {
    private String accountNo;
    private String owner;
    private double balance;

    public Account(String accountNo, String owner, double balance) {
        this.accountNo = accountNo;
        this.owner = owner;
        this.balance = balance;
    }

    public String getAccountNo() {
        return accountNo;
    }

    public double getBalance() {
        return balance;
    }

    public void deposit(double money) {
        if (money <= 0) {
            System.out.println("存钱金额必须大于 0。");
            return;
        }
        balance = balance + money;
    }

    public boolean withdraw(double money) {
        if (money <= 0) {
            System.out.println("取钱金额必须大于 0。");
            return false;
        }
        if (money > balance) {
            System.out.println("余额不足。");
            return false;
        }
        balance = balance - money;
        return true;
    }

    public void printInfo() {
        System.out.println("账号：" + accountNo + "，户主：" + owner + "，余额：" + balance);
    }
}

