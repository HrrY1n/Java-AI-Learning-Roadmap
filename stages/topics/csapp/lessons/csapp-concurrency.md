# 并发编程：进程、线程与共享状态

## 1. Scenario：从一个具体问题出发
多个线程更新同一个计数器，结果比期望少。

## 2. Why：为什么这个问题值得系统理解
并发带来吞吐和响应能力，也带来原子性、可见性和顺序问题。

## 3. Concept：核心概念
进程有独立地址空间；线程共享进程内存。Java 提供线程、监视器锁、`volatile`、原子类和并发集合。信号量、互斥和条件等待在不同语言中形式不同。

## 4. Mental Model：把机制装进一张图
共享可变状态是风险；要么加锁保护，要么用不可变数据或消息传递。

## 5. Minimal Code：最小示例
```java
java.util.concurrent.ExecutorService pool = java.util.concurrent.Executors.newFixedThreadPool(2);
pool.submit(() -> System.out.println(Thread.currentThread().getName()));
pool.shutdown();
```

## 6. Observe：先预测，再运行
先预测两个线程同时递增 `count++` 的结果，再运行源码并重复多次。

## 7. Modify：只改一个有意义的条件
把 `count++` 改成 `AtomicInteger.incrementAndGet()` 或 `synchronized`，比较稳定性和吞吐。

## 8. Exercise：独立完成
实现一个线程安全的任务队列，要求支持并发生产者与消费者，并解释为什么只加锁还不够。

## 9. Real Usage：联系 Java 与工程实践
Web 请求处理、线程池、缓存刷新和批处理都依赖并发原语；不要假设执行顺序。

## 来源与出处
《CSAPP, 3rd Global Edition》Chapter 12（PDF 第 1008-1078 页）。
