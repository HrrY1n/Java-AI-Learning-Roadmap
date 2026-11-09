# 01 · 全项目深度审计报告（2026-11-10）

> 方法：6 个独立审计分片并行通读全部已发布课程（45 主线 + 91 专题节）、19 篇深化正文、48 篇文档引用、全部 Java 源码与预测/练习题；可疑 Java 代码用 JDK 25 实际编译运行核对；预测题答案逐题实测；web 工程含构建产物体积实测与 E2E 覆盖评估。基线测试全绿（链接 306 OK / vitest 全过 / Java 回归 97/97 / build OK）。
>
> 评分标准：技术准确性 25 + 原理深度 20 + 示例与执行分析 15 + 实践练习 15 + 衔接与先修 10 + 常见错误与边界 10 + 表达 5 = 100；发布线 ≥85；出现 P0 技术错误直接判不合格。

## 总览

| 板块 | 加权评分 | 等级 | 结论 |
|---|---:|---|---|
| Stage01 | ~85.5 | B+ | 可发布；补丁式维护（note 代偿源文件错误）拖累可信度 |
| Stage02 | 84 | B | deep-dive 层全仓最佳；web 编排层存在低成本可修的一致性问题 + 1 个 P0 |
| Stage03 | 84 | B+ | 技术底座三阶段最扎实；唯一系统性缺口是「仓库素材→web 学习体验」最后一公里 |
| topic-algo | 85.5 | A- | 已达标；练习维度单一 |
| topic-git | 86 | A- | 已达标；4 个最薄课需补「先预测」节 |
| csapp/ostep/network | 66.5-69 | C+ | building 状态诚实；单节深度与代码课覆盖率不足，维持 building 正确 |
| web 工程 | — | A-（工程质量）/ B（性能与搜索） | 数据层教科书级；单 bundle、搜索不搜正文、无 schema 迁移 |

---

## P0 问题（技术错误 / 数据风险，必须修）

| # | 位置 | 问题 | 证据 |
|---|---|---|---|
| P0-1 | `stages/stage02_java_oop/deep_dives/01_reference_state/.../ReferenceStateDemo.java:24-27` | 第 4 行输出与注释自相矛盾：注释称「两个对象内容相同」，但因前段 `b.score=95` 已改掉 `a.score`，实测输出 `内容相同吗：false`，教给学习者错误事实 | 审计分片实测运行 |
| P0-2 | `stages/stage01_java_basics/practice/answers.md:59-63` | B1 参考答案错误且公开发布：「其余行不变」不实（`int b=3`→`double b=3.0` 后 a+b/a-b/a*b 均变 13.0/7.0/30.0）；B2 同段残留两套数据（402→372 与 351→321 并存）。predictions/stage01.json 的 note 已自知却未回修源文件 | jshell 实测 |
| P0-3 | `stages/stage01_java_basics/deep_dives/07_scanner_input/.../ScannerGuardDemo.java` | 分支 2 提示「现在输入 10 / 0」却只 catch InputMismatchException，实测崩溃 ArithmeticException，与末行「程序正常结束」承诺矛盾 | 审计分片实测 |
| P0-4 | `web/content/lessons/stage03/`（18 门）+ `web/content/predictions/`、`exercises/` | Stage03 实践练习维度整体缺失：exerciseIds/predictionIds 全为空数组，而仓库侧 `stages/stage03_java_core/practice/` 素材已达标且答案零错误 | 逐文件 grep |
| P0-5 | `web/src/lib/learning-store.ts:93-105,293,517` | 学习状态层无 schema 迁移机制：`fields()` 精确键数校验 + `schemaVersion!==1` 拒绝，未来任何加字段演进会把存量用户打回「内存模式」（会话内作答不落盘） | 代码路径分析 |

## P1 问题（显著影响学习效果/体验）

### 内容正确性与一致性

1. **Stage01 题面-代码漂移靠 note 补丁维持**：`practice/predict_and_modify.md` B3 说「case 0 的 break 移到之后」但 `MenuDemoApp.java` 用 `return`；B1 同理。直接读 md 的学习者会被误导（`predictions/stage01.json` 两条 note 已打补丁）。
2. **Stage01 参考答案不满足练习自身验收**：练习 1 要求「求和/最值/计数各独立方法 + 空数组处理」，`existing_course/answers/.../ScoreStatisticsAnswer.java` 全塞 main 且无判空；练习 3 要求「非数字不崩溃」，参考 `loop.java` 裸 `nextInt()` 实测抛 InputMismatchException，且输出措辞与 `menu.json` cases 逐字不符；类名 `loop.java`/`method.java` 违反 PascalCase。
3. **Stage02 web 课序与正文互指矛盾**：`stages.json` foundations 把 stringbuilder-intro 排在 string-common-api 前，而后者正文写「下一课」是 StringBuilder；deep-dives 把 object-construction 排在 reference-state 前，而 02 课正文两处引用「上一课」（01 课）概念。
4. **Stage02 多态零预测题**：S02A4/S02B1 停在 draft 未挂载，`s02-polymorphism-basics/mechanism` 的 predictionIds 为空——核心考点无预测链。
5. **Stage02 src 参考代码拆台自立的规矩**：`src/student/Student.java:23-30` setScore 非法分数静默降级为 0，与 deep dive 03/06「非法状态进不来/Entity 抛 IAE」冲突；三个 Service 直接 println 违反「Service 不 println」，而 deep dive 06 称 src/student 是「同一结构的完整示例」。
6. **Stage01 day03 与 A8 脱节**：day03 挂 `&&` 短路预测题 A8，但 `day03ifswitch/App.java` 全文无逻辑运算符；该文件同时是全阶段注释最少、排版最差的一份。
7. **CME 全仓库零覆盖**：grep 全仓库无 ConcurrentModificationException；Stage03 恰是学习者第一次「边遍历边删」的阶段，多个练习会诱发却无预警。
8. **algo-ds-basics 标签失实**：正文称「无序数组线性扫描」，源码 `data[i]=i*3+7` 实为升序数组。
9. **Stage03 深化课双源并行**：deep_dives 02_generics_why/03_exception_design/05_lambda_stream/06_repository_evolution 4 篇未上站，与网站 s03-generics 等同主题并行（网站正文写「本课未涉及」，仓库里恰好有现成深化正文）；stage03 README 导航表承诺 6 篇，网站只上架 2 篇。
10. **Stage03 s03-concurrency-basics 缺可见性维度**：只演示原子性；volatile/JMM/AtomicInteger 零覆盖；join 的 happens-before 为何让本例安全未提。
11. **Stage03 s03-hashmap 先考后教**：练习要求 entrySet，day02 代码只示范 keySet+get。
12. **Stage02 知识点缺失**：包与可见性四档、static 与初始化顺序、toString/equals 重写、对象生命周期/GC 初步全阶段无内容；deep dive 05 大量使用包私有类却未解释默认可见性。
13. **Stage01 知识点缺失**：byte/short/long/float 与字面量后缀、do-while、二维数组、`++`/`+=`、三目、溢出均无显式讲解；先修倒挂（deep01/02 练习用 Stage02 的 String 方法且无最小提示）。

### 工程与体验

14. **首屏 1.80MB 单 bundle**：catalog.json 1.08MB 静态导入进主包（`web/src/catalog.ts:1`），48 篇文档全文 + 5 专题全文首页即全量下载；唯一分割是 Monaco。
15. **搜索与宣传不符**（`SearchDialog.tsx:70-139`）：只匹配标题/summary；不索引 48 篇 documents；正文 markdown 不参与；placeholder 却宣称「搜索…教材」。用户搜「HashMap 遍历」等正文知识点搜不到。
16. **全 App 级重渲染**：每次键入（`App.tsx:174-177`）与滚动停止（`:1164-1182` 220ms 防抖写回 position）都 setState 根组件；`Markdown.tsx` 无 `React.memo`，长文页滚动/打字卡顿风险高。
17. **building 专题单节深度不足**：csapp/ostep/network 正文 33-45 行（1.2-1.8k 字符）vs 已发布 algo 课 80-120 行（2.5-4.6k）；代码课覆盖率 csapp 5/14、ostep 6/17、network 2/12。
18. **stage11/12 有示例无练习层**：全部 main.py 是完整实现，无 python_basics 式 practice/challenge/debug 骨架，与「TODO 骨架独立实现」核心闭环不一致。
19. **stage12 `career_materials/legacy_resume_draft.md`**：遗留 AI 生成简历草稿，靠警告文本维持安全的高风险资产。

## P2 问题（改进项）

- Stage01：day01 `App.java` 零注释、day04 冗余 while 无教学增量；refactor 练习 expected 为描述句无法机判；supplemental_exercises 无预期输出。
- Stage02：S02B2 题面变量名与 day03 代码漂移（`amount` vs `money`）；`s02-inheritance-basics` relatedLessonIds 空断链；string-common-api 步骤内同步泄露预测答案；encapsulation README "-500" vs 实际 "-500.0"；polymorphism README 对 implements 报错归因不准；mistakes.md 名实错位（通用提示而非个人错误记录）。
- Stage03：day01/day03/day04 注释体例不齐（对比 day02 五段式）；hashset 未链 equals-hashcode；多 catch 顺序无代码现场；PECS 缺路标；设计模式课未与 lambda 打通。
- topics：algo-complexity-eval 缺 `n*(n+1)/2` 溢出注记；3 处算法函数内 println 混 IO；git 4 个最薄课缺「先预测」节；`git-merge-conflict` 练习用 `/tmp`（Windows cmd 不可用）；Conventional Commits 缺 `!` 语义；`topic-content.test.mjs:432` 用 `path.resolve("..")` 依赖 cwd（其他测试用 import.meta.url，约定不一致）。
- stages：`stages/README.md` 与根 README 缺 topics 入口；stage08 占位示例价值有限；`practice/answers.md` 经 referenceDocuments 一键可达（文本门禁无遮挡）。
- web：预测题「修改模式」硬编码 `replace("i < 3","i <= 3")`（`App.tsx:1726-1731`，未来新增题会静默判错）；ReferenceDialog 魔法路径 `endsWith("/MenuDemoApp.java")`；路线页阶段范围硬编码 `["01".."14"]`；`lessonLink`/`isApplePlatform` 重复实现；Tailwind 仅作 reset 属死重；KaTeX 全量字体进主包但仅专题课用；MAX_ITEMS=500 静默封顶语义不清晰；CI 三 OS 全量跑边际价值低；`App.tsx` 2999 行 + `styles.css` 7431 行双巨石。

## A 级资产（明确保留不动，禁止无谓重写）

1. **全部 19 篇 deep-dive 正文与 demo**（除 P0-1/P0-3 两处点位）：八段结构、实验链、预测验证、常见错误、双向链接齐备，实测零偏差——全仓价值最高的教学资产。
2. **`web/src/lib/learning-store.ts`** 的净化原语/备份往返校验/revision 冲突/串行写队列/损坏快照拒读不覆盖。
3. **`web/e2e/core.spec.ts`** 21 个真实学习闭环场景。
4. **稳定 ID 契约体系**（registry.json + content-architecture 测试 + `--update-registry` 显式登记）。
5. **verify_manifest.tsv 97 项 Java 回归** + 双平台脚本。
6. **A1-A8/S02 系列预测题答案**（逐题实测零错误）与 L1-L4 提示梯度（无答案泄露）。
7. **topic-algo/git 已发布课**：守门员不变量、边界反例、沙箱实测门禁、「先预测再运行」范式、安全红线（禁 `push --force` 步进）。
8. **building 三专题的九段式模板与诚实免责**（扩写时应保留）。
9. **stage10 python_basics 六件套教学模式**（stage11/12 课程化的标杆）。
10. **day05（Stage01 标杆课）、basic_syntax_exercises.md 题面设计、s02-bank-account 练习、choose-collection 决策表、utf8-io 课（JEP 400 边界准确）**。

## 各板块「最值得投入」Top 5（按性价比）

| 板块 | 改进项（按性价比） |
|---|---|
| Stage01 | ① 修 answers.md B1/B2 ② 修 ScannerGuardDemo 分支2 ③ predict_and_modify.md 与代码同步后删 note 补丁 ④ 参考答案达标化（拆方法+判空+防崩）⑤ day01/03/04 代码补注释 + day03 逻辑运算符示例 |
| Stage02 | ① 修 ReferenceStateDemo 第4行 ② 统一课序（stages.json lessonOrder 或正文措辞）③ 发布挂载 S02A4/S02B1 ④ src 反面教材标注 ⑤ 新增「static/可见性/对象生命周期」小节或新课 |
| Stage03 | ① 练习/预测接入 web（S03 前缀 + registry 登记 + 回填 IDs）② 补 CME 一课一题 ③ concurrency 补可见性 ④ hashmap 补 entrySet ⑤ 深化课 4 篇上站消双源 |
| topics | ① algo 补从零实现型练习 ② git 4 薄课补「先预测」 ③ ds-basics 标签修正 + 溢出注记 |
| web | ① learning-store 兼容演进层（P0-5）② 搜索补正文/文档索引 ③ Markdown memo + 滚动写回解耦 ④ catalog 路由级分割 ⑤ App.tsx/styles.css 拆分（机械搬移） |

## 审计分片原始报告

完整逐课评分表与证据见本轮会话审计记录（6 分片：stage01 / stage02 / stage03 / topics / stages 目录 / web 工程）；关键逐课结论已并入上文。迭代修复后每轮在 `04_iteration_log.md` 复核记分。
