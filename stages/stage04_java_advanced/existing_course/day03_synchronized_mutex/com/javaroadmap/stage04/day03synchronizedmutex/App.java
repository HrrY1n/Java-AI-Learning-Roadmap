package com.javaroadmap.stage04.day03synchronizedmutex;

/**
 * 知识点：synchronized——用互斥保住"读-改-写"的原子性。
 *
 * 场景：两个线程对同一计数器各累加 1000 次（s03 演示过结果常常不到 2000）。
 * 可见性解决"看不见"，原子性要靠"同一时刻只许一个人进临界区"。
 *
 * 心智模型：每个对象自带一把锁。synchronized(obj) { ... } 进门拿锁、出门
 * 还锁；synchronized 实例方法 = 锁 this；static synchronized = 锁 Class 对象。
 * 锁是可重入的：同一线程可再次拿自己持有的锁。锁的粒度决定并发的自由度——
 * 错锁对象（两把不同的锁）等于没锁。
 *
 * Observe：先预测两个版本各自的计数结果，再运行核对。
 * Modify：把 increment 里的 synchronized (lock) 改成 synchronized (otherLock)
 * ——两把锁各管各的，竞态立刻回来。
 */
public class App {
    private static long unsafeCount = 0;
    private static long safeCount = 0;
    /** 所有线程必须抢同一把锁：锁对象本身不参与数据，只是"门"。 */
    private static final Object lock = new Object();
    /** Modify 实验用的第二把锁：两把锁互不等待，等于没锁。 */
    private static final Object otherLock = new Object();

    public static void main(String[] args) throws InterruptedException {
        // 版本一：无同步——结果不确定，通常小于 2000（"碰巧等于"也可能，更难排查）。
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) unsafeCount++;
        });
        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) unsafeCount++;
        });
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println("无同步结果（不保证 2000）：" + unsafeCount);

        // 版本二：synchronized 临界区——两次运行结果都是 2000，这就是确定性。
        Thread t3 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) increment();
        });
        Thread t4 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) increment();
        });
        t3.start();
        t4.start();
        t3.join();
        t4.join();
        System.out.println("synchronized 结果（必然 2000）：" + safeCount);
    }

    static void increment() {
        synchronized (lock) {
            safeCount++; // 临界区：读-改-写三步不再被从中间插入
        }
    }
}
