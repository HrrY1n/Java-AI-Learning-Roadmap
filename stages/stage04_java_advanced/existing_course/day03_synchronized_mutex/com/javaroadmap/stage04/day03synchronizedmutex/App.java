package com.javaroadmap.stage04.day03synchronizedmutex;

/**
 * 知识点：synchronized——互斥锁、可重入性与锁对象决定互斥范围。
 *
 * Observe：预测无同步、synchronized(lock) 以及可重入计数实例的输出。
 * Modify：把 increment 里的 synchronized (lock) 改成 synchronized (otherLock)，观察竞态回归。
 */
public class App {
    private static long unsafeCount = 0;
    private static long safeCount = 0;
    /** 所有线程必须抢同一把锁：锁对象本身不参与数据，只是"门"。 */
    private static final Object lock = new Object();
    /** Modify 实验用的第二把锁：两把锁互不等待，等于没锁。 */
    private static final Object otherLock = new Object();

    static class ReentrantCounter {
        private int count = 0;
        private int logs = 0;

        // 实例方法锁住的是 this；内部再调用同对象的 synchronized 方法 recordLog()，
        // 同一线程可直接再次进入（持锁计数 +1），这就是"锁可重入"，不会自己锁死自己。
        synchronized void addAndLog() {
            count++;
            recordLog();
        }

        synchronized void recordLog() {
            logs++;
        }

        synchronized int getCount() {
            return count;
        }
    }

    public static void main(String[] args) throws InterruptedException {
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

        ReentrantCounter rc = new ReentrantCounter();
        rc.addAndLog();
        System.out.println("可重入锁嵌套调用未死锁，结果：" + rc.getCount());
    }

    static void increment() {
        synchronized (lock) {
            safeCount++;
        }
    }
}
