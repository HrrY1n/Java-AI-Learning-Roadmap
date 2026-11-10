package com.javaroadmap.stage04.day05concurrenttools;

import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 知识点：并发工具进阶——AtomicInteger、Callable/Future 与 ConcurrentHashMap。
 *
 * Observe：先预测三段输出，再运行核对。
 * Modify：把 hits.merge 拆成 get + put（复合操作竞态复现）；try-finally 保证异常时也不漏关线程池。
 */
public class App {
    public static void main(String[] args) throws InterruptedException, ExecutionException {
        // 1. AtomicInteger：无锁 CAS 读-改-写，单变量计数器无锁精确累加。
        AtomicInteger atomicCount = new AtomicInteger(0);
        Runnable atomicTask = () -> {
            for (int i = 0; i < 100_000; i++) {
                atomicCount.incrementAndGet();
            }
        };
        Thread a1 = new Thread(atomicTask);
        Thread a2 = new Thread(atomicTask);
        a1.start();
        a2.start();
        a1.join();
        a2.join();
        System.out.println("AtomicInteger 计数：" + atomicCount.get());

        // 2 & 3. 线程池放入 try-finally：即使中间 future.get() 抛出异常，也能保证执行 shutdown()，
        // 避免非守护工作线程泄漏导致 JVM 永不退出。
        ExecutorService pool = Executors.newFixedThreadPool(2);
        try {
            Callable<Integer> sumTask = () -> {
                int sum = 0;
                for (int i = 1; i <= 100; i++) {
                    sum += i;
                }
                return sum;
            };
            Future<Integer> future = pool.submit(sumTask);
            System.out.println("Future 取回异步和：" + future.get());

            Map<String, Integer> hits = new ConcurrentHashMap<>();
            Runnable mapTask = () -> {
                for (int i = 0; i < 1000; i++) {
                    hits.merge("api", 1, Integer::sum);
                }
            };
            Future<?> f1 = pool.submit(mapTask);
            Future<?> f2 = pool.submit(mapTask);
            f1.get();
            f2.get();
            System.out.println("ConcurrentHashMap 原子累计 api：" + hits.get("api"));
        } finally {
            pool.shutdown();
        }
    }
}
