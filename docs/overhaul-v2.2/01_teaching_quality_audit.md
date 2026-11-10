# 01 · Stage 01–04 教学质量专项深度审计报告（V2.2-P1）

> 审计范围：对照 Java 语言规范（JLS）与官方 API，不直接采信前两轮自评，对 Stage 01–04 覆盖 8 大核心知识类型的代表课程逐门开展五类严格检查（概念准确性 / 知识完整性 / 示例有效性 / 教学组织 / 知识迁移）。发现的缺陷均已在提交 `daf62d4` 与 `a09d0c2` 中直接修改源码与讲义，而非仅写审计报告。

## 一、八大知识领域暴露出的核心真实缺陷（已全部直接修复）

### 1. Java 基础语法（`day01`–`day07`）
- **JLS 规则不严密与跨课虚假引用**：`day02.json` 曾称“先有 double 参与才能保留小数”，忽略运算符左结合性（`a / b * 1.0` 先算整型除依然丢小数）；`day07` 示例提示“回想 day02 的 `0.1 + 0.2`”，但当时 `day02` 并无该代码。
- **先修倒挂与例题脱节**：`day03` 源码提前使用未讲过的 `new int[2]` 数组来做短路演示；`day04` 要求改 `continue` 但源码中并无 `continue`/`break`；`day05` 让改空数组未提醒 `0 * 1.0 / 0` 会得 `NaN`。
- **类型体系不完整**：`day07` 标题称“八种基本类型”却漏掉 `char`/`boolean`，未解释编译期常量窄化（JLS §5.2，`byte b = 127` 合法而 `byte b = x` 报错）及算术整型提升（JLS §5.6.2，`byte + byte` 结果为 `int`）和 `Math.addExact`。

### 2. 类与对象（`s02-class-basics` / `day01_class_object`）
- 配套 `App.java` 只创建了 1 个 `Student` 实例，无法支撑课程目标“多实例状态互不影响”；缺少字段默认值（`0`/`false`/`null`）vs 局部变量无默认值的对照及 `NullPointerException` 触发点。

### 3. 构造器与 `this`（`s02-constructor-this` / `deep_dives/02_constructor_this`）
- JLS §12.5 与 §8.8.9 失真：原深化课称默认构造器“什么都不做”，忽略隐式 `super()` 与可见性跟随类修饰符；`new` 步骤遗漏 `super(...)` 与字段显式初始化；“参数进、赋值出”易误导构造器有返回值；未警示误加 `void` 变成普通方法的经典错误；源码中均缺构造器重载与 `this(...)` 委托示范。

### 4. 访问修饰符与包结构（`s02-static-lifecycle` / `day07_static_visibility`）
- **严重单包伪演示缺陷**：课程大篇幅区分“本类/同包/包外/子类”四档权限，但 `day07_static_visibility` 原本只有单包单文件，无法验证任何跨包或 `protected` 差异；将 `protected` 简化为“同包+子类”，遗漏了 **JLS §6.6.2 跨包子类只能通过子类自身引用访问继承成员、不能通过父类实例跨包访问**；未讲顶层类只能 `public`/包私有（JLS §8.1.1）、`static {}` 类加载初始化及多别名下 GC 可达性。

### 5. 封装（`s02-encapsulation-basics` / `deep_dives/03_encapsulation_why`）
- `day03_encapsulation/Account.java` 构造器无负余额校验，直接打破“非法状态进不来”的承诺；`EncapsulationDemo` 缺少“getter 返回内部可变数组引用导致封装被类外篡改（引用逃逸）”的反例与 `double` 精度在资金比较下的边界警示。

### 6. 引用与对象状态（`deep_dives/01_reference_state` / `s02-string-common-api`）
- 跨阶段虚假承诺：`01_reference_state/README.md` L43 承诺“深浅拷贝到 Stage 04 再展开”，但 Stage 04 全是并发；`sameContent` 写 `x.name.equals(y.name)` 在 `null` 时抛 NPE；`s02-string-common-api` 缺少对字符串常量池与不可变内部机制的系统讲义。

### 7. 集合与异常（`s03-arraylist` / `s03-hashmap` / `s03-exception` / `s03-equals-hashcode`）
- **包装类专题断档**：Stage 01–04 曾无一课系统讲包装类自动装拆箱、`IntegerCache(-128~127)` 与 `null` 拆箱 NPE。
- **集合误导与错链**：`day01_arraylist` 注释称“下标 for 遍历安全删”，未警告正向删不回退 `i--` 会漏删连续匹配元素；`s03-hashmap.json` 错链 `s02-polymorphism-basics` 且缺 JDK 8 树化阈值（桶长 ≥ 8 且容量 ≥ 64）；`equals_hashcode` 缺“只写 `equals` 不写 `hashCode`”与“可变 key 修改后失踪”反例。
- **异常反模式与 cause 丢失**：`s03-exception.json` 教人写非法输入返回魔法值 `0`；`FileStudentRepository` 捕获 `IOException` 后丢弃 `cause` 并包装成 `BusinessException`，随后被 `StudentService` 当成业务规则校验失败吞掉！

### 8. 并发与 JMM（`s04-*` 5 课）
- `day01_thread_basics` 与 `verify_manifest.tsv` 原本存在 `start()` 后打印 `getState()` 期望 `RUNNABLE` 的调度竞态，且 `s04-thread-basics` 漏了 `BLOCKED`/`WAITING`/`TIMED_WAITING` 与重复 `start()` 异常。
- `s04-visibility-volatile` 提示“循环内 `println` 刷新可见性”，但示例循环体实际根本没有 `println`（文案与源码错位），缺 JIT 循环提升（Hoisting）与 DCL 重排序说明。
- `s04-synchronized-mutex` 缺可重入嵌套调用示例与最小死锁模型；`s04-concurrent-tools` 混同 JDK 7/8 `HashMap` 并发表现，且 `day05_concurrent_tools` 未把 `pool.shutdown()` 放进 `try-finally`。

## 二、Foundation 七步模板结构性结论（接通 P5）

审计确认 foundation 课普遍存在“前 3 步各写 20–40 字、无连续机理正文与对比表、为了排版而硬拆段”问题；且很多机制靠未兜底的短卡片无法说透。治理方案已在 `daf62d4`（`App.tsx` + 9 门代表课挂入 `bodyPath` 连续讲义）中落地，详见 `02` 与 `08` 文档。
