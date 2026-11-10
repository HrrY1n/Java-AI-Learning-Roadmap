# 锁、自旋与原子操作

> 先修路标：建议先读主线 s04-visibility-volatile（JMM 的 happens-before 与 volatile 语义）与 s04-synchronized-mutex（Java 监视器锁语义），再来理解操作系统与硬件层是如何从零构造出一把锁的。

## 1. Scenario：从一个具体问题出发
在 `s04-synchronized-mutex` 中，你已经学会用 `synchronized (lock)` 保护临界区，但“锁”并不是空气变出来的魔法——如果在只有普通 `boolean flag = false` 变量的前提下尝试“先检查 `while (flag) {}`，再设为 `flag = true`”来自己造锁，两个线程照样会在“检查与设置之间”同时冲进临界区！另外，等待锁时是一直死循环耗着 CPU“自旋”，还是让操作系统把自己挂起让出 CPU？

## 2. Why：为什么这个问题值得系统理解
Java 的 `synchronized`、`ReentrantLock` 和数据库行锁，底层都绕不开《操作系统导论》第 28 章讨论的两个核心矛盾：
1. **锁本身的互斥谁来保证？** 不能在应用层用普通内存读写实现互斥——必须由 CPU 硬件提供不可分割的原子指令（如 Test-And-Set、Compare-And-Swap）。
2. **抢不到锁的线程怎么等？** 一味自旋会烧空 CPU 时间片（尤其在单核 CPU 上简直是灾难）；一味系统调用挂起又有上下文切换开销。理解这一对矛盾，你才看得懂为什么工程上严禁“持锁执行网络/磁盘 I/O”，也才看得懂 JVM 的锁膨胀与两阶段锁思想。

## 3. Concept：核心概念

### 从“双标志失效”到硬件原子指令
OSTEP 第 28 章从最朴素的尝试讲起：软件自己用普通 `int flag = 0;` 写 `while (flag == 1); flag = 1;` 会因为两次内存访问之间发生时钟中断切换线程而双双通过检查。硬件解法是把“读取旧值 + 判断 + 写入新值”做成**单条不可中断的指令**：
- **Test-And-Set（测试并设置）**：原子地把新值写入内存，同时返回内存里的旧值。
- **Compare-And-Swap（CAS）**：比较内存当前值是否等于预期值 `expected`，相等才原子更新为 `newVal` 并返回 `true`（Java `AtomicBoolean.compareAndSet(false, true)` 正是这个原语的接口封装）。

### 评价一把锁的三个维度（OSTEP 28.4 节）
1. **互斥性（Mutual Exclusion）**：任意时刻至多一个线程持有锁；
2. **公平性（Fairness）**：等待的线程会不会饿死？纯自旋锁靠线程调度碰运气，不保证公平；票据锁（Ticket Lock）或排队锁保证先到先得；
3. **性能（Performance）**：无竞争时的开销、多核竞争时的 CPU 空转浪费。

### 自旋锁 vs 操作系统阻塞 vs 两阶段锁（Two-Phase Lock）
- **自旋锁（Spin Lock）**：抢不到锁时在用户态原地死循环重试。优点是不进内核、无线程切换开销（适合极短、几纳秒~微秒级的纯内存临界区，配合 `Thread.onSpinWait()`）；缺点是在**单核 CPU**上，持锁线程如果不被调度就放不出锁，自旋线程却白白烧完整个时间片！且一旦持锁线程内部做数据库查询/文件 I/O，所有等待线程一起空转烧满 CPU。
- **挂起队列（Yield / Park）**：OS（或 `LockSupport.park()` / futex）把抢不到锁的线程移入等待队列并休眠，锁释放时显式唤醒（`unpark`），节省 CPU 但伴随调度切换成本。
- **两阶段锁**：在实践中很聪明地结合两者——抢锁失败时先短暂自旋几十次试试（赌持锁者马上放锁）；若还没抢到再转入操作系统挂起等待。

## 4. Mental Model：把机制装进一张图
```text
硬件原语 CAS(false -> true) ──成功──▶ 进入临界区（尽量短、绝不做 I/O）──▶ finally 解锁 (false)
         │
      失败（锁被别人拿着）
         ▼
   [自旋锁] 原地空转重试（CPU 100%，只适合极短临界区）
   [两阶段锁] 先自旋几轮 ──仍未拿到──▶ 挂起休眠让出 CPU ──等待解锁唤醒
```

## 5. Minimal Code：最小示例
`stages/topics/ostep/examples/ostep_locks_atomics/.../App.java` 用 `AtomicBoolean.compareAndSet(false, true)` 亲手实现教学版 `SpinLock`，并与无保护普通自增对照：
```java
void lock() {
    while (!locked.compareAndSet(false, true)) {
        spinWaitLoops.incrementAndGet();
        Thread.onSpinWait();
    }
}
void unlock() {
    locked.set(false);
}
```
注意调用方必须把 `lock.unlock()` 放进 **`finally` 块**——否则一旦临界区内抛出异常，锁永远保持 `true`，所有其他线程将永久自旋死锁！

## 6. Observe：先预测，再运行
先预测两段计数的差异，以及 `spinWaitLoops` 在多线程同时抢锁时是否会显著大于 `0`；再编译运行 `stages/topics/ostep/examples/ostep_locks_atomics/com/javaroadmap/ostep/ostep_locks_atomics/App.java`。观察输出：`SpinLock` 保护下精确达到 `200000`，同时 `spinWaitLoops` 打印出真实的锁争用自旋次数（说明确实发生过自旋等待）。切记不要把单机一两次运行的数字当成固定硬件吞吐基准。

## 7. Modify：只改一个有意义的条件
1. 把 `SpinLock.lock()` 里的自旋循环改造成**在临界区内 `Thread.sleep(1)` 模拟耗时 I/O**（同时缩小累加次数到 200 次以免跑太久），对比观察 `spinWaitLoops` 瞬间飙升的倍数——直观看见“持锁 I/O 让自旋锁烧干 CPU”的灾难后果。
2. 再试把 `Thread.currentThread()` 相关的无锁组多跑几次，体会无同步计数器的结果浮动。

## 8. Exercise：独立完成
1. 参考 OSTEP 第 28 章的 **Ticket Lock（取号排队锁）** 思想，在自己的练习副本中用两个 `AtomicInteger`（`ticket` 取号、`turn` 当前叫号）实现一个**严格公平**的自旋锁：线程先 `ticket.getAndIncrement()` 拿号，然后 `while (turn.get() != myTurn) Thread.onSpinWait();`，`unlock` 时执行 `turn.incrementAndGet()`，验证不会饿死任意线程。
2. 解释清楚：为什么在单核处理器下，纯自旋锁会导致严重的性能退化；以及 Java `synchronized` 的“适应性自旋”和 `finally { lock.unlock(); }` 各自在解决什么问题。

## 9. Real Usage：联系 Java 与工程实践
Java 并发包 `AbstractQueuedSynchronizer (AQS)` 正是“硬件 CAS 抢 state + 抢不到进入队列 `LockSupport.park()` 休眠”的经典工业级实现（支撑了 `ReentrantLock`、`Semaphore`、`CountDownLatch`）；数据库乐观锁（`UPDATE ... WHERE id=? AND version=?`）同样是应用到磁盘行记录上的 CAS 思想；限流器与线程池任务队列都会严格控制持锁临界区的长度，绝不在持锁状态发起远程 HTTP 调用。

## 来源与出处
《操作系统导论》（本地中文版）第 28-29 章（PDF 第 233-263 页）。
