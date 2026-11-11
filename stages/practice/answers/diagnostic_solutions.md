# 独立学习验证集：参考解析与评判要点

> **使用约定**：你必须先自己写出答案或运行你的迁移代码，再把本文件当作核对工具。能看懂解析不等于已经学会。

## 一、理解诊断参考解析

- **U1**：`10 + 20` 两个操作数都是编译期常量，编译器在编译期折叠出 `30` 并检查它落在 `byte(-128~127)` 内，因此**编译期常量窄化**（JLS §5.2）允许直接赋给 `byte`。而 `a + b` 是变量表达式，受**二元算术整型提升**（JLS §5.6.2）规则影响，`byte` 参与 `+` 先自动提升为 `int`，表达式类型是 `int`；编译器只看类型不跟踪运行时数值，因此报“从 int 转换到 byte 可能会有损失”。
- **U2**：根据 JLS §6.6.2，跨包子类虽然继承了父类的 `protected` 成员，但只能通过**子类自身类型或子类实例**（如 `this.note` 或 `SubStudent` 引用）去访问——防止子类拿着别的父类实例或兄妹子类实例绕过跨包保护。若把 `Child` 放回同包 `pkga`，因同包本身就可访问 `protected`，`other.note` 也会编译通过。
- **U3**：精确输出：`99|小明`。`a` 存的是指向堆上学生对象的引用副本；传给 `change(Student s)` 时，形参 `s` 拿到的是**同一个引用的值拷贝**（依然指向原对象），因此 `s.score = 99` 修改了堆上的共享对象；但随后 `s = new Student("路人", 0)` 只改变了**局部形参变量 `s` 自己持有的新引用**，对调用方实参 `a` 没有任何影响（`a` 依然指着原本的“小明”）。这恰恰证明 Java 参数传递是严格按值传递（传递引用的值）。
- **U4**：精确输出：`true|false|false`（默认 JVM 配置下）。`Integer` 默认缓存 `-128 ~ 127`（JLS §5.1.7 保证该范围内装箱共享同一对象），所以 `127` 复用同对象 `==` 为 `true`；`128` 在默认配置下超出缓存各自装箱，`==` 为 `false`——但缓存范围之外的对象身份不是语言规范的承诺（上界可由 `-XX:AutoBoxCacheMax` 调整），不应依赖，改用 `Objects.equals(m, n)` 即可。`Tag` 只重写 `equals` 没重写 `hashCode`，继承自 `Object.hashCode()` 按对象身份算哈希，两个 `new Tag("vip")` 落入不同桶，根本走不到 `equals` 比较就返回 `false`（必须成对重写 `hashCode`：`Objects.hash(code)`）。
- **U5**：① `count++` 是读、加 1、写回三步。线程 A、B 同时读到 `volatile` 的最新值 `10`，各自在工作内存算出 `11` 并依次写回，`volatile` 只保证读时最新、写时立即可见，锁不住两读之间的插队，最终丢失一次加法；② `get()` 不加同步时，缺乏 `unlock happens-before lock` 的顺序保证，极端下可能读到过期缓存值（且若字段是 64 位非 volatile `long/double` 还存在字撕裂历史风险）。
- **U6**：① `finally` 块在控制离开 `try` 之前必然执行，当 `finally` 里直接写 `return 0;` 时，方法按新的 `return` 正常返回，直接丢弃/覆盖了 `try` 中尚未抛出的 `ArithmeticException`（灾难级隐患：绝不在 `finally` 里写 `return` 或抛覆盖异常）；② 不会立刻退出，因为默认线程工厂创建的核心工作线程是**非守护线程**，只要存在任意非守护线程存活且未被 `shutdown()`，JVM 进程就一直挂起等待。

## 二、Debug 错误诊断参考解析

- **D1**：`public void D1VoidCtor(String name)` 带有返回值 `void`，在 Java 语法里它变成了一个**普通方法**而不是构造器！因此编译器为你自动送了一个“无参默认构造器”，于是 `new D1VoidCtor("小明")` 报找不到 `(String)` 构造器。修复：删掉 `void`。
- **D2**：输出 `[A, X, B]`。初始下标 `0:A, 1:X, 2:X, 3:B`。`i=1` 删掉第 1 个 `"X"` 后，后面元素立刻前移变为 `0:A, 1:X, 2:B`；接着 `for` 执行 `i++` 使 `i` 变为 `2`（指向 `"B"`），原来在下标 `2` 的第二个 `"X"` 移动到了下标 `1` 而被完美跳过！修复：用 `list.removeIf("X"::equals)`、用 `Iterator.remove()`、或倒序 `for (int i = list.size() - 1; i >= 0; i--)`（若必须正向则删后补 `i--`）。
- **D3**：`getScores()` 直接把内部可变数组 `scores` 的引用交给了调用方（引用逃逸），外面就能 `arr[0] = -999` 绕过类的方法校验。修复：`getScores()` 返回 `scores.clone()`（以及如果构造器接收外部 `int[]` 参数，也要存 `arg.clone()`）。
- **D4**：`ArithmeticException` 是 `Exception` 的子类。编译器从上到下检查 `catch` 块，既然前面的 `catch (Exception e)` 已经能接住全部 `Exception` 子类，后面的 `catch (ArithmeticException e)` 永远无法到达（unreachable），所以报 `exception ArithmeticException has already been caught`。修复：把具体子类 `ArithmeticException` 放在 `Exception` 前面。
- **D5**：每次调用 `add()` 都执行 `Object gate = new Object()` 新建一把**局部新锁**，每个线程进自己的门，完全没有互斥；若把一个实例方法写 `synchronized`（锁 `this`）而另一个静态方法写 `static synchronized`（锁 `Class` 对象），两把锁依然是不同对象，彼此同样不互斥！必须让需要互斥的所有路径抢同一把锁对象。

## 三、代码迁移任务评判要点

- **T1 (`ScoreBandAnalyzer`)**：必须用 `try { Integer.parseInt(...) } catch (NumberFormatException e)` 处理非数字，不能静默转成 `0`；区间 `0..100` 边界（`0` 与 `100` 应入选，`-1` 与 `101` 进非法列表）；有效个数 `== 0` 提前返回保护不输出 `NaN`。
- **T2 (`LibraryCopy`)**：`equals/hashCode` **绝不能把可变的 `borrowed` 字段放进去**！否则书一旦借出/归还，`hashCode` 改变后在 `HashSet` 里就会再也找不回来。且不可提供 `setBorrowed(boolean)` 破坏封装。
- **T3 (`ConfigLineParser`)**：`line.indexOf('=')` 定位第一个等号再用 `substring` 拆分，绝不能简单 `split("=")`（否则会把 URL 参数里的等号拆断或丢失）；报错信息必须带出问题行号与原始文本，便于调用方排查配置。
- **T4 (`ParallelSumChecker`)**：任务结果按 `long` 计算防 `int` 溢出（`n = 100000` 时精确和约为 `3.33338e14`，远超 `int` 上限）；`ExecutorService` 必须在 `try-finally` 中 `shutdown()` 并等待终结，不得使用无返回值且把结果直接往普通非同步变量加的竞态写法。
