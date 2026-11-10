# 04 · Stage 04 实践闭环建设报告（V2.2-P3）

> 解决问题：V2.1 发布了 Stage 04 并发四课，但结构化 Web 独立编程练习为 0；且 `S04B1` 提到的 `AtomicInteger` 及线程池练习需要的 `Callable/Future` 在主线课程中尚无专课讲解。

## 一、三个结构化并发练习（已上站，ID 登记入 `registry.json`）

题面与四级渐进提示（L1–L4）源文件：`stages/stage04_java_advanced/practice/s04-exercises.md`。

| 练习 ID | 标题与核心难点 | 并发非确定性建模策略（绝不赌调度顺序） | 用例与参考实现验证 |
| --- | --- | --- | --- |
| `s04-thread-order` | **线程启动与阶段汇合** (`ThreadOrderLab`) | 两线程写入各自独立槽位 `sums[0]`/`sums[1]` 并记录 `Thread.currentThread().getName()`；先全 `start()` 再全 `join()` 后由主线程按槽位汇总打印。利用 `Thread.join()` happens-before 保证可见性，同时用非 `"main"` 名称检查抓出误调 `.run()` 的错误 | 4 组用例（`100 200` 正常、`100000 100000` 防 `int` 溢出、`-5 10` 非法、`abc 10` 非数字）— `ThreadOrderLabAnswer` 实测 `verifyPractice` **4/4 PASS** |
| `s04-safe-counter` | **线程安全计数器** (`SafeCounterLab`) | 封装 `private long value` + 同锁 `synchronized increment()/get()`，多线程并发累加后按确定性终值 `threads * perThread` 与非 `"main"` 校验输出；在说明中明确“单次无锁碰巧等于期望也不算安全” | 4 组用例（`4 50000` 并发、`1 0` 边界、`0 100` 非法线程数、`2 -10` 负次数）— `SafeCounterLabAnswer` 实测 `verifyPractice` **4/4 PASS** |
| `s04-thread-pool-lab` | **线程池任务执行与优雅关闭** (`ThreadPoolLab`) | 显式 `ThreadPoolExecutor(poolSize, poolSize, ...)` 提交 `Callable<Long>`，通过按提交序收集的 `List<Future<Long>>` 依次 `.get()` 保证结果列表顺序 100% 确定；同时检查池线程集合大小 `<= poolSize` 且非 `"main"`、显式 `shutdown() + awaitTermination()` 确认 `isTerminated()` | 4 组用例（`2 5` 平方汇总、`2 0` 零任务正常关闭、`0 5` 非正池大小、`2 -1` 负任务数）— `ThreadPoolLabAnswer` 实测 `verifyPractice` **4/4 PASS** |

注：`exercise-java.test.mjs` 验证全部 12 门练习（含本 3 门）的纯 TODO 骨架均可原生 `javac` 编译且无答案泄漏；`content.test.mjs` 锁定 3 个答案类不进入默认 `catalog.json` 序列化输出。

## 二、补充课程：`s04-concurrent-tools`（并发工具进阶）

- 文件：`stages/stage04_java_advanced/existing_course/day05_concurrent_tools/`（`App.java` + `README.md`）+ `web/content/lessons/stage04/s04-concurrent-tools.json`。
- 解决先修断档：在进入 `s04-thread-pool-lab` 的 `Callable/Future` 和 `S04B1` 的 `AtomicInteger` 前，把 CAS 无锁计数（含 ABA/`LongAdder`）、`Future` 取回异步结果（含 `try-finally` 防线程池泄漏）与 `ConcurrentHashMap`（JDK 7/8 演进、禁止 `null`、复合方法 `merge`/`compute` 及 `computeIfAbsent` 桶锁禁忌）讲透并配有四要素验收闭环。
- 回归：`verify_manifest.tsv` 实测输出 `AtomicInteger 计数：200000` / `Future 取回异步和：5050` / `ConcurrentHashMap 原子累计 api：2000`；阶段第二批其他进阶 темы（`Condition`/复杂协调器）诚实留作后续按需扩展，不凑数。
