# 地址转换：基址/界限、分段与保护

## 1. Scenario：从一个具体问题出发
两个程序都从“相同地址”开始，却没有互相覆盖。

## 2. Why：为什么这个问题值得系统理解
地址转换提供隔离、保护和灵活分配；Java 引用位于 JVM 层之上。

## 3. Concept：核心概念
基址/界限是最简单的动态重定位；分段为不同区域提供独立基址和界限；OS 处理越界。现代系统用分页和页表实现更细粒度映射。

## 4. Mental Model：把机制装进一张图
`虚拟地址 + 段/页机制 -> 物理地址`，越界触发保护异常。

## 5. Minimal Code：最小示例
```java
// 教学模拟：virtual = segmentBase + offset
static long translate(long base, long limit, long offset) {
    if (offset < 0 || offset >= limit) throw new IndexOutOfBoundsException();
    return base + offset;
}
```

## 6. Observe：先预测，再运行
先预测偏移 0、limit-1、limit 的结果，再运行模拟器核对。

## 7. Modify：只改一个有意义的条件
把 `limit` 改小或把 `offset` 改成负数，观察保护逻辑。

## 8. Exercise：独立完成
实现一个只用于教学的一维地址翻译模拟器，并用注释说明它不代表真实页表。

## 9. Real Usage：联系 Java 与工程实践
理解 OOM、地址随机化、内存保护和容器隔离时，需要知道虚拟地址不是物理地址。

## 来源与出处
《操作系统导论》（本地中文版）第 15-17 章（PDF 第 114-146 页）。
