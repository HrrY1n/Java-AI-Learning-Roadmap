package com.javaroadmap.stage01.deepdives.loops;

/**
 * 深化课 05：循环边界——off-by-one 从哪里来。
 *
 * 场景：day04 的 for/while 已经会写，但"差一错误"（off-by-one）是初学者
 * 产出 bug 最多的地方。它不是手滑，而是三种边界语义没有分开。
 *
 * 心智模型：写循环先回答三个边界问题——
 *   1) 起点：第一轮 i 是几？
 *   2) 终点：最后一轮 i 是几？条件表达式在"最后一轮之后"如何判 false？
 *   3) 步进：i 每轮怎么变？会不会有某一轮跳过条件检查？
 *
 * Observe：先预测每个方法打印的范围，再运行核对。
 */
public class LoopBoundsDemo {
    public static void main(String[] args) {
        printRange(1, 5);       // 想打印 1..5，实际打印什么？
        printRangeFixed(1, 5);
        printEveryOther(2, 9);  // 打印哪些数？
        countdownWrong();       // 这段想打印 3 2 1，实际打印什么？
        countOneToThree();
    }

    // 有 bug 的版本：条件用了 <，5 永远打不出来。
    static void printRange(int start, int end) {
        for (int i = start; i < end; i++) {
            System.out.print(i + " ");
        }
        System.out.println(" <- printRange");
    }

    // 修正版：想包含 end 时用 <=；想在 end 前停用 <。两种都合法，语义不同。
    static void printRangeFixed(int start, int end) {
        for (int i = start; i <= end; i++) {
            System.out.print(i + " ");
        }
        System.out.println(" <- printRangeFixed");
    }

    // 步进为 2：终点条件照样每轮检查。9 打不出来，8 是最后一轮。
    static void printEveryOther(int start, int end) {
        for (int i = start; i <= end; i += 2) {
            System.out.print(i + " ");
        }
        System.out.println(" <- printEveryOther");
    }

    // 有 bug 的 while：递减写在了错误的位置，导致多打一轮 0。
    static void countdownWrong() {
        int n = 3;
        while (n > 0) {
            System.out.print(n + " ");
            n--;                    // 正确。若把 n-- 挪进打印后又会如何？
        }
        System.out.println(" <- countdownWrong");
    }

    // continue：跳过本轮剩余语句，直接进入条件检查——注意 3 被跳过后 i 仍会 +1。
    static void countOneToThree() {
        for (int i = 1; i <= 5; i++) {
            if (i == 3) {
                continue;
            }
            if (i == 5) {
                break;              // 直接跳出整个循环
            }
            System.out.print(i + " ");
        }
        System.out.println(" <- countOneToThree (1 2 4)");
    }
}
