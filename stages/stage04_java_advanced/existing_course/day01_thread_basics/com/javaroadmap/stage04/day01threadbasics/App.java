package com.javaroadmap.stage04.day01threadbasics;

/**
 * 知识点：线程——进程内的第二条执行流。
 *
 * 场景：单线程程序在等一个耗时操作时，其他事情全部停摆；线程让"等待"与
 * "继续干活"同时发生。
 *
 * 心智模型：main 本身就是一条线程。new Thread(task) 只是创建"执行计划"，
 * start() 才向调度器登记；之后何时运行、与 main 如何交错，由调度器决定——
 * 顺序不可控是并发一切问题的根源。
 *
 * Observe：先预测三段输出，再运行多次核对（交错模式可能每次不同）。
 * Modify：把 start() 改成 run()——"线程"还成立吗？（预测题 S04A1）
 */
public class App {
    public static void main(String[] args) throws InterruptedException {
        // 任何 Java 程序启动时就有一条线程在跑 main 方法——它叫 main。
        System.out.println("main 所在线程：" + Thread.currentThread().getName());

        Thread worker = new Thread(() -> {
            // 这行在"另一条执行流"里执行：线程名由 Thread 类自动编号。
            System.out.println("worker 所在线程：" + Thread.currentThread().getName());
            for (int i = 1; i <= 3; i++) {
                System.out.println("worker 步骤 " + i);
            }
        });
        System.out.println("worker 已创建、未启动：" + worker.getState());

        worker.start();          // 向调度器登记；此刻两条执行流并存
        System.out.println("worker 已启动：" + worker.getState());

        // join = "等它跑完再继续"；没有它，main 可能在 worker 之前结束。
        worker.join();
        System.out.println("worker 结束后状态：" + worker.getState());
        System.out.println("main 收尾：JVM 在所有非守护线程结束后才退出。");
    }
}
