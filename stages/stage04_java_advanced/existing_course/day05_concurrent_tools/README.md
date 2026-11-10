# 并发工具进阶：CAS、Future 与 ConcurrentHashMap

> 对应示例：`day05_concurrent_tools/App.java`

## 1. `AtomicInteger` 与无锁 CAS 边界

- **原理**：CAS（Compare-And-Set）由底层 CPU 原子指令支持——“我认为主存的值现在是 `expected`，如果是就改成 `newValue`，不是就什么都不做并重试”。没有线程阻塞挂起与唤醒开销，单变量自增通常比粗粒度 `synchronized` 更快。
- **两条工程边界**：
  1. **只保护单个变量**：如果需要“余额减 100 且积分加 100”两个变量一起原子变化，`AtomicInteger` 护不住整体不变式，必须用锁。
  2. **高并发写退化与替代**：大量线程同时死循环重试 CAS 会吃满 CPU，此时 JDK 8+ 提供了分段累加的 **`LongAdder`**；另外普通基本类型 CAS 还有 **ABA 问题**（值从 A 变 B 又变回 A，CAS 以为没动过——需要版本号时用 `AtomicStampedReference`）。

## 2. `Callable<V>`、`Future<V>` 与 `CompletableFuture` 路标

`Runnable.run()` 没有返回值、也不能向上抛出受检异常。提交 `Callable<V>` 给线程池会立刻拿到一个凭证 **`Future<V>`**，主线程可以继续干别的事，到需要结果时调用 `future.get()` 阻塞取结果（任务若内部抛异常，会被包进 `ExecutionException` 带回主线程）。工程上更常用 `get(timeout, unit)` 的超时版防无限等待，以及 `cancel(mayInterruptIfRunning)` 放弃不再需要的任务——本课实验不引入它们，Stage 06 异步实战时再用。

- **必须配对的资源纪律**：像示例里把线程池放进 `try { ... } finally { pool.shutdown(); }`，确保即便 `future.get()` 抛异常，非守护工作线程依然会被安全关闭。
- **工程后续**：`Future.get()` 仍需要阻塞等待且不便串联多个异步任务；Java 8+ 引入了支持回调链与多路编排的 `CompletableFuture`（在 Stage 06 项目实战中展开）。

## 3. `ConcurrentHashMap` 的演进与“复合操作陷阱”

| 版本/行为 | 普通 `HashMap` 并发写 | `ConcurrentHashMap` |
| --- | --- | --- |
| JDK 7 | 并发扩容头插法可能造**成环死链**，CPU 100% | 分段锁（Segment） |
| JDK 8+ | 尾插法消除成环，但仍**丢失更新/数据覆盖**或抛 CME | **CAS + `synchronized` 桶头节点**（锁粒度细到单桶） |
| `null` 支持 | 允许 1 个 `null` 键、多个 `null` 值 | **严禁 `null` 键和 `null` 值**（否则 `get` 返回 `null` 时分不清“不存在”还是“值为 null”） |

**高频误区：单步安全 ≠ 组合安全**：`hits.get("api")` 与 `hits.put("api", cur + 1)` 单独看都线程安全，但合在一起变成“先读后写”的间隙竞态，照样丢更新！**必须使用 `merge`、`compute`、`putIfAbsent` 等原子复合方法**；同时注意 `computeIfAbsent` 在执行期间会锁住当前桶头节点，绝不能在它的计算回调 lambda 里再去修改同一张 `ConcurrentHashMap` 的其他 key（JDK 9+ 会直接报错或引发死锁）。

## 学习验收与自我检核

- **需要掌握什么**：区分 CAS、锁与 `LongAdder` 的适用范围；使用 `try-finally` 管理线程池；在 `ConcurrentHashMap` 上使用原子复合方法并避开 `null` 键陷阱。
- **如何证明理解**：① 能一眼挑出 `if (!map.containsKey(k)) map.put(k, v)` 在并发下的漏洞并改写为 `putIfAbsent` / `computeIfAbsent`；② 说明为什么不能用 `AtomicInteger` 护住两个关联字段的同步变更；③ 说清为什么 `ConcurrentHashMap` 不允许 `null`。
- **什么情况属于尚未掌握**：认为“换成 `ConcurrentHashMap` 后怎么写都线程安全”；或提交完异步任务不写 `finally { pool.shutdown(); }`。
- **针对错误如何复习**：异步聚合实操完成实验室 `s04-thread-pool-lab`；锁与复合操作回到 `s04-synchronized-mutex`。
