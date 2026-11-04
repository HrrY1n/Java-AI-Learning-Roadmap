package com.javaroadmap.csapp.csapp_concurrency;

/**
 * 教学示例：并发编程：进程、线程与共享状态
 * 来源：CS:APP（第 3 版 Global Edition）
 * 仅用于课程观察；不声称测量真实 CPU、OS 调度或公网网络。
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 并发编程：进程、线程与共享状态 ===");
        java.util.concurrent.ExecutorService pool = java.util.concurrent.Executors.newFixedThreadPool(2);
        java.util.concurrent.Future<String> future = pool.submit(() -> Thread.currentThread().getName() + ":task");
        System.out.println("并发任务结果：" + future.get());
        pool.shutdown();
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }
}
