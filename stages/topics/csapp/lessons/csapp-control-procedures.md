# 控制流、过程调用与数组/结构布局

## 1. Scenario：从一个具体问题出发
递归过深抛出 `StackOverflowError`；数组越界在 Java 有异常，在 C 里可能写坏内存。

## 2. Why：为什么这个问题值得系统理解
控制转移和栈帧是所有语言共享的机制；安全边界不同会决定错误的表现方式。

## 3. Concept：核心概念
x86-64 用条件码和跳转实现分支，用栈帧保存局部数据和返回地址。Java 方法帧属于 JVM 栈，数组有长度与边界检查，对象布局由 JVM 决定。

## 4. Mental Model：把机制装进一张图
`调用 -> 建帧 -> 执行 -> 返回`。C 允许低级指针操作；Java 用引用、边界检查和 GC 隐藏部分布局。

## 5. Minimal Code：最小示例
```java
static int sum(int[] values) {
    int total = 0;
    for (int value : values) total += value;
    return total;
}
```

## 6. Observe：先预测，再运行
先预测递归深度约 10,000 是否安全，再运行源码并观察异常类型。

## 7. Modify：只改一个有意义的条件
把递归改成迭代，或把 `values.length` 边界写错，观察异常消息如何指向数组边界而不是内存地址。

## 8. Exercise：独立完成
比较“Java 数组越界异常”和“C 缓冲区溢出”的表现与防护，说明为什么不能把二者等同。

## 9. Real Usage：联系 Java 与工程实践
调试递归、性能分析和理解 JNI 崩溃时需要栈帧概念；写 Java 业务代码时依赖边界检查而非裸指针。

## 来源与出处
《CSAPP, 3rd Global Edition》Chapter 3, 3.6–3.10 节（PDF 第 237-330 页）。
