package com.javaroadmap.ostep.ostep_locks_atomics;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 教学示例：OSTEP 第 28-29 章——基于硬件原子指令 (CAS) 手写自旋锁 vs 锁粒度与持锁代价。
 * 来源：操作系统导论（本地中文版）第 28-29 章
 * 仅用于并发锁机制原理观察，不声称测量真实硬件基准吞吐。
 */
public final class App {
    private App() {}

    /**
     * 教学版自旋锁（对应 OSTEP Ch.28 基于 Test-And-Set / Compare-And-Swap 的锁实现）：
     * 底层依赖 AtomicBoolean.compareAndSet(false, true) 把"检查空闲+占锁"做成不可分割的一步。
     */
    static final class SpinLock {
        private final AtomicBoolean locked = new AtomicBoolean(false);
        private final AtomicLong spinWaitLoops = new AtomicLong(0);

        void lock() {
            // 若当前 locked 是 false，原子改为 true 并返回；否则说明锁被他人拿着，原地自旋等待
            while (!locked.compareAndSet(false, true)) {
                spinWaitLoops.incrementAndGet();
                Thread.onSpinWait(); // JDK 9+ 自旋提示：不切换 OS 线程，仅提示处理器处于自旋等待
            }
        }

        void unlock() {
            // volatile 写语义：保证释放锁之前的临界区修改对下一个抢到锁的线程可见
            locked.set(false);
        }

        long getSpinWaitLoops() {
            return spinWaitLoops.get();
        }
    }

    private static int unsafeSum = 0;
    private static int spinLockSum = 0;

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== OSTEP Ch.28-29：从硬件 CAS 手写自旋锁 ===");

        // 1. 错误直觉对照：普通共享变量加锁缺失（不保证每次都错，但并发下不安全）
        Thread u1 = new Thread(() -> {
            for (int i = 0; i < 100_000; i++) unsafeSum++;
        });
        Thread u2 = new Thread(() -> {
            for (int i = 0; i < 100_000; i++) unsafeSum++;
        });
        u1.start();
        u2.start();
        u1.join();
        u2.join();
        System.out.println("无锁竞争结果（期望 200000，非安全）：" + unsafeSum);

        // 2. 用硬件原语 CAS 手写 SpinLock 保护临界区
        SpinLock lock = new SpinLock();
        Thread s1 = new Thread(() -> {
            for (int i = 0; i < 100_000; i++) {
                lock.lock();
                try {
                    spinLockSum++;
                } finally {
                    // 务必放进 finally：防止临界区异常导致锁永远不释放
                    lock.unlock();
                }
            }
        });
        Thread s2 = new Thread(() -> {
            for (int i = 0; i < 100_000; i++) {
                lock.lock();
                try {
                    spinLockSum++;
                } finally {
                    lock.unlock();
                }
            }
        });
        s1.start();
        s2.start();
        s1.join();
        s2.join();

        System.out.println("CAS 自旋锁保护后精确计数：" + spinLockSum);
        System.out.println("竞争期间发生空转自旋次数（非零即说明发生过锁争用）：" + lock.getSpinWaitLoops());
        System.out.println("启示：纯自旋锁绝不能持锁执行 I/O，否则等待线程会把 CPU 烧空；现代锁常在短自旋后改为操作系统挂起。");
    }
}
