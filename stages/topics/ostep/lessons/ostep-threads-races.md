# 线程、共享数据与竞态

## 1. Scenario：从一个具体问题出发
两个线程执行 `counter++` 一万次，最终小于两万。

## 2. Why：为什么这个问题值得系统理解
读-改-写不是单个原子操作；线程调度会插入在任意字节码边界之间。

## 3. Concept：核心概念
线程共享堆，但各有栈和程序计数器。竞态来自共享可变状态与原子性缺口。Java `Thread` 是语言线程，具体映射到 OS 线程由 JVM 决定。

## 4. Mental Model：把机制装进一张图
`读取 x -> 加 1 -> 写回 x` 可被其他线程插入；共享状态必须同步。

## 5. Minimal Code：最小示例
```java
static int counter;
Runnable task = () -> {
    for (int i = 0; i < 10_000; i++) counter++;
};
```

## 6. Observe：先预测，再运行
先预测输出，再运行 `CounterRace` 多次，记录是否每次都等于 20,000。

## 7. Modify：只改一个有意义的条件
把 `counter++` 改成 `AtomicInteger.incrementAndGet()`，比较稳定性和性能。

## 8. Exercise：独立完成
用两个线程分别递增自己的局部计数再汇总，或用原子类修复；写明为什么 `volatile` 只解决可见性。

## 9. Real Usage：联系 Java 与工程实践
请求计数、缓存状态和批处理任务都需要明确共享状态策略。

## 来源与出处
《操作系统导论》（本地中文版）第 25-27 章（PDF 第 210-233 页）。
