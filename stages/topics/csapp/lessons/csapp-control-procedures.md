# 控制流、过程调用与数组/结构布局

## 1. Scenario：从一个具体问题出发
递归过深抛出 `StackOverflowError`；数组越界在 Java 有异常，在 C 里可能写坏内存。

## 2. Why：为什么这个问题值得系统理解
控制转移和栈帧是所有语言共享的机制；安全边界不同会决定错误的表现方式。

## 3. Concept：核心概念
x86-64（Linux/System V ABI）的前 6 个整型/指针参数经寄存器传递（rdi/rsi/rdx/rcx/r8/r9），返回值放在 rax；更多参数压栈，栈必须 16 字节对齐。寄存器分为 caller-saved 与 callee-saved，决定了调用前后谁负责保存。栈帧用 rbp/rsp 划分，保存返回地址、局部数组和溢出的局部变量。C 结构体按成员对齐填充；Java 对象布局（对象头、字段排列、压缩指针）由 JVM 决定，不能把 C 的布局规则套到 Java 上。

## 4. Mental Model：把机制装进一张图
`调用 -> 传参（寄存器优先）-> 建帧 -> 执行 -> 返回值进 rax -> 恢复帧`。C 允许低级指针操作；Java 用引用、边界检查和 GC 隐藏部分布局，但方法调用栈的形状在两层是一致的。

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
