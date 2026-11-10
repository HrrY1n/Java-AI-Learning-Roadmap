package com.javaroadmap.stage04.answers;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Scanner;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 * Stage 04 练习 3"线程池任务执行与优雅关闭"参考答案。
 *
 * 重点：
 * 1. 显式构造 ThreadPoolExecutor，限定 core 与 max 为 poolSize；
 * 2. 通过 Callable<Long> + List<Future<Long>> 按提交顺序拿回结果，不受完成次序波动影响；
 * 3. shutdown() 拒绝新任务并等待存量任务结束，awaitTermination 后 isTerminated() 为 true；
 * 4. 验证执行线程均非 main 且实际使用线程数不超过 poolSize。
 */
public class ThreadPoolLabAnswer {
    public static void main(String[] args) throws InterruptedException, ExecutionException {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) {
            System.out.println("输入必须是两个整数");
            scanner.close();
            return;
        }
        int poolSize = scanner.nextInt();
        if (!scanner.hasNextInt()) {
            System.out.println("输入必须是两个整数");
            scanner.close();
            return;
        }
        int taskCount = scanner.nextInt();
        scanner.close();

        if (poolSize <= 0) {
            System.out.println("池大小必须大于 0");
            return;
        }
        if (taskCount < 0) {
            System.out.println("任务数不能为负");
            return;
        }

        ExecutorService pool = new ThreadPoolExecutor(
                poolSize,
                poolSize,
                0L,
                TimeUnit.MILLISECONDS,
                new LinkedBlockingQueue<Runnable>()
        );
        Set<String> usedThreads = Collections.synchronizedSet(new HashSet<String>());
        List<Future<Long>> futures = new ArrayList<Future<Long>>();

        for (int i = 1; i <= taskCount; i++) {
            final long taskId = i;
            futures.add(pool.submit(() -> {
                usedThreads.add(Thread.currentThread().getName());
                return taskId * taskId;
            }));
        }

        pool.shutdown();
        boolean terminated = pool.awaitTermination(15, TimeUnit.SECONDS);

        List<Long> results = new ArrayList<Long>();
        long total = 0;
        for (Future<Long> future : futures) {
            long value = future.get();
            results.add(value);
            total += value;
        }

        boolean allFromPool = true;
        for (String name : usedThreads) {
            if ("main".equals(name)) {
                allFromPool = false;
                break;
            }
        }
        boolean withinLimit = usedThreads.size() <= poolSize;

        System.out.println("任务总数：" + taskCount + "，池大小：" + poolSize);
        System.out.println("任务均由池线程执行：" + allFromPool);
        System.out.println("工作线程数不超上限：" + withinLimit);
        System.out.println("计算结果：" + results);
        System.out.println("结果总和：" + total);
        System.out.println("线程池已优雅关闭：" + (terminated && pool.isTerminated()));
    }
}
