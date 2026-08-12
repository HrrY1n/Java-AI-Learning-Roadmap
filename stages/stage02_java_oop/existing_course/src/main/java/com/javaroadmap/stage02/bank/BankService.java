package com.javaroadmap.stage02.bank;

/** 银行业务类。 */
public class BankService {
    public void deposit(Account account, double money) {
        account.deposit(money);
        System.out.println("存钱后余额：" + account.getBalance());
    }

    public void withdraw(Account account, double money) {
        boolean success = account.withdraw(money);
        if (success) {
            System.out.println("取钱后余额：" + account.getBalance());
        }
    }

    public void transfer(Account from, Account to, double money) {
        boolean success = from.withdraw(money);
        if (success) {
            to.deposit(money);
            System.out.println("转账成功。");
        } else {
            System.out.println("转账失败。");
        }
    }
}

