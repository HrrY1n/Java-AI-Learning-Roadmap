# 可见性、重排序与 Java 内存模型（JMM）

> 对应示例：`day02_visibility_volatile/App.java`

## 1. 为什么写进一个变量，另一个线程却可能永远“看不见”？

多线程环境下，变量读写可能经过两层优化：
1. **CPU 缓存与工作内存**：线程可能长时间读自己核的高速缓存，还没同步到主内存。
2. **JIT 编译器循环提升（Hoisting）**：对 `while (running) { spins++; }` 这样循环体里既不修改 `running` 又没有同步动作的代码，JIT 编译器在默认条件下会认为“当前线程没改 `running`”，直接优化成**只读一次并一直死循环**！

> 注意本课示例 `day02_visibility_volatile/App.java` 的循环体 `while (running) { spins++; }` 里**故意没有放 `System.out.println`**——如果你加上打印语句，因为 `println` 内部带有 `synchronized` 锁，它会在每次打印时顺带刷新内存可见性，反而把可见性 bug 掩盖住；这也是并发调试里最让人困惑的“加了日志 bug 就消失”现象。

## 2. `volatile` 与 happens-before 规则（JLS §17.4.5）

给共享标志位加上 `volatile` 有两重保证：
1. **可见性**：写一个 `volatile` 变量时，强迫刷新工作内存，且**在同步顺序（synchronization order）中，这次写 happens-before 后续对同一变量的读**。依托 happens-before 的**传递性**，写方在 `volatile` 写之前修改的所有普通变量，在读方读到新值之后也一起可见。
2. **禁止关键指令重排序（有序性）**：经典场景是双重检查锁单例（DCL）：`instance = new Singleton()` 分成“分配内存 → 初始化对象 → 把引用赋给 `instance`”。如果没有 `volatile` 禁止重排序，可能先把未完成初始化的半成品引用赋给 `instance`，导致另一线程拿到空壳！

## 3. `volatile` 守不住的边界：非原子读-改-写

```text
volatile count++ 实际是三步：
  线程 A 读 count = 100 ──▶ 算 100 + 1 ──▶ 正要写回
  线程 B 读 count = 100 ──▶ 算 100 + 1 ──▶ 写回 101 ──▶ 线程 A 随后也写回 101（一次加法丢失！）
```

`volatile` 只保证“读时拿到最新值、写时立刻公布”，但**锁不住“读完之后、写回之前”被别人插队**。本课示例双线程各加 `100_000` 次，实测往往只剩下 `12 万~13 万`。计数、状态流转必须靠下一课的 `synchronized` 或后续 `AtomicInteger`。

## 学习验收与自我检核

- **需要掌握什么**：说清可见性失效的两个来源（缓存与 JIT 提升）；理解 `volatile` 写-读的 happens-before 与传递性；牢记 `volatile` 不保原子性。
- **如何证明理解**：① 能解释为什么在循环里加 `println` 会让原本死循环的普通 `boolean` 停下来；② 能指出 DCL 单例缺失 `volatile` 时的半初始化风险；③ 独立写出丢更新实测并换用 `AtomicInteger` 修复。
- **什么情况属于尚未掌握**：以为“加了 `volatile` 就线程安全了”，拿 `volatile int count` 去写并发计数器；或以为单次测试刚好跑出 200000 就安全。
- **针对错误如何复习**：原子性丢失去做编程实验室 `s04-safe-counter`；互斥模型进入 `s04-synchronized-mutex`。
