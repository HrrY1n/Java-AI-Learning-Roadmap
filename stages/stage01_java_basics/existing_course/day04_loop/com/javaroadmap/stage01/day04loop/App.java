package com.javaroadmap.stage01.day04loop;

/**
 * 知识点：for 与 while——循环控制与 continue / break。
 *
 * Observe：预测四段输出（包含偶数被 continue 跳过、i==7 时 break 终止），再运行核对。
 * Modify：把 <= 5 改成 < 5 观察少打印哪一项；在 while 里去掉 count-- 会发生什么？
 */
public class App {
    public static void main(String[] args) {
        // for：次数已知——从 1 数到 5，步进 1。
        for (int i = 1; i <= 5; i++) {
            System.out.println("for 循环：" + i);
        }

        // 累加：在循环外声明 sum，若把 sum 放进循环体内部就会每轮清零（作用域规则）。
        int sum = 0;
        for (int i = 1; i <= 100; i++) {
            sum = sum + i;
        }
        System.out.println("1 到 100 的和：" + sum);

        // continue 跳过本轮剩余代码，直接去执行步进 i++；break 立刻结束整层循环。
        System.out.print("1~9 中的奇数（遇 7 提前停止）：");
        for (int i = 1; i <= 9; i++) {
            if (i % 2 == 0) {
                continue;
            }
            if (i == 7) {
                break;
            }
            System.out.print(i + " ");
        }
        System.out.println();

        // while：条件先于动作——适用于循环次数事先不确定的情况。
        int count = 3;
        while (count > 0) {
            System.out.println("while 倒计时：" + count);
            count--;
        }
    }
}
