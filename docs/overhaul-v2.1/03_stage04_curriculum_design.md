# 03 · Stage04 课程设计（V2.1-P3 规划）

## 定位（依据 public-roadmap.md 基线）

「Java 进阶 + CS 并行层：线程、线程池、锁/JMM；JVM；数据结构算法；HTTP/网络/OS 快速复习」。产出形态：随主线穿插并发小实验。slug=`stage04_java_advanced`。

## 先修与衔接

- **先修**：Stage01-03 全部；并发线从 s03-concurrency-basics 的两条路标直接续接（原子性"碰巧正确"、join 的 happens-before 可见性）。
- **后承**：原子类/并发容器/wait-notify 留第二批；线程池配置在 Stage06 落到 Tomcat/@Async；OSTEP 并发章节承接锁的实现与死锁分类（分工边界见 07）。
- 双链：s03-concurrency-basics ↔ s04-thread-basics 互挂 relatedLessonIds。

## 首批课程设计（为什么是并发）

算法已有专题并行线（不占主线课程位）；网络/OS 由三大 CS 专题承担；JVM 专题需要更多前置。并发是 s03 路标唯一"已承诺未兑现"的线，也是 Java 后端最刚性的进阶能力。

依赖链（严格线性）：

```text
s04-thread-basics（执行流/调度不可控）
  → s04-visibility-volatile（看得见；volatile 边界）
    → s04-synchronized-mutex（锁得住；互斥/临界区/锁对象）
      → s04-thread-pool（管得住；池化/队列/拒绝策略）
```

## 质量纪律

- 不用卡片凑数：每课 7 步概念卡（照 stage01/02 foundation 模板）+ 五段式注释可运行示例 + 独立练习为学习者 TODO。
- 示例全部确定性可断言：day01 生命周期状态机（NEW/RUNNABLE/TERMINATED）；day02 丢更新实证（修正了一版设计错误：初版只有一个累加线程无竞争，改为双线程并发并三连跑实证 125k-129k/200k）；day03 "碰巧正确 vs 必然 2000"对照；day04 池内并发上限（TreeSet 确定化）。
- 预测题 S04A1/S04A2 的代码做了确定性化设计（run 先于 start；答案集合化），保证门禁可逐字符比对。
- 第二批范围在 day04 代码注释与 08 路线图中诚实预告，不伪装已存在。
