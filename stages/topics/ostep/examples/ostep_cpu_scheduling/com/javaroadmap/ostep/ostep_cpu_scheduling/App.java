package com.javaroadmap.ostep.ostep_cpu_scheduling;

/**
 * 教学示例：CPU 调度：FIFO、SJF、RR 与多级反馈
 * 来源：操作系统导论（本地中文版）
 * 仅用于课程观察；不声称测量真实 CPU、OS 调度或公网网络。
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== CPU 调度：FIFO、SJF、RR 与多级反馈 ===");
        int[] bursts = {8, 4, 1};
        int now = 0;
        for (int index = 0; index < bursts.length; index++) {
            now += bursts[index];
            System.out.println("FIFO 教学：任务 " + (index + 1) + " 完成于 " + now);
        }
        System.out.println("提示：这是作业模型模拟，不是操作系统调度器。");
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }
}
