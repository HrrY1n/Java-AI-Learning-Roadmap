# 进程 API：创建、等待与退出

## 1. Scenario：从一个具体问题出发
你想启动一个外部命令，读取输出并等待退出。

## 2. Why：为什么这个问题值得系统理解
进程 API 提供创建新执行环境、加载程序和收集结果的能力；Java 用 `ProcessBuilder` 封装相似意图。

## 3. Concept：核心概念
OSTEP 用 `fork()` 创建子进程、`exec()` 替换程序、`wait()` 收集状态。Java `ProcessBuilder.start()` 返回 `Process`，需要读取流并 `waitFor()`。

## 4. Mental Model：把机制装进一张图
`准备参数 -> 启动进程 -> 读输出 -> 等待退出 -> 处理错误`。

## 5. Minimal Code：最小示例
```java
Process process = new ProcessBuilder("java", "--version")
    .redirectErrorStream(true)
    .start();
int code = process.waitFor();
```

## 6. Observe：先预测，再运行
先预测成功命令与不存在命令的异常差异，再运行源码。

## 7. Modify：只改一个有意义的条件
把命令改为读取多行输出，观察流是否可能阻塞。

## 8. Exercise：独立完成
实现 `runVersionCommand()`：限制超时、合并输出、关闭流并返回 `(exitCode, output)`。

## 9. Real Usage：联系 Java 与工程实践
部署脚本、批处理和本地工具集成都需要显式处理进程流和退出码。

## 来源与出处
《操作系统导论》（本地中文版）第 4-5 章（PDF 第 33-51 页）。
