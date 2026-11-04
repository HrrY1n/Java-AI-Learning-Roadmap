# 地址空间与内存 API：从 malloc/free 到 Java 堆

## 1. Scenario：从一个具体问题出发
C 需要 `malloc/free`，Java 交给 GC，但服务仍可能内存增长。

## 2. Why：为什么这个问题值得系统理解
内存 API 决定分配、释放和错误责任；GC 不等于没有资源泄漏。

## 3. Concept：核心概念
地址空间包含代码、数据、堆和栈。C 手动管理堆；JVM 管理 Java 对象并自动回收不可达对象。本地资源、大缓存和静态集合仍可能导致泄漏。

## 4. Mental Model：把机制装进一张图
`栈：方法生命周期；堆：对象生命周期；元空间：类元数据；OS：整个进程空间`。

## 5. Minimal Code：最小示例
```java
List<byte[]> cache = new ArrayList<>();
cache.add(new byte[1024 * 1024]);
System.out.println(Runtime.getRuntime().totalMemory());
```

## 6. Observe：先预测，再运行
先预测持续向静态列表添加数据是否会被 GC 回收，再运行源码观察内存增长趋势。

## 7. Modify：只改一个有意义的条件
把列表改成有上限的缓存，或加 `remove()`，观察增长是否停止。

## 8. Exercise：独立完成
画图区分 Java 堆、栈、元空间、直接内存和进程虚拟内存；说明哪些被 GC 管理。

## 9. Real Usage：联系 Java 与工程实践
排查 OOM、容器限额和缓存设计时，不要只看一个 JVM 指标。

## 来源与出处
《操作系统导论》（本地中文版）第 13-14 章（PDF 第 99-114 页）。
