package com.javaroadmap.stage02.bank;

/** 银行账户系统入口。 */
public class BankApp {
    public static void main(String[] args) {
        Account alice = new Account("A001", "小明", 500);
        Account bob = new Account("A002", "小红", 100);
        BankService service = new BankService();

        System.out.println("=== 初始账户 ===");
        alice.printInfo();
        bob.printInfo();

        service.deposit(alice, 200);
        service.withdraw(alice, 50);
        service.transfer(alice, bob, 300);

        System.out.println("=== 操作后账户 ===");
        alice.printInfo();
        bob.printInfo();
    }
}

