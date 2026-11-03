package com.javaroadmap.stage03.advanced.concurrencybasics;

/**
 * 并发基础：线程、共享状态与 synchronized。
 * 对应《On Java 8》第 24 章（并发编程）的入门部分。
 *
 * 两个工作线程同时给同一个计数器累加：先把线程全部启动，再统一等待，
 * 两段计数在时间上真正重叠；synchronized 让重叠后的结果依然确定。
 */
public class App {

    static class Counter {
        private int value = 0;

        // synchronized 保证同一时刻只有一个线程进入 increment，
        // “读取 value → 加 1 → 写回”三步不会被另一个线程从中间插入
        synchronized void increment() {
            value++;
        }

        int value() {
            return value;
        }
    }

    // 把累加逻辑封装成 Runnable：启动与等待分成两步，才能先都启动、再一起等
    static Runnable countingTask(Counter counter, int times) {
        return () -> {
            for (int i = 0; i < times; i++) {
                counter.increment();
            }
        };
    }

    public static void main(String[] args) throws InterruptedException {
        Counter counter = new Counter();
        // 先创建并启动两个工作线程：此刻三个执行流同时存在，
        // worker-1 与 worker-2 的累加过程在时间上真正重叠
        Thread first = new Thread(countingTask(counter, 1000), "worker-1");
        Thread second = new Thread(countingTask(counter, 1000), "worker-2");
        first.start();
        second.start();

        // 两个线程都已启动之后再统一等待：join 只表示“等它结束”，
        // 若在 start 之后立刻 join，就会退化成“跑完一个再跑下一个”
        first.join();
        second.join();

        System.out.println("同步后的计数：" + counter.value() + "（期望 2000）");
        System.out.println("要点：两个线程重叠执行时，value++ 的读-改-写可能被从中间打断；");
        System.out.println("synchronized 让每次累加都完整进行，所以 2000 次累加一次也不会丢。");
        System.out.println("如果不加 synchronized，结果通常小于 2000，但也可能恰好等于 2000——");
        System.out.println("竞争是否发生取决于线程调度，这种“碰巧正确”比出错更难排查。");
    }
}
