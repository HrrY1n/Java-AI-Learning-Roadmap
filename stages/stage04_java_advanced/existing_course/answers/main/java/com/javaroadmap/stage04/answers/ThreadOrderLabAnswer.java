package com.javaroadmap.stage04.answers;

import java.util.Scanner;

/**
 * Stage 04 练习 1"线程启动与阶段汇合"参考答案。
 *
 * 重点：
 * 1. 先检查输入再创建线程，非法输入不启动工作线程、不抛异常；
 * 2. 先全部 start()，再全部 join()——先起跑、再汇合，避免退化成串行；
 * 3. Thread.join() 建立 happens-before，汇合后读 sums[0]/sums[1] 天然可见；
 * 4. 校验工作线程名非 "main"，用语义抓住误调 .run() 的常见错误。
 */
public class ThreadOrderLabAnswer {
    public static void main(String[] args) throws InterruptedException {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) {
            System.out.println("任务参数无效：请输入两个整数");
            scanner.close();
            return;
        }
        int endA = scanner.nextInt();
        if (!scanner.hasNextInt()) {
            System.out.println("任务参数无效：请输入两个整数");
            scanner.close();
            return;
        }
        int endB = scanner.nextInt();
        scanner.close();

        if (endA <= 0 || endB <= 0) {
            System.out.println("任务参数无效：上界必须为正整数");
            return;
        }

        // 两个任务写入各自独立的数组槽位，无需竞争同一变量。
        final long[] sums = new long[2];
        final String[] threadNames = new String[2];

        Thread t1 = new Thread(() -> {
            threadNames[0] = Thread.currentThread().getName();
            sums[0] = sumRange(endA);
        }, "sum-worker-1");

        Thread t2 = new Thread(() -> {
            threadNames[1] = Thread.currentThread().getName();
            sums[1] = sumRange(endB);
        }, "sum-worker-2");

        // 必须先全部 start()，再统一 join()。
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        boolean worker1Ok = threadNames[0] != null && !"main".equals(threadNames[0]);
        boolean worker2Ok = threadNames[1] != null && !"main".equals(threadNames[1]);

        System.out.println("任务1线程非main：" + worker1Ok + "，结果：" + sums[0]);
        System.out.println("任务2线程非main：" + worker2Ok + "，结果：" + sums[1]);
        System.out.println("汇总完成：" + (sums[0] + sums[1]));
    }

    private static long sumRange(int end) {
        long sum = 0;
        for (int i = 1; i <= end; i++) {
            sum += i;
        }
        return sum;
    }
}
