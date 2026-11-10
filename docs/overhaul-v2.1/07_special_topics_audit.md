# 07 · 三大专题审计与深化方案（V2.1-P6）

> 审计方式：43 节正文逐节扫描 + 门禁实测 + 教材映射抽样核对。审计代理为只读角色，方案已并入本轮交付。

## 实测总览（修正第一轮数字）

- 单节正文实测 **692-1566 字符**（第一轮估 1.2-1.8k）：csapp 830-1566、ostep 692-971、network 744-1530；已发布 algo 29 节 1412-4646（中位约 2.2k）——三专题深度为 algo 的 1/2 至 1/3。
- 代码课覆盖：csapp 5/14、ostep 6/17、network 2/12（共 13 个 App.java）。
- 现行门禁已覆盖：正文 >600 字符、九段式、页码引用、code 课源码同步、7 个实验行为断言、页码钉死、专题级 building 不虚报。

## 逐课分级（A=可作扩写底稿 / B=需重写结构；无 C 级空壳）

- **CSAPP（12A/2B）**：B 级为 csapp-exceptional-control-flow（ch8 核心仅一行带过）、csapp-concurrency（计数器竞态与主线重复，缺 TLP/加速比视角）。
- **OSTEP（10A/7B）**：B 级为 os-virtualization、process-api（与 csapp-exceptional 同构示例）、address-space-api（与 csapp-virtual-memory 同构）、threads-races（三重重复）、locks-atomics（ch28-29 核心缺失）、file-systems（全库最短 692 字符）、data-integrity。
- **NETWORK（8A/4B）**：B 级为 internet-overview、dns-cdn、reliable-tcp（seq/ack 无实验载体）、forwarding-ipv4-ipv6。

## 教材映射核对（抽样 6 处）

5 处一致且门禁钉死；**1 处问题已修复**：ostep-file-systems 的 PDF 371-421 吞并第 42 章（394-409 属崩溃一致性课），已加排除标注。

## 重复与先修（已做快速修复）

- counter++ 竞态四重重复（s03、csapp-concurrency、ostep-threads-races、ostep_locks_atomics）→ 已给 csapp-concurrency/ostep-threads-races 加分工路标、ostep-locks-atomics 加先修路标（指向 s04-visibility-volatile）。
- 两对同构实验（ProcessBuilder/maxMemory）→ 深化时差异化（csapp 讲机制、ostep 讲 API），本轮未动正文。

## 深化方案（每专题优先前 5）

**CSAPP**：virtual-memory（容器内存/OOM 第一原理，1-1.5 天）→ memory-hierarchy（补伪共享实验）→ bits-integers（补码回绕/移位规则表）→ exceptional-control-flow（重写，与 ostep-process-api 差异化）→ concurrency（重定位为硬件视角：TLP/Amdahl）。

**OSTEP**：locks-atomics（手写 CAS 自旋锁，1-1.5 天）→ condition-semaphores（wait/notify 主线缺口，Mesa 语义）→ cpu-scheduling（补 MLFQ 规则表）→ crash-consistency（WAL/group commit——DB/Redis/MQ 共同底座）→ swap-replacement（工作集/抖动/Clock 模拟器）。

**NETWORK**：reliable-tcp（RDT 状态机/累积确认/快速重传+停等模拟器，1-1.5 天）→ forwarding-ipv4-ipv6（最长前缀匹配器实验）→ dns-cdn（JVM DNS 缓存 TTL 陷阱）→ congestion-control（CUBIC/BBR 工程映射）→ security-tls（握手步骤+keytool 实验）。

## 转正（published）门禁建议

- 深度：概念课 ≥2500 字符、代码课 ≥2800（对标 algo 上四分位）。
- 实验：code 课必须有 examples 实验且行为断言进门禁；每专题 code 覆盖率 ≥50% 才可申请专题转正（当前 csapp 7/14、ostep 9/17、network 6/12——差口的）；概念课至少一个可核对实验，禁纯伪码。
- 练习：每节 ≥2（1 实现+1 辨析），Observe 必须含可核对预期。
- 去重：同一代码片段不得出现在两课。

## 执行顺序建议

页码/路标快速修复（**本轮已完成**）→ net-reliable-tcp 与 ostep-locks-atomics（最薄弱且最高价值）→ 其余按优先级，每完成一门收紧对应门禁。

## 与 s04 并发四课的分工边界

- 主线（s03 路标+s04）：Thread 生命周期、JMM happens-before 与 volatile、监视器锁、ThreadPoolExecutor——Java 语言层 API 与内存模型语义。
- OSTEP 独占：锁的实现（CAS/自旋/两阶段）、条件变量与信号量、死锁四条件与缺陷分类、调度（FIFO/SJF/RR/MLFQ——s04 线程池只是应用层队列）、虚存与文件系统。
- CSAPP ch12 只保留硬件视角（TLP/Amdahl/缓存一致性），API 指回 s04、机制指回 OSTEP。
