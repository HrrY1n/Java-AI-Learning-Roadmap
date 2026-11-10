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
 * 场景：前四课用 synchronized 守住了临界区，但工程里有三类高频需求直接用标准并发工具更清晰：
 * 1) 单个计数器高并发累加 → AtomicInteger（无锁 CAS 读-改-写，代替粗粒度加锁）；
 * 2) 异步任务需要"返回值或把异常带回调用方" → Callable + Future（Runnable 返回 void）；
 * 3) 多线程安全读写键值表 → ConcurrentHashMap（HashMap 在并发写时可能数据错乱甚至异常）。
 *
 * 心智模型：
 * - CAS (Compare-And-Set)：更新前先比对"现在还是我刚才看到的值吗"，是才写入，否则重试；
 * - Future = "异步取件凭证"：提交任务立刻拿到凭证，调用 future.get() 时才阻塞等待结果；
 * - ConcurrentHashMap：只保证单个方法（如 put、compute）线程安全，复合逻辑（先 get 再 put）
 *   仍要用 compute / putIfAbsent 这类原子方法，否则依然有竞态。
 *
 * Observe：先预测三段输出，再运行核对。
 * Modify：把 ConcurrentHashMap 的 merge 拆成 get + put 对比——为什么单步安全不等于组合安全？
 */
public class App {
    public static void main(String[] args) throws InterruptedException, ExecutionException {
        // 1. AtomicInteger：两线程并发各累加 100000 次，无 synchronized 照样精确为 200000。
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

        // 2. Callable + Future：提交带返回值的任务到线程池。
        ExecutorService pool = Executors.newFixedThreadPool(2);
        Callable<Integer> sumTask = () -> {
            int sum = 0;
            for (int i = 1; i <= 100; i++) {
                sum += i;
            }
            return sum;
        };
        Future<Integer> future = pool.submit(sumTask);
        // future.get() 阻塞直到任务完成，并把计算结果（或内部异常）带回 main。
        System.out.println("Future 取回异步和：" + future.get());

        // 3. ConcurrentHashMap：并发安全计数（用原子方法 merge，而不是先 get 再 put）。
        Map<String, Integer> hits = new ConcurrentHashMap<String, Integer>();
        Runnable mapTask = () -> {
            for (int i = 0; i < 1000; i++) {
                hits.merge("api", 1, Integer::sum);
            }
        };
        Future<?> f1 = pool.submit(mapTask);
        Future<?> f2 = pool.submit(mapTask);
        f1.get();
        f2.get();
        pool.shutdown();
        System.out.println("ConcurrentHashMap 原子累计 api：" + hits.get("api"));
    }
}
