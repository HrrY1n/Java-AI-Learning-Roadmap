package com.javaroadmap.stage03.advanced.concurrencybasics;

/**
 * 并发基础：线程、共享状态与 synchronized。
 * 对应《On Java 8》第 24 章（并发编程）的入门部分。
 *
 * 本示例刻意只演示“能确定结果”的同步场景：无保护的竞态输出每次不同，
 * 无法写进断言，正文里单独说明。
 */
public class App {

    static class Counter {
        private int value = 0;

        // synchronized 保证同一时刻只有一个线程进入，读-改-写不会互相覆盖
        synchronized void increment() {
            value++;
        }

        int value() {
            return value;
        }
    }

    static void countOnSeparateThread(Counter counter, int times) throws InterruptedException {
        Thread worker = new Thread(() -> {
            for (int i = 0; i < times; i++) {
                counter.increment();
            }
        });
        worker.start();
        worker.join(); // join：等待 worker 执行完毕再继续
    }

    public static void main(String[] args) throws InterruptedException {
        Counter counter = new Counter();
        countOnSeparateThread(counter, 1000);
        // 主线程自己再加 1000 次：两个“执行流”都操作同一份共享状态
        for (int i = 0; i < 1000; i++) {
            counter.increment();
        }
        System.out.println("同步后的计数：" + counter.value() + "（期望 2000）");
        System.out.println("要点：没有同步时，value++ 的读-改-写三步会互相覆盖，结果通常小于期望且每次不同。");
    }
}
