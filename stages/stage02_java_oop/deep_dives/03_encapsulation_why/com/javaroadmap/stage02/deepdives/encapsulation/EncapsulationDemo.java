package com.javaroadmap.stage02.deepdives.encapsulation;

/**
 * 深化课 03：封装——为什么字段要 private。
 *
 * 场景：day03 的 Account 已经把 balance 设为 private 并提供 deposit/withdraw。
 * 本课用"公开字段版"作对照，回答：不加 private 到底会出什么问题？
 *
 * 心智模型：private 字段 + 方法 = 把"所有能改状态的地方"收拢到类里。
 *   公开字段：任何人任何地方都能改，规则散落在每个调用者手里；
 *   封装：修改入口只有几个方法，规则写一次、处处生效、将来可换实现。
 *
 * Observe：预测两段输出；第二段里那行"绕过规则"的代码在封装版下根本编译不过。
 */
public class EncapsulationDemo {
    public static void main(String[] args) {
        // 第一段：公开字段版——规则完全靠调用者自觉。
        UnsafeAccount unsafe = new UnsafeAccount();
        unsafe.owner = "小明";
        unsafe.balance = 100;
        unsafe.balance = -500;                 // 语法完全合法：绕过一切规则
        unsafe.show();

        // 第二段：封装版——非法状态进不来，合法修改有记录。
        SafeAccount safe = new SafeAccount("小明", 100);
        safe.deposit(50);
        safe.withdraw(30);
        safe.withdraw(99999);                  // 规则在类内拒绝：余额不足
        safe.show();
    }
}

/** 反面教材：字段公开，规则不存在。 */
class UnsafeAccount {
    String owner;
    double balance;

    void show() {
        System.out.println("1) 公开字段版：" + owner + " 的余额：" + balance);
    }
}

/** 封装版：字段私有，修改入口只有两个方法，规则只写一次。 */
class SafeAccount {
    private String owner;
    private double balance;

    SafeAccount(String owner, double balance) {
        this.owner = owner;
        if (balance < 0) {
            throw new IllegalArgumentException("初始余额不能为负");
        }
        this.balance = balance;
    }

    void deposit(double amount) {
        if (amount <= 0) {
            System.out.println("存钱金额必须大于 0");
            return;
        }
        balance += amount;
    }

    void withdraw(double amount) {
        if (amount <= 0 || amount > balance) {
            System.out.println("取钱失败：金额非法或余额不足");
            return;
        }
        balance -= amount;
    }

    void show() {
        System.out.println("2) 封装版：" + owner + " 的余额：" + balance);
    }
}
