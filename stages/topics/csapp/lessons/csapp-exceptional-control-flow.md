# 异常、进程与系统调用：Java 异常之外的控制流

## 1. Scenario：从一个具体问题出发
子进程退出码不是 0，Java 却没有抛异常；你必须自己检查 `Process`。

## 2. Why：为什么这个问题值得系统理解
操作系统通过异常、陷阱、中断和进程切换实现受控的服务入口；语言异常只是其中一种错误表达。

## 3. Concept：核心概念
系统调用把控制权交给内核；进程有创建、执行、等待和退出。信号是异步通知。Java `try/catch` 处理语言级异常，`ProcessBuilder` 暴露的是子进程结果。

## 4. Mental Model：把机制装进一张图
`Java 异常` 在 JVM 内传播；`信号/系统调用` 在操作系统层；二者不能混用。

## 5. Minimal Code：最小示例
```java
Process process = new ProcessBuilder("java", "--version").start();
int exit = process.waitFor();
System.out.println(exit);
```

## 6. Observe：先预测，再运行
先运行成功命令，再把命令改成不存在，预测 `IOException` 和退出码的区别。

## 7. Modify：只改一个有意义的条件
读取并合并子进程 stdout/stderr，观察阻塞和缓冲问题。

## 8. Exercise：独立完成
写一个安全调用本机 `java --version` 的方法：校验命令、读取输出、等待退出码并关闭流。

## 9. Real Usage：联系 Java 与工程实践
运维脚本、服务守护和命令行工具需要显式处理进程退出码、超时和流关闭。

## 来源与出处
《CSAPP, 3rd Global Edition》Chapter 8（PDF 第 758-838 页）。
