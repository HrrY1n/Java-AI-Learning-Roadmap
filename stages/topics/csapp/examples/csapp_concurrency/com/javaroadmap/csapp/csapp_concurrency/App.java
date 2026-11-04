package com.javaroadmap.csapp.csapp_concurrency;

/**
 * 教学示例：并发编程：进程、线程与共享状态
 * 来源：CS:APP（第 3 版 Global Edition）Chapter 12
 * 真实启动线程观察竞态：普通 int 的“读取-递增-写回”会被其他线程插入，
 * 导致更新丢失。结果是不确定的：多数运行小于 200000，但不能保证每次都出现。
 */
public final class App {
    private static int plainCounter;

    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 并发编程：进程、线程与共享状态 ===");
        // 第一轮：无同步的普通递增（竞态示范，不要在真实代码中这样写）。
        plainCounter = 0;
        Thread a = new Thread(App::incrementPlain);
        Thread b = new Thread(App::incrementPlain);
        a.start();
        b.start();
        a.join();
        b.join();
        System.out.println("普通 int 两线程各递增 100000 次后：" + plainCounter
            + "（期望 200000，更新丢失时不相等）");

        // 第二轮：AtomicInteger 把“读取-递增-写回”合并为单个原子操作。
        java.util.concurrent.atomic.AtomicInteger atomicCounter = new java.util.concurrent.atomic.AtomicInteger();
        Thread c = new Thread(() -> incrementAtomic(atomicCounter));
        Thread d = new Thread(() -> incrementAtomic(atomicCounter));
        c.start();
        d.start();
        c.join();
        d.join();
        System.out.println("AtomicInteger 同样条件后：" + atomicCounter.get() + "（恒等于 200000）");
        System.out.println("提示：竞态结果每次运行可能不同，请多跑几次对比。");
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }

    private static void incrementPlain() {
        for (int i = 0; i < 100_000; i++) {
            plainCounter++;
        }
    }

    private static void incrementAtomic(java.util.concurrent.atomic.AtomicInteger counter) {
        for (int i = 0; i < 100_000; i++) {
            counter.incrementAndGet();
        }
    }
}
