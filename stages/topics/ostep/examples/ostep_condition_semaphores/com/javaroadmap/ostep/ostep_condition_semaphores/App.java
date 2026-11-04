package com.javaroadmap.ostep.ostep_condition_semaphores;

/**
 * 教学示例：条件变量、生产者消费者与信号量
 * 来源：操作系统导论（本地中文版）第 30-31 章
 * 真实启动两个线程：队列容量为 2，生产者放第 3 个元素时会被阻塞，
 * 直到消费者取走元素腾出空间。BlockingQueue 内部就是“锁 + 条件变量”。
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 条件变量、生产者消费者与信号量 ===");
        java.util.concurrent.BlockingQueue<Integer> queue = new java.util.concurrent.ArrayBlockingQueue<>(2);
        Thread producer = new Thread(() -> {
            try {
                for (int item = 1; item <= 3; item++) {
                    System.out.println("生产者准备放入 " + item + "（队列容量 2）");
                    if (!queue.offer(item)) {
                        // offer 立即返回 false 说明队列已满；put 会在此阻塞，直到消费者腾出空间
                        System.out.println("队列已满，生产者阻塞等待空间...");
                        queue.put(item);
                    }
                    System.out.println("生产者已放入 " + item);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        Thread consumer = new Thread(() -> {
            try {
                Thread.sleep(200); // 故意晚启动：制造“队列已满、生产者被阻塞”的窗口
                for (int i = 1; i <= 3; i++) {
                    Integer taken = queue.take(); // 队列空时阻塞
                    System.out.println("消费者取出 " + taken);
                    Thread.sleep(50);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        producer.start();
        consumer.start();
        producer.join();
        consumer.join();
        System.out.println("提示：观察第 3 个元素——它的“已放入”必然出现在某次“取出”之后；这正是阻塞与唤醒。");
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }
}
