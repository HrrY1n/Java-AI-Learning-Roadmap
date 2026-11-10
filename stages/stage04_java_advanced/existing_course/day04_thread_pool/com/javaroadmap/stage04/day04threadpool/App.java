package com.javaroadmap.stage04.day04threadpool;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * 知识点：线程池——复用线程而不是随用随造。
 *
 * 场景：每来一个任务就 new Thread：线程创建/销毁开销大（默认约 1MB 栈 +
 * 内核调度成本），高并发下线程数量失控。池化 = 少量工人 + 任务队列。
 *
 * 心智模型：ThreadPoolExecutor 四个核心概念——
 *   corePoolSize（常驻工人）、maximumPoolSize（工人上限）、
 *   工作队列（排队的任务）、拒绝策略（满了怎么办）。
 * 提交任务时：常驻工人有空直接干；没有就排队；队列满且未到上限才加人；
 * 到上限还满则触发拒绝策略。
 *
 * Observe：先预测"提交 5 个任务、每个睡 100ms、池 core=2"会动用几个线程，
 * 再运行核对（Set 里出现的线程名）。
 * Modify：把 newFixedThreadPool(2) 换成 newCachedThreadPool 再跑——
 * 观察线程数量变化，并思考它为什么可能失控。
 */
public class App {
    public static void main(String[] args) throws InterruptedException {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        Set<String> usedThreads = new HashSet<String>();

        for (int task = 1; task <= 5; task++) {
            final int taskId = task;
            pool.execute(() -> {
                synchronized (usedThreads) {
                    usedThreads.add(Thread.currentThread().getName());
                }
                System.out.println("任务 " + taskId + " 由 "
                        + Thread.currentThread().getName() + " 执行");
                try {
                    Thread.sleep(100); // 模拟真实任务耗时，让并发交叠可观察
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        // shutdown = 不再接新任务，已提交的跑完；awaitTermination 等 它收尾。
        pool.shutdown();
        pool.awaitTermination(10, TimeUnit.SECONDS);
        System.out.println("动用的线程数：" + usedThreads.size());
        System.out.println("任务都在队列里排队，5 个任务只用了 2 个常驻工人。");
        // 教学路标：Executors.newFixedThreadPool 的队列是无界的——任务积压时
        // 内存可能耗尽，工程上常用显式 new ThreadPoolExecutor(...) 限定队列与
        // 拒绝策略（Stage 04 后续课程展开）。
    }
}
