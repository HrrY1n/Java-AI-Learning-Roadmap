# 计算机系统总览：从 hello 到硬件路径

## 1. Scenario：从一个具体问题出发
你在 Java 里运行一个类，但看不到编译、加载、进程和 I/O 的边界。系统到底替你做了什么？

## 2. Why：为什么这个问题值得系统理解
只把 JVM 当黑盒，遇到启动失败、编码异常、性能抖动和资源泄漏时很难定位。

## 3. Concept：核心概念
一条程序生命周期包括源码翻译、可执行装载、进程创建、指令执行、系统调用、I/O 和网络通信。CSAPP 用 C/x86-64 展示这条链；Java 则先编译为字节码，再由 JVM 解释或 JIT 执行，最终仍调用操作系统服务。

## 4. Mental Model：把机制装进一张图
`源码 -> 编译/打包 -> 可执行物 -> 进程地址空间 -> CPU/缓存/内存 -> 系统调用 -> 文件与网络`。JVM 不是操作系统，也不是硬件；它运行在进程里，通过系统调用接触外部资源。

## 5. Minimal Code：最小示例
```java
public class SourceToRuntime {
    public static void main(String[] args) throws Exception {
        System.out.println("JVM 进程正在通过 stdout 调用操作系统的输出通道。");
    }
}
```

## 6. Observe：先预测，再运行
先预测：`System.out.println` 至少经过哪些层？再运行命令 `javap -c SourceToRuntime` 查看字节码，并对比 `java` 命令的输出。

## 7. Modify：只改一个有意义的条件
把输出文本改成包含中文并指定 `-Dfile.encoding=UTF-8` 运行。观察编码、终端与操作系统如何共同影响结果。

## 8. Exercise：独立完成
画出一次 Java 程序从 `javac` 到进程退出经过的层，并标注哪一层属于编译器、JVM、操作系统、硬件或网络。不要把 JVM 栈和进程虚拟内存混在一起。

## 9. Real Usage：联系 Java 与工程实践
排查 Java 启动失败、进程 OOM、文件编码和连接异常时，先区分语言运行时、操作系统资源和网络边界。

## 来源与出处
《Computer Systems: A Programmer’s Perspective, 3rd Global Edition》Chapter 1（PDF 第 38-66 页）。
