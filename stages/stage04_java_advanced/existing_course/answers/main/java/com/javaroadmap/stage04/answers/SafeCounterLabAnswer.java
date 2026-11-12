package com.javaroadmap.stage04.answers;

import java.util.Collections;
import java.util.Scanner;
import java.util.Set;
import java.util.TreeSet;

/**
 * Stage 04 练习 2"线程安全计数器"参考答案。
 *
 * 重点：
 * 1. SafeCounter 用 private 字段 + synchronized 实例方法锁住 this 监视器；
 * 2. increment() 保护读-改-写原子性，get() 同样加 synchronized 保证跨线程可见性；
 * 3. 先全部 start() 再全部 join()，并发交错执行；
 * 4. 参数校验在前，0 线程或负次数直接拒绝并提示。
 */
public class SafeCounterLabAnswer {

    static class SafeCounter {
        private long value = 0;

        public synchronized void increment() {
            value++;
        }

        public synchronized long get() {
            return value;
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) {
            System.out.println("输入必须是两个整数");
            scanner.close();
            return;
        }
        int threads = scanner.nextInt();
        if (!scanner.hasNextInt()) {
            System.out.println("输入必须是两个整数");
            scanner.close();
            return;
        }
        int perThread = scanner.nextInt();
        scanner.close();

        if (threads <= 0) {
            System.out.println("线程数必须大于 0");
            return;
        }
        if (perThread < 0) {
            System.out.println("累加次数不能为负");
            return;
        }

        SafeCounter counter = new SafeCounter();
        Thread[] workers = new Thread[threads];
        final boolean[] nonMainFlags = new boolean[threads];
        // 证据语义：只登记真正执行过 increment() 的线程，名单才单独成立为"实际累加线程"的证据；
        // perThread=0 时没有任何线程累加，集合保持为空（与最终计数 0 互相印证）。
        // 多个工作线程并发 add，必须包一层 synchronizedSet（TreeSet 只保证排序语义，不保证并发安全），
        // 再由 TreeSet 保证输出确定性。
        Set<String> actualWorkers = Collections.synchronizedSet(new TreeSet<String>());

        for (int i = 0; i < threads; i++) {
            final int idx = i;
            workers[i] = new Thread(() -> {
                nonMainFlags[idx] = !"main".equals(Thread.currentThread().getName());
                for (int step = 0; step < perThread; step++) {
                    counter.increment();
                    actualWorkers.add(Thread.currentThread().getName());
                }
            }, "counter-worker-" + (i + 1));
        }

        for (Thread worker : workers) {
            worker.start();
        }
        for (Thread worker : workers) {
            worker.join();
        }

        boolean allWorkersNonMain = true;
        for (boolean flag : nonMainFlags) {
            if (!flag) {
                allWorkersNonMain = false;
                break;
            }
        }

        System.out.println("线程数：" + threads + "，每线程次数：" + perThread);
        System.out.println("工作线程均非main：" + allWorkersNonMain);
        System.out.println("实际累加线程（排序去重）：" + new java.util.ArrayList<String>(actualWorkers));
        System.out.println("最终计数：" + counter.get());
    }
}
