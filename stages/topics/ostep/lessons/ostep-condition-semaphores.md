# 条件变量、生产者消费者与信号量

## 1. Scenario：从一个具体问题出发
消费者在空队列上轮询浪费 CPU；生产者在满队列上覆盖数据。

## 2. Why：为什么这个问题值得系统理解
需要“等待条件成立”的机制，而不只是互斥。

## 3. Concept：核心概念
条件变量让线程等待或通知；必须使用 while 重查条件。信号量计数资源，也可实现互斥。Java 提供 `Condition`、`BlockingQueue` 和 `Semaphore`。

## 4. Mental Model：把机制装进一张图
`锁保证状态一致；条件变量挂起线程；通知后重新检查条件`。

## 5. Minimal Code：最小示例
```java
BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(2);
queue.put(1);
Integer value = queue.take();
```

## 6. Observe：先预测，再运行
先预测容量为 2 的队列上生产者放第 3 个元素时 `put` 的行为，再运行源码：输出里会出现“队列已满，生产者阻塞等待空间...”，并且第 3 个元素的“已放入”必然出现在某次“取出”之后——这就是条件变量在阻塞与唤醒。消费者故意晚启动，制造了观察窗口。

## 7. Modify：只改一个有意义的条件
把容量从 2 改成 1，或在消费者前加延迟，观察生产者如何等待。

## 8. Exercise：独立完成
实现有界缓冲区：手写 `ReentrantLock + Condition`，并用 `BlockingQueue` 版本对照。

## 9. Real Usage：联系 Java 与工程实践
任务队列、日志缓冲和限流器常用生产者消费者模型。

## 来源与出处
《操作系统导论》（本地中文版）第 30-31 章（PDF 第 263-293 页）。
