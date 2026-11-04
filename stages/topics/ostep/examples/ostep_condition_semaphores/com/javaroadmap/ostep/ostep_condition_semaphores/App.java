package com.javaroadmap.ostep.ostep_condition_semaphores;

/**
 * 教学示例：条件变量、生产者消费者与信号量
 * 来源：操作系统导论（本地中文版）
 * 仅用于课程观察；不声称测量真实 CPU、OS 调度或公网网络。
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 条件变量、生产者消费者与信号量 ===");
        java.util.concurrent.BlockingQueue<Integer> queue = new java.util.concurrent.ArrayBlockingQueue<>(2);
        queue.put(1);
        queue.put(2);
        System.out.println("队列剩余容量：" + queue.remainingCapacity());
        System.out.println("消费者取出：" + queue.take());
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }
}
