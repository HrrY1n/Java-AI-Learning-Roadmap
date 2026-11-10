package com.javaroadmap.stage04.day01threadbasics;

/**
 * 知识点：线程——进程内的第二条执行流。
 *
 * Observe：先预测 main 线程名、worker 线程启动前的状态、join() 后的状态，再运行核对。
 * Modify：把 worker.start() 改成 worker.run()——观察线程名变不变、还会并发吗？（预测题 S04A1）
 */
public class App {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("main 所在线程：" + Thread.currentThread().getName());

        Thread worker = new Thread(() -> {
            System.out.println("worker 所在线程：" + Thread.currentThread().getName());
            for (int i = 1; i <= 3; i++) {
                System.out.println("worker 步骤 " + i);
            }
        });
        // 启动前处于确定状态 NEW；重复对已启动线程调用 start() 会抛 IllegalThreadStateException。
        System.out.println("worker 已创建、未启动：" + worker.getState());

        worker.start(); // 向调度器登记；之后 worker 可能还在 RUNNABLE，也可能已经很快跑完变为 TERMINATED
        System.out.println("worker 已调用 start（具体是 RUNNABLE 还是已结束取决于调度）：" + worker.getState());

        // join = "等这条流跑完我再继续"，并建立 happens-before 内存可见性。
        worker.join();
        System.out.println("worker 结束后状态：" + worker.getState());
        System.out.println("main 收尾：JVM 在所有非守护线程结束后才退出。");
    }
}
