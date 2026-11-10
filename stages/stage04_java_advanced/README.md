# Stage 04 · Java 进阶（并发基础）

本阶段定位：Java 进阶 + CS 并行层（公开路线基线）。首批课程为**并发基础四课**，从 s03-concurrency-basics 的原子性/可见性路标直接续接；线程池收尾衔接后端服务的并发容量思维。算法并行线（[Hello 算法专题](../topics/)）与本阶段穿插进行，HTTP/网络/OS 快速复习由三大 CS 专题承担。

## 课程导航（按学习顺序）

| 课 | 主题 | 解决的真实问题 | 完成标准 |
| --- | --- | --- | --- |
| [线程与执行流](existing_course/day01_thread_basics/) | Thread/start/join/生命周期 | 为什么需要第二条执行流，调度为什么不可控 | 能解释 start 与 run 的区别；能预测交错的不确定性 |
| [可见性与 volatile](existing_course/day02_visibility_volatile/) | 可见性、happens-before 初步、volatile 边界 | 一个线程的写入为什么可能"看不见" | 能证明 volatile 不保证原子性（丢失更新实验） |
| [synchronized 与互斥](existing_course/day03_synchronized_mutex/) | 监视器锁、临界区、锁对象 | 读-改-写如何被拆散、如何锁回去 | 能改造出线程安全类并解释锁对象决定互斥范围 |
| [线程池与 Executor](existing_course/day04_thread_pool/) | 池化、四核心概念、shutdown | 为什么不随用随造线程 | 能预测池的并发上限；能解释队列满才扩工人的次序 |
| [并发工具：原子类、Future 与并发集合](existing_course/day05_concurrent_tools/) | AtomicInteger CAS、Callable/Future、ConcurrentHashMap | 为什么不手写底层锁也能解决常见并发需求 | 能说明单方法线程安全与复合操作竞态的区别 |

## 学习方式

1. 读课程概念卡 → 打开 `codeDirectory` 源码，按注释头 Observe 预测 → 编译运行核对 → 做「修改一个条件」实验。
2. 网站预测题：S04A1（start vs run）、S04A2（池内并发上限）；修改题 S04B1/B2 在对应示例上完成。
3. 结构化编程练习（已上站，含 L1–L4 提示与精确验证用例）：[practice/s04-exercises.md](practice/s04-exercises.md)，独立实现放入 [my_practices/](my_practices/README.md)。

## 与其他线的关系

- 先修：Stage 03 全部（尤其 s03-concurrency-basics）。
- 后续：Condition/wait-notify、CountDownLatch/CompletableFuture 属进阶专题或后续按需扩展；线程池调优与 Spring @Async 在 Stage 06 落地；数据库实践（Stage 05）只需先掌握 Java 基础与异常/IO，不强制等并发全部学完。
- 算法线：`stages/topics/algorithms/` 与网站 Hello 算法专题并行，不占用本阶段课程位。

## 目录与运行方式

```bash
cd stages/stage04_java_advanced/existing_course/day01_thread_basics
javac -encoding UTF-8 -d out com/javaroadmap/stage04/day01threadbasics/*.java
java -Dstdout.encoding=UTF-8 -cp out com.javaroadmap.stage04.day01threadbasics.App
```

每个课程目录是独立源码根；`out/` 是一次性输出目录（勿提交）。
