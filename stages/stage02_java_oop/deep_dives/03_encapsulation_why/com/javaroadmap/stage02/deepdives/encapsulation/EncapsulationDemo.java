package com.javaroadmap.stage02.deepdives.encapsulation;

import java.util.Arrays;

/**
 * 深化课 03：封装——为什么字段要 private（含内部可变引用逃逸反例）。
 *
 * Observe：预测三段输出，重点看第 3 段：即使字段是 private，直接返回内部数组引用会怎样？
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

        // 第三段：引用逃逸反例——如果 getter 直接把内部可变数组/集合原封不动 return 出去，
        // 调用方就能绕过所有 setter 在类外直接篡改对象内部状态！
        LeakyTeam leaky = new LeakyTeam(new int[]{80, 90});
        int[] leaked = leaky.getScoresUnsafe();
        leaked[0] = -999;                      // 未经任何守门方法，直接破坏了对象内部状态
        System.out.println("3) 引用逃逸被篡改：" + Arrays.toString(leaky.getScoresSafe()));
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

/** 反例对照：private 数组的引用逃逸与保护性拷贝。 */
class LeakyTeam {
    private final int[] scores;

    LeakyTeam(int[] scores) {
        // 构造器也应复制外部传入的数组，否则调用方改原数组同样会穿透封装。
        this.scores = scores.clone();
    }

    int[] getScoresUnsafe() {
        return scores; // 危险：把内部数组的引用直接交给了外部！
    }

    int[] getScoresSafe() {
        return scores.clone(); // 安全：返回防御性副本，外面随便改不影响内部
    }
}
