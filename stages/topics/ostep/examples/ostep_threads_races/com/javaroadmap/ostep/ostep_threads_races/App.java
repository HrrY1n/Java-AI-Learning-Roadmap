package com.javaroadmap.ostep.ostep_threads_races;

/**
 * 教学示例：线程、共享数据与竞态
 * 来源：操作系统导论（本地中文版）
 * 仅用于课程观察；不声称测量真实 CPU、OS 调度或公网网络。
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 线程、共享数据与竞态 ===");
        int[] counter = {0};
        Thread a = new Thread(() -> { for (int i = 0; i < 10000; i++) counter[0]++; });
        Thread b = new Thread(() -> { for (int i = 0; i < 10000; i++) counter[0]++; });
        a.start(); b.start(); a.join(); b.join();
        System.out.println("竞态观察结果（可能小于 20000）：" + counter[0]);
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }
}
