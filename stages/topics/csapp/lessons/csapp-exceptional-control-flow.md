# 异常、进程与系统调用：Java 异常之外的控制流

## 1. Scenario：从一个具体问题出发
在后端 Java 服务里用 `ProcessBuilder` 调起外部命令（例如执行 FFmpeg 转码、调用 Python 脚本或运行 `git`）时，你常遇到两个令人抓狂的现象：
1. 外部命令报错失败了（退出码为 `1` 或 `2`），但你包在外层的 `try { ... } catch (Exception e)` **根本没进 `catch`**，程序以为成功继续往下跑；
2. 子进程输出内容一多，父进程在 `process.waitFor()` 那一行突然**永久卡死不动**，既不报错也不退出！

## 2. Why：为什么这个问题值得系统理解
Java 的 `try / catch` 只处理**JVM 单进程内部调用栈上的语言级异常**。一旦程序通过系统调用创建外部子进程、或者收到来自操作系统的信号与硬件中断，控制权就进入了《CS:APP》第 8 章定义的**异常控制流（Exceptional Control Flow, ECF）**领域：
- 控制流不再只跟随你写的 `if / for / method()` 顺序跳转，而是随时响应内核、硬件计时器与其他进程的异步事件；
- 分清“JVM 内异常”、“子进程退出码（`waitpid` 回收结果）”与“OS 异步信号/管道缓冲区阻塞”，才能写出在生产环境不会挂死或漏报错误的守护与调用代码。

## 3. Concept：核心概念

### CSAPP 第 8 章的四类硬件/内核级异常控制流
| 类别 | 触发方式 | 来源与行为 | 常见例子 |
| --- | --- | --- | --- |
| **中断 (Interrupt)** | **异步** | 来自处理器外部硬件（I/O 设备、时钟），当前指令跑完后跳去内核中断处理程序，再返回下一条指令 | 磁盘读写完成、网卡收包、时钟滴答 |
| **陷阱 (Trap)** | **同步** | 用户程序有意执行的特殊指令，用于受控切入内核态执行系统调用 | `read`、`write`、`fork`、`execve` |
| **故障 (Fault)** | **同步** | 执行指令时触发的潜在可恢复错误；若内核修复成功则返回原指令重试，否则终止进程 | 缺页异常（Page Fault）、除零 / 段错误 `SIGSEGV` |
| **终止 (Abort)** | **同步** | 不可恢复的致命硬件错误，直接把控制权交给终止程序 | 内存奇偶校验硬件错误 |

### 进程生命周期、僵尸进程与阻塞陷阱
- **`fork` + `execve` + `waitpid`**：在类 Unix 系统上创建子进程通常先复制父进程上下文（`fork`），再用新程序映像替换（`execve`），Java 的 `ProcessBuilder.start()` 在底层就封装了这套跨平台原语（Windows 下对应 `CreateProcess`）。
- **僵尸进程（Zombie）**：子进程终止后，内核不会立刻释放它的退出码与进程表项，一直等到父进程调用 `waitpid`（Java 中对应 `process.waitFor()`）**回收（Reap）**；若父进程一直不回收又长期不退出，僵尸表项会慢慢耗尽进程名额；若父进程先于子进程死掉，孤儿进程会由 `init`（PID 1）或系统收养进程代为回收。
- **信号（Signal）**：内核或另一进程向目标进程发送的软件异步通知（如 `SIGTERM` 优雅停机、`SIGKILL` 强制杀死——注意 `SIGKILL` 不可被任何 `try/catch` 甚至信号处理器捕获！）。
- **管道写满死锁**：父子进程靠有限大小的 OS 管道（通常几十 KB）传递 stdout/stderr。如果父进程先卡在 `process.waitFor()` 等子进程退出而不先读走流，子进程一旦写满管道就会阻塞在 `write` 系统调用上——父等子退出、子等父读流，双方永久死锁！

## 4. Mental Model：把机制装进一张图
```text
Java JVM 进程（try/catch 只管这一块栈内异常）
  │
  ├── ProcessBuilder.start() ──▶ 系统调用（Trap）创建 OS 子进程
  │       ├── 找不到可执行程序 ──▶ 操作系统启动失败 ──▶ JVM 转换抛出 IOException
  │       ├── 子进程正常运行结束 ──▶ 必须边读流（防管道满死锁）边 waitFor(timeout)
  │       └── 子进程出错退出 exit=1 ──▶ 不会抛 Java 异常！必须主动判断 exit != 0
  └── 超时挂死 ──▶ destroyForcibly()（发终止信号）+ waitFor()（回收防止僵尸）
```

## 5. Minimal Code：最小示例
`stages/topics/csapp/examples/csapp_exceptional_control_flow/.../App.java` 完整演示了三类结果的分界与管道防死锁读法（与 OSTEP 的简单版本完全区分）：
```java
boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
if (!finished) {
    process.destroyForcibly(); // 强杀超时子进程
    process.waitFor();         // 回收退出状态，避免留下僵尸进程
}
```
同时对照演示了“非法参数触发非 0 退出码不抛异常”与“可执行文件不存在才触发 `IOException`”。

## 6. Observe：先预测，再运行
先预测三段测试分别会进哪条路径再运行 `stages/topics/csapp/examples/csapp_exceptional_control_flow/com/javaroadmap/csapp/csapp_exceptional_control_flow/App.java`：① 执行 `java -version` 的 `exitCode`；② 执行 `java --nonexistent-flag-for-ecf-test` 是进 `catch (IOException)` 还是正常打印 `exitCode=1`；③ 执行不存在的可执行文件名又会发生什么？

## 7. Modify：只改一个有意义的条件
1. 把 `runControlled` 里的 `timeoutSeconds` 传一个超长挂起命令并设超时为 `1` 秒（例如启动一个 `java` 子命令执行短暂睡眠的演示类或验证超时分支），观察 `timedOut` 触发 `destroyForcibly()` 并成功回收而不卡死主进程。
2. 试着把 `reader.start()` 注释掉再执行输出几万行文本的子进程命令，思考并观察为什么在管道满后 `waitFor()` 会无限阻塞。

## 8. Exercise：独立完成
1. 在自己的副本中把 `runControlled` 封装成受控命令执行器：若 `timedOut` 为 true 抛出自定义的 `TimeoutException`，若 `exitCode != 0` 把合并输出的最后 10 行错误内容收集进 `IllegalStateException` 报错消息中，确保绝不会放过任何静默失败的子进程。
2. 回答并区分：OS 缺页异常（Page Fault）、JVM 空指针异常（`NullPointerException`）与子进程收到 `SIGTERM` 信号各自属于哪一层的控制流变化？

## 9. Real Usage：联系 Java 与工程实践
这正是本仓库验证脚本 `web/scripts/verify-practice.mjs` 的核心工程结构（受控子进程 + 超时整树强杀 + stdout/stderr 并发引流防管道阻塞 + 64KB 输出上限防护）。生产环境中调用容器 CLI、FFmpeg、LibreOffice 转换文档或数据库备份工具时，**“异步读流 + 有界超时 + `destroyForcibly` 回收 + 检查非零退出码”** 四件套缺一不可。

## 来源与出处
《CSAPP, 3rd Global Edition》Chapter 8（PDF 第 758-838 页）。
