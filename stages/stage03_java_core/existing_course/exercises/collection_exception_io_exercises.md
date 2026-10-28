# Stage 03 练习：集合 / 异常 / IO（结构化版）

完成方式：四个练习都在 `existing_course/src/` 的学生系统上扩展（它是本阶段的"真实项目"）。先把你的副本放进 [my_practices/](../../my_practices/README.md) 再动手——**不要直接改 src 里的参考实现**。未完成时保持 TODO 原样，不要用答案目录补齐。

相关深化课：[01 集合选择](../../deep_dives/01_choose_collection/README.md)、[03 异常设计](../../deep_dives/03_exception_design/README.md)、[04 UTF-8 与 IO](../../deep_dives/04_utf8_io/README.md)、[06 Repository 演进](../../deep_dives/06_repository_evolution/README.md)。

---

## 练习 1：删除学生

**任务背景**：管理员发现录错学生，需要按 id 删除。

- **接口**：在 `StudentRepository` 中增加 `boolean deleteById(int id);`，两个实现类都要实现。
- **语义**：存在 → 删除并返回 true；不存在 → 返回 false（不许抛异常，理由见下）。
- **Service**：增加 `deleteStudent(int id)` 返回 `Result<String>`：成功 `Result.success("已删除")`；失败 `Result.fail("学生不存在：" + id)`。

**正常示例**：添加 id=1 → 删除 1 → true → 再查 1 得失败 Result。
**边界示例**：删除后**再次**删除同一 id → false；空仓库删除任意 id → false。
**错误输入**：id 为 0 或负数 → `Result.fail("id 非法")`（参数校验在 Service 层，不属于"不存在"）。

**验收条件**
- [ ] 两种实现（内存/文件）下行为一致——这正是 [Repository 演进深化课](../../deep_dives/06_repository_evolution/README.md) 说的"接口约定"。
- [ ] 能回答：为什么"不存在"返回 false 而不是抛异常？（用异常设计深化课的三分法。）
- [ ] 文件版删除后重新运行程序，确认删除被持久化。

**需要独立思考的部分**：`FileStudentRepository.deleteById` 的实现策略——重新读全部行、过滤、写回。想一想：这个"读全量-改-写全量"的模式在什么规模下会出问题？（Stage 05 数据库的分页/条件删除就是它的后续。）

## 练习 2：修改分数

**任务背景**：成绩更正是高频操作，需要独立方法并带完整校验。

- **接口**：Service 增加 `updateScore(int id, int newScore)`。
- **语义**：id 不存在 → 失败 Result；newScore 不在 0~100 → 失败 Result，消息区分两种原因；成功 → 返回更新后的 `Result<Student>`。
- **Repository**：你可能需要 `boolean update(Student student)`——先想清楚 save 已经是"存在则覆盖"，是否还要新方法。

**正常示例**：id=2 改 95 → 成功，再查询显示 95。
**边界示例**：改 0 与 100 成功；改 59（及格线下方）成功且影响"及格学生"统计。
**错误输入**：id=-1（非法 id）；id=999（不存在）；newScore=150（非法分数）——三种失败消息**必须不同**。

**验收条件**
- [ ] 三种错误输入得到三种不同的失败消息（精确到能区分原因）。
- [ ] 修改成功后，`listPassedStudents()` 的统计随之变化（数据一致性）。
- [ ] 校验逻辑没有重复出现在两个类里（每个规则只有一个家）。

**需要独立思考的部分**：`validateStudent`（src 版）检查 id>0 和分数范围——你的 `updateScore` 复用它还是另写？复用的代价与收益？

## 练习 3：统计优秀学生（Stream 与循环对照）

**任务背景**：教务要一份优秀名单（分数 ≥ 90）。

- **任务**：用 **Stream** 实现 `listExcellentStudents()`；再用**普通 for** 实现一个等价版本（放在同一类里，方法名加 For 后缀）。
- **输出**：入口打印两版结果，必须一致：`优秀学生：[小红, ...]`。

**正常示例**：{88, 95, 55, 90} → 名单含 95 与 90（**边界 90 必须入选**）。
**边界示例**：全部不及格 → 空名单（打印 `[]`，不是 null）；空仓库 → 空名单。

**验收条件**
- [ ] 两版输出一致；`>= 90` 的边界语义两版相同。
- [ ] Stream 版没有外部可变变量（对照 [Lambda/Stream 深化课](../../deep_dives/05_lambda_stream/README.md) 的副作用纪律）。
- [ ] 用一句话写清：这个需求你最终会提交哪一版，为什么。

**需要独立思考的部分**：`filter`、`map`、`sorted`、`collect` 各自对应 for 版的哪几行？写进注释。

## 练习 4：文件格式扩展（email 持久化）

**任务背景**：学生档案需要 email，文件格式从 `id,name,score` 升级为 `id,name,score,email`。

- **任务**：修改 `Student.fromCsvLine` / `toCsvLine` 与相关校验；提供对**旧格式文件**的处理策略。
- **约束**：UTF-8 读写；email 允许为空（用 `-` 占位）；解析失败的单行不能让整个仓库崩溃（按 [异常设计深化课](../../deep_dives/03_exception_design/README.md) 决定跳过还是报错，写出理由）。

**正常示例**：`3,小刚,82,gang@school.cn` → 读回三个字段 + email。
**边界示例**：`4,小明,90,-` → email 为空串；行尾多余空格 → trim 后正常解析。
**错误输入**：`5,小红` （字段不足）→ 明确策略并测试；`abc,小红,90,-`（id 非数字）→ 同上。

**验收条件**
- [ ] 新格式写入→读回→再写入，文件内容稳定（不会每运行一次就多一个字段）。
- [ ] 构造一个含 1 条坏行 + 2 条好行的文件，程序读入 2 条且对坏行有明确处理（跳过+提示 或 失败Result，二选一说清理由）。
- [ ] 手工用 GBK 保存一个文件再让程序读：观察现象并在笔记里写下与 [UTF-8 深化课](../../deep_dives/04_utf8_io/README.md) 第 4 行实验的对应关系。

**需要独立思考的部分**：旧格式文件（无 email 列）读到后怎么处理？三种策略：拒绝启动 / 自动升级重写 / 视为坏行。你选哪种，为什么？

---

## 渐进提示（卡住才看，逐级解锁）

### 练习 1
- **L1 理解问题**：删除 = "找到下标 → 移除 → 持久化"；两个实现各自完成这三步。
- **L2 相关知识**：`List.remove(int index)` 与 `remove(Object)` 的重载陷阱——用 `remove(i)` 时确认拿到的真是下标。
- **L3 结构思路**：Repository.deleteById（循环比对 id，找到就删并返回 true）→ Service.deleteStudent（参数校验 + 调仓库 + 包装 Result）。
- **L4 调试线索**：文件版删了又"复活" → save 时没把删后的全量写回；内存版删错了人 → 下标与 id 混淆。

### 练习 2
- **L1**：修改 = 定位 + 校验 + 覆盖；失败消息要能区分"没这个人"和"分数不合法"。
- **L2**：save 已是覆盖语义（src 版 FileStudentRepository）；`Result` 的用法见 `common/Result.java`。
- **L3**：Service.updateScore：查（null 判断）→ 校验分数 → repository.save(改好的对象) → Result.success。
- **L4 调试线索**：改完查不到 → 你 new 了一个新对象没 save；消息千篇一律 → 每个失败分支的消息没有带上下文（id、范围值）。

### 练习 3
- **L1**：同一份名单，两种范式；先写 for 版（你熟），再翻译成 Stream。
- **L2**：`filter` 保留下标的 if；`collect(Collectors.toList())` 收尾。
- **L3**：`students.stream().filter(s -> s.getScore() >= 90).collect(...)`；for 版注意空仓库直接返回空列表。
- **L4 调试线索**：Stream 版编译不过 → 泛型推断失败，检查 lambda 参数类型；两版名单不同 → 边界 >= 写成了 >。

### 练习 4
- **L1**：CSV 一行 = 一个学生的序列化；字段数变化是"格式版本升级"。
- **L2**：`split(",", -1)`（保留尾部空字段）与 `String.isEmpty()`；UTF-8 见深化课 04。
- **L3**：fromCsvLine：split → 长度校验 → 逐字段解析（数字解析单独 try）→ 构造 Student；坏行策略集中在一个私有方法里。
- **L4 调试线索**：`ArrayIndexOutOfBoundsException` → 字段数没校验就取下标；数字解析抛 `NumberFormatException` → 你没接住；文件越写越长 → toCsvLine 和 fromCsvLine 字段数不一致。
