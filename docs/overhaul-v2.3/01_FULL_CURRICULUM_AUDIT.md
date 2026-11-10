# 01 · 全量课程质量审计矩阵（V2.3 · 2026-11-11）

> 覆盖：**61 门正式主线课**（Stage01–05）+ **48 门已发布专题课**（算法 29 + Git 19）+ **43 门 building 专题课状态核验**（CS:APP 14 / OSTEP 17 / 网络 12）。方法：6 个独立只读审计代理按七维度（A 技术准确性 / B 原理深度 / C 知识完整性 / D 示例质量 / E 实践价值 / F 教学表达 / G 学习衔接）逐课审读正文、Java/SQL 源码、练习与预测题；**全部 Java 示例在 JDK 25 下实测编译运行**（Stage01–05 全部 61 门 + 算法 29/29 + building 抽查），Git 专题 19 门中 14 门在临时仓库逐步跟做验证，SQL 按 MySQL 8.0 官方语义核对。审计过程零仓库改动。

## 一、总体判定

1. **"为了排版而排版"结论（对任务书第五节）**：28 门无连续正文（仅 7 步短卡）的课程中，绝大多数的 steps 与本课示例代码真实联动（预测/修改指向具体输出与具体条件），**不构成空模板**；真实短板是**少数概念卡密度不足 + 若干机制只存在于代码注释而从未成文**（Stage01 的 for 三段时序、`new int[n]` 默认值、方法声明语法；Stage03 的 HashSet 去重机制、Lambda 变量捕获；Stage02 的字段遮蔽）。本轮按**证据修复**而非全量重写处理——不为提高修改数量而改动质量良好课程。
2. **技术准确性总评**：主线 61 门 + 算法 29 门在 JDK 25 实测中**零编译失败、零运行失败**；发现的准确性问题集中在**已发布参考答案/注释承诺**（3 处）与**规范表述边界**（如 String 常量池 `==`、`(int) sum` 优先级示例、`init.defaultBranch`）。
3. **published 状态真实性**：算法/Git 两专题无"只有定义"的空壳课；Git 专题 6 门正文 <740 字符密度偏薄（最短 538），属真实内容缺口；building 三专题数据层与 UI 层均如实标注，43 门课与 15 个 codeDirectory 一一对应，无虚假声明。

## 二、主线课程矩阵（61 门）

判定口径：**OK**=无须修改；**minor**=小幅修复；**deep-rework**=深度重构；**missing**=缺少重要内容；**restructure**=需调整结构。修复状态列在本轮修复完成后由 `02_TEACHING_QUALITY_REMEDIATION.md` 回填。

### Stage01（14 门：7 基础 + 7 深化）

| 课程 | 形式 | 正文 | 判定 | 发现的问题（维度·严重度·证据） |
| --- | --- | --- | --- | --- |
| day01 输出与变量 | 7 卡 | 无 | minor | D·P2 `day01_output_variable/App.java:10` Modify 注释承诺的编译错误实测不成立（仅移动声明才报错）；C·P2 声明/命名规则无连续正文；E·G·P2 挂 scores 练习超前（需 day05/06） |
| day02 数据类型与运算符 | 7 卡 | 无 | minor | F·P2 固定 7 卡无优先级总览；C·P2 预测步骤要求对照 char 与 String 但示例无 String 输出。其余（13/7/30/3/1、0.1+0.2、(int)'A'）实测全对 |
| day03 条件分支 | 正文 | `day03_if_switch/README.md` | **OK** | 版本表述（switch Java 7/箭头 14/模式匹配 21、switch(null) NPE、`&` 双求值）全部核对无误 |
| day04 循环与边界 | 7 卡 | 无 | minor | C·P2 for 三段执行时序全阶段无连续讲解；F·P2 固定 7 卡。A4 输出实测正确 |
| day05 数组与遍历 | 7 卡 | 无 | minor | F·P2 示例注释仅"知识点：数组。"为 14 课最薄；C·P2 `new int[n]` 默认值未讲（A8 直接使用） |
| day06 方法与职责 | 7 卡 | 无 | minor | C·P2 方法声明语法无连续讲解（deep06 补机制缺语法层）；F·P2 固定 7 卡 |
| day07 八种基本类型与溢出边界 | 正文 | `day07_numeric_types/README.md` | minor | **D·P1 `App.java:7` 头注释承诺的"编译报错演示行"不存在**；E·P2 唯一无结构化练习的基础课。JLS §5.2/§5.6.2、Math.addExact、13!、绕回值全部实测无误 |
| deep01 main 与 JVM | 正文 | 有 | minor | E·G·P2 误挂 scores 练习且 scores 未回列 deep01。JEP 512 实例 main 实测成立 |
| deep02 整数除法与类型转换 | 正文 | 有 | minor | **A·P2 `README.md:50` "(int) sum * 1.0 / count 换数据会出错"结论错误**（sum 为 int 时 (int) 恒为无操作） |
| deep03 数组、下标与内存 | 正文 | 有 | OK | 偏移模型/别名/越界实验全部与实测一致 |
| deep04 只有值传递 | 正文 | 有 | OK | case3 重赋值反例是决定性证据；PassingPredictor 设计好 |
| deep05 循环边界 | 正文 | 有 | OK | 闸门/侧门模型与实测一致 |
| deep06 方法、作用域与职责 | 正文 | 有 | minor | M·P2 predictionIds=[A6] 但 A6 属 deep04（单向挂靠、主题不符） |
| deep07 Scanner 与非法输入 | 正文 | 有 | OK | 双防御/nextInt 坑/除零警告全部实测吻合 |

### Stage02（15 门：9 基础 + 6 深化）

| 课程 | 形式 | 正文 | 判定 | 发现的问题 |
| --- | --- | --- | --- | --- |
| s02-class-basics | 7 卡 | 无 | OK | 默认值/文件名规则/NPE 准确，配对深化无重复 |
| s02-constructor-this | 7 卡 | 无 | OK | new 顺序与 JLS §12.5 一致，void 陷阱/默认构造器消失准确 |
| s02-encapsulation-basics | 7 卡 | 无 | minor | F·P2 修改条件"删检查观察透支"但 day03 App 只调 withdraw(30) 不成立；D·P2 非法路径输出从未出现 |
| s02-static-lifecycle | 正文 | 有 | OK | 跨包 protected 实测与 JLS §6.6.2 逐字吻合；常量内联不触发初始化准确 |
| s02-inheritance-basics | 7 卡 | 无 | minor | G·P2 未链 s02-object-construction（构造器调用链在那里）；C·P2 未提子类访问不到父类 private 字段 |
| s02-polymorphism-basics | 7 卡 | 无 | minor | **F·P1 独立练习要求新增 Robot 子类，与深化课"Robot 不是 Animal"标准反例直接冲突**；C·P1 未讲字段不参与多态 |
| s02-interface-abstract | 7 卡 | 无 | minor | G·P2 无专属深化课且未互链 polymorphism-mechanism；C·P2 未解释抽象类可延后实现接口方法 |
| s02-string-common-api | 正文 | 有 | minor | A·P2 `App.java:22` 字面量 `==` 写"可能为 true"（JLS §3.10.5 同类字面量恒同一池对象，应写"保证为 true，但工程上别依赖"） |
| s02-stringbuilder-intro | 7 卡 | 无 | minor | C·P2 深化断档（容量增长/编译器自动 StringBuilder 无后续入口）；D·P2 insert/delete 仅文字提及 |
| s02-reference-state（深化） | 正文 | 有 | minor | F·P2 `README.md:32` "预测 5 行输出"实际 6 行（该文件第 5 行自己也写 6 行，前后矛盾） |
| s02-object-construction（深化） | 正文 | 有 | OK | JLS §12.5/§8.8.9 逐条准确 |
| s02-encapsulation-why（深化） | 正文 | 有 | OK | 三段 demo 输出实测一致；防御性拷贝质量高 |
| s02-inheritance-vs-composition（深化） | 正文 | 有 | minor | A·P2(轻) 里氏论证口语化；Square 反例实测吻合 |
| s02-polymorphism-mechanism（深化） | 正文 | 有 | minor | **C·P1 全课未讲"字段按静态类型解析不参与动态绑定"** |
| s02-entity-service（深化） | 正文 | 有 | minor | C·P2 Stage02 使用 java.util.ArrayList 前向依赖未说明；G·P2 配对较弱 |

### Stage03（22 门：16 基础 + 6 深化）

| 课程 | 形式 | 正文 | 判定 | 发现的问题 |
| --- | --- | --- | --- | --- |
| s03-arraylist | 正文 | 有 | OK | 三大坑含 JLS 依据、CME 表格、倒序/Iterator 正解实测全对 |
| s03-hashmap | 正文 | 有 | minor | C·P2 迭代中结构性修改的 CME 未提（仅 arraylist 课讲 List 版） |
| s03-hashset | 7 卡 | 无 | minor→补强 | **B/C·P1 概念卡仅 40 字，全课未讲"去重依赖 hashCode/equals"**，App 只用 String 去重零机制注释；无深化课配对 |
| s03-generics | 7 卡+deep | 有 deep | minor | D·P2 只演示强转成功路径，CCE 未实测触发 |
| s03-exception | 7 卡+deep | 有 deep | minor | D·P2 概念卡讲多 catch/finally 禁 return/TWR 但示例仅单 catch |
| s03-file-read | 7 卡+deep | 有 deep | minor | G·P2 relatedLessonIds 缺 s03-utf8-io（单向）；D·P2 相对路径依赖启动目录未说明 |
| s03-lambda | 7 卡+deep | 有 deep | minor→补强 | **C·P1 effectively final/变量捕获规则全阶段零覆盖**；D·P2 内建函数式接口未接触 |
| s03-stream-basics | 7 卡+deep | 有 deep | OK | 惰性 + 副作用边界表述准确 |
| s03-equals-hashcode | 7 卡 | 无 | minor | B·P2 契约清单未成文；但三反例+instanceof 判 null 实测全对，断档下仍足够 |
| s03-inner-classes | 7 卡 | 无 | OK | machine.new/静态嵌套/匿名边界准确 |
| s03-enums | 7 卡 | 无 | minor | C·P2 valueOf 非法名抛 IAE 与 switch(enum) 未提 |
| s03-annotations | 7 卡 | 无 | minor | C·P2 @Target 元注解未提；RUNTIME+反射处理得当 |
| s03-type-information | 7 卡 | 无 | minor | F·P2 steps 写 Class.forName+newInstance，代码已正确用 getDeclaredConstructor().newInstance()（措辞不一致） |
| s03-concurrency-basics | 7 卡 | 无 | minor | E·P2 练习/预测全空缺动手环节；作为 Stage04 路标足够（原子性/可见性/join HB 准确） |
| s03-design-patterns | 7 卡 | 无 | minor | F·P2 概念卡 65 字偏薄，靠 App 注释承载（策略/模板方法本身准确） |
| s03-assertions | 7 卡 | 无 | OK | 无 -ea 静默垃圾值/-ea 抛 AssertionError 实测三路径全对 |
| s03-choose-collection（深化） | 正文 | 有 | OK | 决策表+三反例+key 稳定纪律 |
| s03-generics-why（深化） | 正文 | 有 | minor | D·P2 同 generics（CCE 未触发） |
| s03-exception-design（深化） | 正文 | 有 | OK | 三分法与 FileStudentRepository cause 保留呼应 |
| s03-utf8-io（深化） | 正文 | 有 | OK | 9 字节/GBK 乱码/JDK17 vs 18+ default charset 实测准确 |
| s03-lambda-stream（深化） | 正文 | 有 | minor | C·P1 同 lambda（深化课也未覆盖变量捕获） |
| s03-repository-evolution（深化） | 正文 | 有 | OK | 与 s05-jdbc-dao 双向互链衔接完整 |

### Stage04（5 门）+ Stage05（5 门）

| 课程 | 形式 | 正文 | 判定 | 发现的问题 |
| --- | --- | --- | --- | --- |
| s04-thread-basics | 7 卡 | 无 | minor | C·P2 全阶段无 jstack/线程转储对照；C·P2 Thread.start() HB 规则未显式给出（join 有）。6 态状态机/join HB 准确 |
| s04-visibility-volatile | 正文 | 有 | OK | 同步顺序写→读 HB 与传递性精确；丢更新实验实测 12.4万/12.9万吻合 |
| s04-synchronized-mutex | 正文 | 有 | OK | unlock HB lock/类锁实例锁对照/可重入/死锁防线齐全 |
| s04-thread-pool | 7 卡 | 无 | minor | C·P2 shutdownNow（队列存量任务返回）未提；提交顺序语义已讲且实测吻合 |
| s04-concurrent-tools | 正文 | 有 | minor | C·P2 Future.cancel/超时 get 未覆盖；E·P2 练习列表列 s04-safe-counter 但练习未回链（单向） |
| s05-sql-basics | 正文 | 有 | minor | C·P2 "唯一索引允许多个 NULL"语义未讲；C·P2 8GB 内存跑 Docker MySQL 资源成本未提示。8.0.16 CHECK/3819/utf8mb4/DECIMAL 全对 |
| s05-relational-design | 正文 | 有 | minor | C·P2 UNIQUE 多 NULL 同上；COUNT(e.id) vs COUNT(*) 已讲，1452/CASCADE/LEFT JOIN 退化准确 |
| s05-transactions-acid | 正文 | 有 | OK | RR 下 MVCC 快照读 vs Next-Key Lock 当前读、幻读表述精确；快照实验设计吻合 |
| s05-indexes-explain | 正文 | 有 | minor | C·P2 EXPLAIN rows 是估算值、计划随统计信息波动未声明；ANALYZE TABLE 用了却未解释。聚簇/回表/覆盖/最左前缀/4 类失效全对 |
| s05-jdbc-dao | 正文 | 有 | minor | A·P2 "先发 ? 模板给数据库解析编译"是服务端预编译描述，与 Connector/J 默认 `useServerPrepStmts=false` 客户端预编译路径不符（防注入结论不变）；逆序关闭/1-based/异常翻译/upsert 契约全对 |

## 三、已发布专题矩阵（48 门）

**算法 29 门**：25 OK / 4 minor——`algo-iteration-recursion`（F·P2 markdown 内 `\varphi`/`\approx` 被 JSON 转义损坏为控制字符，渲染成"arphi^n"）、`algo-graph`（F·P2 第 3 节两个不相关论断挤在一句）、`algo-selection-heapsort`+`algo-non-comparison-sort`（F·P2 章节 "## 3" 编号跳缺）。29/29 代码全部 javac/java 实测通过，复杂度声明与边界（空输入/负数/队满/溢出）与代码一致，反例充分。

**Git 19 门**：8 OK / 11 minor。P1 两项：`git-intro-basics`（A·P1 未提 `init.defaultBranch`，默认配置实测 `git init` 得 master 而非断言的 main）、`git-branch-create-merge`（D·P1 gitSteps 两步照做只得 Already up to date，缺 feature 上提交的中间步骤）。P2 九项：6 门正文 <740 字符（rebase-cherry-pick 538 / collab-workflow 620 / history-archaeology 626 / internals-basics 627 / merge-conflict 714 / interactive-staging 736）缺沙箱实测叙述；`git-rebase-interactive` "3 条变 2 条"计数矛盾（squash 后应为 3）；3 门 title 与正文 h1 不一致。

**重要结构事实**：`stages/topics/algo/lessons/*.md` 与 `stages/topics/git/` 在仓库中**不存在**——两专题正文唯一来源是 `web/content/topics.json` inline markdown；算法 Java 源在 `stages/topics/algorithms/<concept>/`（29 门 inline code 与仓库源逐一一致，有同步门禁测试）。

## 四、building 专题状态核验（43 门）

- **诚实性总评：通过**。三专题 topics.json 全标 building（`topics.json:1617/1637/1656`）；TopicView 对 building 显示"课程建设中 · 已有可学内容"徽章（`TopicView.tsx:187`）；搜索结果带"建设中"标签（`SearchDialog.tsx:337-341`）。
- V2.2 升级 3 门（ostep-locks-atomics / net-reliable-tcp / csapp-exceptional-control-flow）内容实质、显式包名、JDK 25 实测通过，仍处 building 专题下如实呈现。
- 抽查 6 门薄课均带"教学模型/不是真实实现"降级声明，无冒充完整。
- 先修指针（ostep→s04 两课、csapp→s04-thread-pool、net→Stage05）全部可解析。
- P2 两项（记录为遗留）：单课阅读页对薄课/厚课渲染无差别、无"待扩写"标记；模块筛选"已上线"标签略乐观。

## 五、练习与预测题关联审计（汇总）

- 12 门结构化练习 cases 均覆盖 normal/boundary/invalid；expected 唯一确定；L1–L4 提示无答案泄漏。
- 已知固有局限（如实记录）：Stage01 四个练习的固定输入理论上可硬编码绕过（scores 换数组部分抑制；menu/refactor 的散文 expected 属自比任务）；Stage03 逐行消费 stdin 类练习无法整体硬编码。
- **P1·E**：Stage04 三门练习的输出契约无法区分"真并发/线程池"与串行近似实现（线程名检查只排除 main）——修复方向：输出契约增加并发结构不变量（`05_PRACTICE_AND_TEST_QUALITY.md` 落实）。
- 关联缺陷：day01/deep01↔scores 无关挂靠、scores/refactor 缺回列、deep06↔A6 单向、s04-concurrent-tools↔s04-safe-counter 单向、S05B2 referencePaths 空、A8 数组超前（day03 未教数组）。

## 六、修复清单（按优先级，供修复轮次执行）

**P1（11 项，阻断学习闭环或误导）**：
1. `answers.md:74` B1 原版数值笔误 3→13（已发布错误答案）
2. `day07_numeric_types/App.java:7` 注释承诺的演示行不存在
3. SimpleCalculatorAnswer 与 calculator 7 用例不对齐（"结果："前缀/报错文案/非数字防御）
4. A8 预测题在 day03 使用未教数组语法
5. s02-polymorphism-basics 独立练习 Robot 与深化课反例冲突
6. "字段不参与多态"缺失（s02-polymorphism-mechanism + 基础课）
7. s03-hashset 去重机制（hashCode 分桶 + equals 判等）缺失
8. s03-lambda effectively final/变量捕获全阶段零覆盖
9. Stage04 三门练习输出契约增加并发结构不变量
10. git-intro-basics 补 `init.defaultBranch` / `git init -b main`
11. git-branch-create-merge gitSteps 补中间提交步骤

**P2（内容与关联，24 项）**：deep02:50 (int)sum 表述、day01 App.java:10 Modify 注释、basic_syntax_exercises.md L2 契约、s02-string `==` 措辞、s02-reference-state 5/6 行、s02 三处 relatedLessonIds 断链、stringbuilder-intro 深化入口、encapsulation-basics Modify 金额、s03-hashmap CME 交叉引用、s03-file-read 关联+相对路径、excellent-stats 答案 Stream 版、email-csv 空值口径+score 非数字 case、s03-type-information newInstance 措辞、s04 jstack+Thread.start HB、s04 shutdownNow/Future.cancel 一句带过、s04 关联回链、s05 UNIQUE 多 NULL、s05 EXPLAIN 声明、s05 8GB 成本提示、s05 Connector/J 预编译差异、S05B2 referencePaths、algo 转义损坏+章节编号+graph 拆句、git title/h1 一致、git rebase-interactive 计数。

**P3（内容密度，6 门 Git 课扩写 + Stage01 机制成文）**：6 门 <740 字符 Git 课按"沙箱实测+预期输出"模板扩写；Stage01 for 时序/`new int[n]`/方法声明语法收进扩充卡片或深化课。
