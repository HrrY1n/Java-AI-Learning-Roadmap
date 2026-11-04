# 机器级程序：从 Java 字节码到指令流

## 1. Scenario：从一个具体问题出发
同一段 Java 循环在不同机器上有不同性能；你想知道“指令”到底长什么样。

## 2. Why：为什么这个问题值得系统理解
CSAPP 使用 x86-64 汇编讲机器级程序；Java 有自己的字节码和 JVM 指令集。两者都体现寄存器、内存和栈，但层级和保证不同。

## 3. Concept：核心概念
x86-64 有通用寄存器、条件码、栈和指令编码；Java 字节码是 JVM 的抽象指令集，JVM 再解释或 JIT 成机器码。不能把 Java 栈帧当作物理栈帧。

## 4. Mental Model：把机制装进一张图
`Java 源码 -> 字节码 -> JVM/JIT -> CPU 指令`。字节码是 JVM 合约，机器码依赖具体 CPU 架构。

## 5. Minimal Code：最小示例
```text
javac MachineModel.java
javap -c -v MachineModel
```
`javap` 显示 JVM 字节码；`objdump`/`gcc -S` 才用于观察 C/x86-64。

## 6. Observe：先预测，再运行
写一个带循环和数组访问的方法，先预测字节码中的条件跳转，再用 `javap -c` 核对。

## 7. Modify：只改一个有意义的条件
把 `for` 改成增强 `for` 或 `Stream`，比较字节码差异，并说明“可读性”与“指令形态”是两件事。

## 8. Exercise：独立完成
解释为什么 Java 程序可跨 x86-64 和 ARM 运行，而 C 编译出的本地二进制通常不能。

## 9. Real Usage：联系 Java 与工程实践
排查 JIT、性能分析和 JNI 边界问题时，需要知道机器级细节属于平台实现，而非 Java 语言规范。

## 来源与出处
《CSAPP, 3rd Global Edition》Chapter 3, 3.1–3.5 节（PDF 第 200-237 页）。
