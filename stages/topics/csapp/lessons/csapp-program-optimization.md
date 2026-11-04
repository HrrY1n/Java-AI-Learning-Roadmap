# 程序性能：可测、可证伪的优化

## 1. Scenario：从一个具体问题出发
你把循环写得更“聪明”，但结果时快时慢。

## 2. Why：为什么这个问题值得系统理解
没有测量条件的优化容易变成猜测；JIT、GC、CPU 频率和缓存都会改变结论。

## 3. Concept：核心概念
先定义操作计数和测量条件，再检查算法、数据结构、循环不变量、内存访问和并行性。Java 里还要考虑 JIT 预热和 GC。

## 4. Mental Model：把机制装进一张图
优化流程：正确性 -> 复杂度 -> 瓶颈 -> 受控实验 -> 验证。

## 5. Minimal Code：最小示例
```java
long start = System.nanoTime();
runOnce();
long elapsed = System.nanoTime() - start;
// 仅演示计时 API；单次时间不能作为可靠 benchmark。
```

## 6. Observe：先预测，再运行
先写功能正确的两个版本，再各运行多次，记录输入规模、JVM 参数和结果区间。

## 7. Modify：只改一个有意义的条件
把重复计算改成局部变量，或把算法从 O(n²) 改为 O(n log n)，比较测量区间。

## 8. Exercise：独立完成
选择一个真实方法，写明“不改正确性”的优化假设，并设计至少三个输入规模的测量记录。

## 9. Real Usage：联系 Java 与工程实践
工程中优先用 profiling 找热点；JMH 才适合微基准，手工 `System.nanoTime()` 只能用于粗略观察。

## 来源与出处
《CSAPP, 3rd Global Edition》Chapter 5（PDF 第 532-616 页）。
