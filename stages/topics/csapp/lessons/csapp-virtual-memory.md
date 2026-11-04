# 虚拟内存：地址空间、页表与 Java 堆的边界

## 1. Scenario：从一个具体问题出发
Java 设置 `-Xmx2g` 后，操作系统进程占用可能仍大于 2GB。

## 2. Why：为什么这个问题值得系统理解
虚拟内存是操作系统的地址转换机制；JVM 堆只是其中一块映射区域，还有元空间、线程栈、代码缓存和本地库。

## 3. Concept：核心概念
CPU 用页表把虚拟地址翻译成物理地址；缺页处理把页从磁盘调入。JVM 堆由运行时管理 GC，但底层仍受操作系统虚拟内存限制。

## 4. Mental Model：把机制装进一张图
`Java 引用 -> JVM 堆对象 -> 进程虚拟地址 -> 页表 -> 物理页`。不要把 Java 引用当作物理地址。

## 5. Minimal Code：最小示例
```java
List<byte[]> buffers = new ArrayList<>();
Runtime runtime = Runtime.getRuntime();
System.out.println(runtime.maxMemory());
```

## 6. Observe：先预测，再运行
分配少量 byte 数组并打印 `maxMemory()`；不要试图读取物理地址。

## 7. Modify：只改一个有意义的条件
调整 `-Xmx` 后比较 JVM 报告值；解释进程 RSS 可能包含非堆内存。

## 8. Exercise：独立完成
画图区分 JVM 堆、线程栈、元空间和操作系统虚拟内存，并说明 GC 不能减少未释放的本地资源。

## 9. Real Usage：联系 Java 与工程实践
分析 OOM、容器内存限制和本地泄漏时，必须区分 JVM 指标与 OS 指标。

## 来源与出处
《CSAPP, 3rd Global Edition》Chapter 9（PDF 第 838-924 页）。
