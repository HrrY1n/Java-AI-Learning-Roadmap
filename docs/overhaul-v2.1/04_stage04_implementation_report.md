# 04 · Stage04 实施报告（V2.1-P3）

## 交付物（提交 4363c8c）

| 项 | 明细 |
|---|---|
| 课程 | s04-thread-basics / s04-visibility-volatile / s04-synchronized-mutex / s04-thread-pool（4 门 foundation，published） |
| 示例源码 | stages/stage04_java_advanced/existing_course/day01-04（独立包 com.javaroadmap.stage04.dayXX*，五段式注释头） |
| 预测题 | S04A1（start vs run）、S04A2（池并发上限）——JVM 实测逐字符核对 |
| 修改题 | S04B1（AtomicInteger 对照）、S04B2（锁粒度）挂接示例 |
| 接线 | stages.json stage04 转 published + lessonOrder；registry 显式登记 8 个新 ID；verify_manifest +4 行；s03 反向链接 |
| 导航 | stages/stage04_java_advanced/README.md（课程导航表/学习方式/运行方式） |

## 验证证据

- `verify_java.sh` **103/103**（99+4 新课；day02 的不确定值行只断言前缀，确定行全断言）。
- `prediction-semantics` **23 条目**全实测；`content.test` stage04 计数断言（4 课/2 预测/2 修改）。
- core E2E 21/21（课程数断言 51→55 同步）；字体覆盖 1367 字通过。
- 全站总量：**55 门主线课、22 道预测题、8 道修改题**。

## 每课教学要点

| 课 | 核心心智模型 | 关键实验/边界 |
|---|---|---|
| thread-basics | main 本身是线程；start=登记调度；交错不可控 | getState 三态实测；「start 改 run」即 S04A1 |
| visibility-volatile | volatile 写冲主存/读绕缓存；happens-before 概念级 | **volatile ≠ 原子性**：双线程 100k 累加三连跑丢更新实证；「println 碰巧可见」陷阱显式教学 |
| synchronized-mutex | 每对象一把锁；锁对象决定互斥范围；可重入 | 「两把锁=没锁」修改实验；「碰巧正确比出错更难排查」承自 s03 |
| thread-pool | 常驻工人/上限/队列/拒绝策略；shutdown 语义 | 5 任务 2 工人实测；Executors 工厂的无界队列风险路标 |

## 诚实披露

- 第二批课程（原子类、并发容器、Callable/Future、wait-notify/Condition）未建；day04 代码注释与 README 已路标。
- 本批无 web 交互练习（exercises 在 Stage04 断供）——需按 Stage03 模式单文件化设计，与第二批课程一起补。
- 内容评分自评（待独立评审复核）：四课按 7 维标准约 87-88（技术断言全部有实测支撑；含一次设计错误的中途修正，见 09 日志）。
