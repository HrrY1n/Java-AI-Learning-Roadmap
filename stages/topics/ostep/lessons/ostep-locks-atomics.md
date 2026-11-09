# 锁、自旋与原子操作

> 先修路标：建议先读主线 s04-visibility-volatile（JMM 的 happens-before 与 volatile 语义），再来理解锁为什么要用硬件原子指令实现。

## 1. Scenario：从一个具体问题出发
加了锁代码正确了，但高并发下吞吐下降。

## 2. Why：为什么这个问题值得系统理解
锁保证互斥，但临界区越长、竞争越多，等待成本越高。

## 3. Concept：核心概念
自旋锁用原子交换保持忙等；Java `synchronized`、`ReentrantLock` 和原子类由 JVM/库实现。锁的粒度决定并发度。

## 4. Mental Model：把机制装进一张图
`lock -> 临界区 -> unlock`。缩小临界区，避免持锁 I/O。

## 5. Minimal Code：最小示例
```java
private final Object lock = new Object();
void increment() {
    synchronized (lock) { counter++; }
}
```

## 6. Observe：先预测，再运行
先预测加锁后的稳定性，再运行源码重复测量；不要把单次时间当可靠基准。

## 7. Modify：只改一个有意义的条件
把整个方法体加锁改成只保护计数递增，比较吞吐趋势。

## 8. Exercise：独立完成
实现线程安全计数器和最小临界区版本；解释锁粒度、公平性与死锁风险。

## 9. Real Usage：联系 Java 与工程实践
数据库乐观锁、限流器和线程池任务队列都需要选择合适的同步粒度。

## 来源与出处
《操作系统导论》（本地中文版）第 28-29 章（PDF 第 233-263 页）。
