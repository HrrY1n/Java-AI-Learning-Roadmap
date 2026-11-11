# Stage 04 练习：并发编程实战（结构化版）

本套练习将 Stage 04 的并发核心（线程启动与 `join`、互斥同步、线程池与资源释放）收敛为三个**可在本机 JDK 精确验证**的单文件程序。

**并发测试的特殊纪律**：线程何时被操作系统调度是不确定的——绝不能把某一次跑出的交错顺序当成 Java 规范保证，也不能用“不加锁的错误程序某次刚好跑对”证明并发安全。三个练习均通过**结果槽位、`join`/`awaitTermination` 内存一致性保证与线程名不变量**来得到确定性可验证输出。先把你的代码放进 [my_practices/](../my_practices/README.md) 再动手。

---

## 练习 1：线程启动与阶段汇合

**任务背景**：一个报表前置检查包含两项独立计算（区间 A 求和与区间 B 求和）。你希望两条工作线程并发执行，主线程必须等两条都完成后再汇总。初学者常犯两个错：直接调用 `.run()` 根本没开新线程，或在第一个 `start()` 后立刻 `join()` 退化成串行。

- **输入格式**（标准输入读取两个整数 `endA endB`，以空白或换行分隔）：
  - 若 `endA <= 0` 或 `endB <= 0`，直接打印 `任务参数无效：上界必须为正整数` 并结束（不启动线程）。
  - 若输入不是两个整数（如输入字母），打印 `任务参数无效：请输入两个整数` 并结束，不抛未捕获异常。
- **并发与顺序要求**：
  - 创建两个 `Thread`，分别计算 `1..endA` 与 `1..endB` 的 `long` 类型累加和，并将结果写入各自独立槽位（如 `long[] sums = new long[2]`）。
  - 两条线程内部各自记录 `Thread.currentThread().getName()`，用以校验其确实**不等于 `"main"`**。
  - 必须先将两条线程全部 `start()`，再统一 `join()`（先全启动、再一起等）。
- **输出契约**（必须逐字符一致）：
  ```text
  任务1线程非main：true，结果：<sumA>
  任务2线程非main：true，结果：<sumB>
  汇总完成：<sumA + sumB>
  ```

**正常示例**：输入 `100 200` → 任务 1 结果 `5050`、任务 2 结果 `20100`、汇总 `25150`。
**边界示例**：输入 `1 1` → 任务 1 结果 `1`、任务 2 结果 `1`、汇总 `2`；或大上界如 `100000 100000` 必须用 `long` 防溢出（`5000050000`）。
**错误输入（必须处理）**：输入 `0 10` 或 `-5 10` → `任务参数无效：上界必须为正整数`；输入 `abc 10` → `任务参数无效：请输入两个整数`。

**验收条件**
- [ ] 使用 `start()` 而非 `run()`，线程名检查返回 `true`。
- [ ] 先调用两个 `start()`，再调用两个 `join()`；汇总结果写在两个 `join()` 之后（利用 `Thread.join()` 建立的 happens-before 保证可见性）。
- [ ] 使用 `long` 计算累加和，避免上界为 `100000` 时 `int` 溢出。
- [ ] 边界与非法输入均能安全退出，无未捕获异常。

**需要独立思考的部分**：为什么在两个 `join()` 之后读取 `sums[0]` 与 `sums[1]` 不需要额外加锁或 `volatile` 就能保证看到完整结果？参考 Java 内存模型中 `Thread.join()` 的 happens-before 规则写一句说明。

## 练习 2：线程安全计数器

**任务背景**：多条业务线程同时对一个共享计数器做大量累加。单凭 `volatile` 无法保护 `value++`（读-改-写三步非原子）。你需要实现一个封装严谨的 `SafeCounter`，无论多线程如何交错，最终计数必须精确无误。

- **输入格式**（标准输入读取两个整数 `threads perThread`）：
  - `threads <= 0` → 打印 `线程数必须大于 0` 并退出。
  - `perThread < 0` → 打印 `累加次数不能为负` 并退出。
  - 非整数输入 → 打印 `输入必须是两个整数` 并退出。
- **结构与同步要求**：
  - 定义独立类 `SafeCounter`：字段 `private long value = 0;`（禁止暴露 `public` 字段直接读写），提供 `increment()` 与 `get()` 方法，并使用同一把锁（如 `synchronized`）保护状态读写。
  - 启动 `threads` 条工作线程（先全部 `start()`，再全部 `join()`），每条线程调用 `counter.increment()` 共 `perThread` 次；工作线程统一命名为 `counter-worker-<i>`（`i` 从 1 开始），并验证所有工作线程名称均不等于 `"main"`。
  - 在线程安全集合中登记**实际执行过累加**的线程名（在工作线程内部、真正执行 `increment()` 之后再登记），join 后排序去重打印——这是防"单线程伪装"的结构不变量：`perThread > 0` 时实际集合大小必须等于 `threads`；`perThread = 0` 时没有任何线程执行过累加，集合必须为空，名单不得虚报。
- **输出契约**：
  ```text
  线程数：<threads>，每线程次数：<perThread>
  工作线程均非main：true
  实际累加线程（排序去重）：[<排序后的线程名，如 counter-worker-1, counter-worker-2>]
  最终计数：<threads * perThread>
  ```

**正常示例**：输入 `4 50000` → 最终计数 `200000`。
**边界示例**：输入 `1 0` → 正常启动并结束 1 条线程；该线程没有执行过任何累加，实际累加线程列表为 `[]`，最终计数 `0`（空名单与 0 计数互相印证）。
**错误输入（必须处理）**：输入 `0 100` → `线程数必须大于 0`；输入 `2 -10` → `累加次数不能为负`。

**验收条件**
- [ ] `SafeCounter` 字段为 `private`，状态变更与读取处于同一把锁的保护下。
- [ ] 在 `4 50000` 下多次运行均精确输出 `200000`（不出现丢更新）。
- [ ] 能解释：为什么仅仅在 `value` 上加 `volatile` 不能通过本练习，以及为什么 `get()` 也应加同步。

**需要独立思考的部分**：如果把 `synchronized` 加在两个不同对象上（例如每次新建一个 `new Object()` 去锁），会发生什么？如果线程在运行中调用 `get()` 而 `get()` 没有加锁，又可能出现什么问题？

## 选做任务 4：并发学生仓库（不进自动判题）

把 Stage 05 的 `InMemoryStudentRepository`（阶段 1）改造成线程安全版：`save/findById/findAll/updateScore/deleteById` 都可能被多条线程并发调用。自选方案（synchronized 方法、`ReentrantLock` 或把内部 List 换成 `ConcurrentHashMap`），要求：多线程并发注册 100 个学生后总数精确、`findAll` 读到的列表一致。这是练习 1–3 技能的合成应用，也是 Stage 06 Spring 单例 Bean 的预演。完成后在复盘页记录你的锁选型与理由。

## 练习 3：线程池任务执行与优雅关闭

**任务背景**：高并发服务不能每次请求都 `new Thread()`，必须通过线程池复用线程并控制最大并发数；同时在任务提交完毕后必须正确关闭线程池，防止非守护线程残留导致进程无法退出。

- **输入格式**（标准输入读取两个整数 `poolSize taskCount`）：
  - `poolSize <= 0` → 打印 `池大小必须大于 0` 并退出。
  - `taskCount < 0` → 打印 `任务数不能为负` 并退出。
  - 非整数输入 → 打印 `输入必须是两个整数` 并退出。
- **线程池与收集要求**：
  - 显式创建固定线程上限的 `ThreadPoolExecutor`（core 与 max 均设为 `poolSize`；工作队列可用 `LinkedBlockingQueue` 或有界队列，只要能接纳 `taskCount` 个任务）或 `Executors.newFixedThreadPool(poolSize)`。
  - 提交 `taskCount` 个任务（编号 `1..taskCount`）：第 `i` 个任务计算 `i * i`（`long`）并返回结果（使用 `Callable<Long>` + `Future<Long>` 按提交顺序保存），同时在线程安全集合 `usedThreads` 中登记执行该任务的线程名。
  - "均由池线程执行"的判定标准是登记的线程名**都以 `pool-` 开头**（默认线程工厂对池线程的命名），而不是简单的不叫 `main`——手开普通 `Thread` 无法通过这一条。
  - 所有任务提交后立即调用 `pool.shutdown()`，再用 `pool.awaitTermination(...)` 等待所有任务完成，并按提交顺序从 `Future` 取出结果列表与求总和。
- **输出契约**：
  ```text
  任务总数：<taskCount>，池大小：<poolSize>
  任务均由池线程执行：true
  工作线程数不超上限：true
  执行线程名（排序去重）：[<排序后的实际线程名，如 pool-1-thread-1, pool-1-thread-2>]
  计算结果：<按提交顺序的列表，例如 [1, 4, 9, 16, 25]>
  结果总和：<总和>
  线程池已优雅关闭：<pool.isTerminated()>
  ```
  注：当 `taskCount == 0` 时，没有任务提交，`任务均由池线程执行` 与 `工作线程数不超上限` 均应为 `true`（集合为空不违反不变量），`执行线程名（排序去重）` 为 `[]`，`计算结果` 为 `[]`，`结果总和` 为 `0`。

**正常示例**：输入 `2 5` → 计算结果 `[1, 4, 9, 16, 25]`，总和 `55`，所有检查均为 `true`。
**边界示例**：输入 `2 0` → 正常 `shutdown` 与 `awaitTermination`，结果 `[]`，总和 `0`，优雅关闭为 `true`。
**错误输入（必须处理）**：输入 `0 5` → `池大小必须大于 0`；输入 `2 -1` → `任务数不能为负`。

**验收条件**
- [ ] 使用了线程池而不是为每个任务手动 `new Thread`。
- [ ] 显式调用 `shutdown()` 与 `awaitTermination()`，最后一行输出 `true`。
- [ ] 在 `2 5` 用例下 `usedThreads.size() <= 2` 成立且结果按 `1..5` 顺序输出（不因异步完成次序错乱）。

**需要独立思考的部分**：如果提交任务后忘记调用 `pool.shutdown()`，即使 `main` 方法走到末尾，JVM 进程会退出吗？为什么？（提示：核心工作线程默认是否是守护线程？）

---

## 渐进提示（卡住才看，逐级解锁）

### 练习 1：线程启动与阶段汇合

- **L1 理解问题**：本练习核心是"并发起跑 + 统一起点之后汇合"，用两个数组槽位隔离两份结果，避免打印顺序不确定的干扰。
- **L2 相关知识**：`Thread.start()` 才会启动新线程，`run()` 只是同步方法调用；`Thread.join()` 会让当前线程阻塞直到目标线程终止，并建立 happens-before 关系。
- **L3 结构思路**：先读并校验两个参数 → 定义 `long[] sums = new long[2]` 与 `String[] threadNames = new String[2]` → 构造两个 `Thread` 并全部 `start()` → 全部 `join()` → 校验 `!"main".equals(threadNames[i])` 并打印。
- **L4 调试线索**：线程非 main 打印 `false` → 你调用了 `.run()` 而不是 `.start()`；大数 `100000` 算出负数 → 累加变量用了 `int` 溢出，必须改为 `long`；非数字输入崩溃 → `Scanner.nextInt()` 前未用 `hasNextInt()` 防御。

### 练习 2：线程安全计数器

- **L1 理解问题**：多条线程抢同一个对象的状态变更方法，必须用互斥锁把"读取-加一-写回"变成不可分割的操作。
- **L2 相关知识**：`synchronized` 实例方法或同步块会锁住监视器对象，保证同一时刻只有一个线程进入临界区，同时锁的释放/获取建立 happens-before 保证可见性。
- **L3 结构思路**：写 `SafeCounter` 类封装 `private long value` 与 `synchronized void increment()`、`synchronized long get()` → 校验输入 → 创建 `Thread[]` 数组（或列表）先全 `start()` 再全 `join()` → 校验线程名与最终值。
- **L4 调试线索**：计数小于预期 → 检查是否有线程漏 `join()` 导致主线程提前读值，或者方法未加 `synchronized` / 锁错了临时新建的对象；`perThread=0` 时卡死或报错 → 检查循环与参数边界判断（`perThread < 0` 才拒绝，`0` 是合法边界）；`perThread=0` 时名单仍列出线程 → 你的登记发生在累加循环之前，"实际累加线程"就不再是证据——把登记移到真正执行过 `increment()` 之后。

### 练习 3：线程池任务执行与资源释放

- **L1 理解问题**：池化 = 有限个常驻工人反复从队列领任务；`Future` 让你能在异步执行后按提交顺序安全拿回每个任务的返回值。
- **L2 相关知识**：`ExecutorService.submit(Callable<T>)` 返回 `Future<T>`，`Future.get()` 会等待该任务完成并返回结果；`shutdown()` 停止接收新任务，配合 `awaitTermination` 等待存量任务结束。
- **L3 结构思路**：校验输入 → 创建 `ExecutorService`（如 `new ThreadPoolExecutor(poolSize, poolSize, 0L, TimeUnit.MILLISECONDS, new LinkedBlockingQueue<Runnable>())`） → 用 `Collections.synchronizedSet(new HashSet<String>())` 收集线程名 → 循环提交 `Callable` 把 `Future` 放进列表 → `pool.shutdown()` → `pool.awaitTermination` → 遍历 `Future` 汇总打印。
- **L4 调试线索**：程序执行完不退出 → 忘了 `pool.shutdown()`（核心线程非守护，阻塞 JVM 退出）；结果列表顺序乱了 → 你在任务里往共享 `List` `add`，改用按顺序收集的 `List<Future<Long>>` 再依次 `.get()`；`taskCount=0` 报错 → 检查是否对空 `Future` 列表做了越界假设。
