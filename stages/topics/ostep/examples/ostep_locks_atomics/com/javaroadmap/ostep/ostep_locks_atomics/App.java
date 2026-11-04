package com.javaroadmap.ostep.ostep_locks_atomics;

/**
 * 教学示例：锁、自旋与原子操作
 * 来源：操作系统导论（本地中文版）
 * 仅用于课程观察；不声称测量真实 CPU、OS 调度或公网网络。
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 锁、自旋与原子操作 ===");
        java.util.concurrent.atomic.AtomicInteger counter = new java.util.concurrent.atomic.AtomicInteger();
        Thread a = new Thread(() -> { for (int i = 0; i < 10000; i++) counter.incrementAndGet(); });
        Thread b = new Thread(() -> { for (int i = 0; i < 10000; i++) counter.incrementAndGet(); });
        a.start(); b.start(); a.join(); b.join();
        System.out.println("原子修复结果：" + counter.get());
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }
}
