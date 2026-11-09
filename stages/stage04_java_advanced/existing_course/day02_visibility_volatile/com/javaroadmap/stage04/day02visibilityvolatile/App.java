package com.javaroadmap.stage04.day02visibilityvolatile;

/**
 * 知识点：可见性与 volatile——一个线程的写入，另一个线程能看到吗。
 *
 * 场景：工作线程循环等待 main 把 flag 置 true。如果写入"看不见"，
 * 循环就永远停不下来。s03-concurrency-basics 的路标在这里兑现。
 *
 * 心智模型：线程可能把变量缓存在自己的工作内存（寄存器/缓存），写入不保证
 * 立刻对其他线程可见。volatile = "写立即生效到主存、读不走过期缓存"；
 * Java 内存模型用 happens-before 规则定义"哪些写保证被看见"。
 * 边界（必须记住）：volatile 只保证可见性与有序性，**不保证原子性**——
 * count++ 依然是"读-改-写"三步，多线程累加照样丢更新。
 *
 * Observe：先预测 watcher 会不会退出、count 最终是多少，再运行。
 * Modify：去掉 volatile 修饰再跑——watcher 可能退出也可能永不退出（println
 * 内部自带同步会"碰巧"刷新可见性），多次运行对比正是这个实验的教训。
 */
public class App {
    // volatile 保证 main 的写入对工作线程立即可见；去掉试试上面的 Modify 实验。
    private static volatile boolean running = true;
    private static volatile int count = 0;

    public static void main(String[] args) throws InterruptedException {
        Thread watcher = new Thread(() -> {
            int spins = 0;
            while (running) {
                spins++;
            }
            // 能执行到这里，说明 watcher "看见"了 running=false 的写入。
            System.out.println("watcher 观察到停止信号（自旋 " + spins + " 次后退出）");
        });
        watcher.start();

        // 两个线程并发累加同一个 volatile 变量：读-改-写三步会互相覆盖。
        Runnable adder = () -> {
            for (int i = 0; i < 100_000; i++) {
                count++;
            }
        };
        Thread c1 = new Thread(adder);
        Thread c2 = new Thread(adder);
        c1.start();
        c2.start();
        c1.join();
        c2.join();

        running = false; // volatile 写：watcher 保证能看见
        watcher.join();
        System.out.println("count 期望 200000，实际：" + count);
        System.out.println("count 小于 200000 即为丢更新：volatile 可见性 != 原子性。");
        System.out.println("碰巧等于 200000 也别高兴——多跑几次，竞争是概率问题。");
    }
}
