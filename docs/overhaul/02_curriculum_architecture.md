# 02 · 教学体系设计（新版架构）

> 原则：**保护现有稳定 ID 与学习历史**；不为形式统一强制同构；利用既有单源锚定机制（statementSource/bodyPath/codeDirectory）而非另起炉灶。本设计在 01 审计结论之上给出目标结构，逐项落地见 03/04。

## 1. 能力目标（不变，作为评分北极星）

1. Java 语言理解 2. 独立写代码 3. 读他人代码 4. Debug 与定位 5. OOP 设计 6. 数据结构与算法 7. Java 后端开发 8. 工程化协作 9. 用 AI 而不依赖 AI。

对照审计：当前 1-3 项由「概念卡 + deep-dive + 预测闭环」支撑较好（A 级）；4/5 项有基础（deep-dive 实验、entity-service）；6 项由 topic-algo 承担（练习单一化）；7/8 项依赖未上站 Stage04+（诚实标注 planned）；9 项无内容（列入 08 遗留）。

## 2. 课程类型模板（按类型组织，不强求同构）

| 类型 | 现存载体 | 组织方式 | 已达标的样板 |
|---|---|---|---|
| A 概念原理课（foundation） | 30 门 steps 概念卡 | 真实场景→为什么→概念与心智模型→预测运行→修改条件→独立练习→项目迁移（七步卡） | day05、s03-choose-collection |
| B 代码实战课 | existing_course Java 目录 | 注释即教学：Scenario/Why/Mental model/Observe/Modify/Exercise 分段头 + 行内非显然注释 | day02hashmap（五段式）、day05 |
| C 底层机制解析课（deep-dive） | 19 篇 stages/deep_dives 正文 | 场景→必须理解→原理→Observe→动手→常见错误→练习→联系 | deep04（引用传递三案例链） |
| D 编程练习课 | exercises JSON + practice md | 题面契约（normal/boundary/invalid 用例）+ L1-L4 提示 + 参考 answerSource 单源锚定 | s02-bank-account、basic_syntax_exercises |
| E 综合项目课 | mini_project/ | 保留现状，Stage04+ 再扩展 | stage01 mini_project |
| F 教材专题课 | topics（algo/git 九段式） | 场景→机制展开→不变量→「先预测，再运行」双实验→来源与出处 | algo-binary-boundary、git-undo-recover |

**本阶段的类型缺口**：D 类在 Stage03 断供（P0-4，Round 3 补齐）；C 类在 Stage03 有 4 篇存量未上站（Round 4 上站）。

## 3. 知识体系修订（14 Stage 路线内）

### 3.1 主线（Stage01-03）微调：顺序与断链

- **Stage02 foundation 顺序**：`s02-string-common-api` 提到 `s02-stringbuilder-intro` 之前（正文「下一课」指向 StringBuilder，须成立）。
- **Stage02 deep-dives 顺序**：`s02-reference-state` 提到 `s02-object-construction` 之前（02 课正文两处「上一课」指 01 课）。
- 通过 `web/content/stages.json` 的模块 `lessonOrder` 显式声明（受 `validateLessonOrderCoverage` 门禁保护：声明必须覆盖全部已发布课，不多不少）。**不动任何课程 ID**。
- 交叉链接补齐：`s02-inheritance-basics`→`s02-inheritance-vs-composition`；`s03-hashset`→`s03-equals-hashcode`。

### 3.2 知识点缺口处置（审慎新增，宁缺毋滥）

| 缺口 | 处置 | 形态 |
|---|---|---|
| Stage02：static 与初始化、包与可见性、对象生命周期/GC | **新增 1 门 foundation 课** `s02-static-lifecycle`（静态成员 + 可见性四档 + 对象一生/GC 初步三合一概念卡 + 可运行示例） | 新 ID，`--update-registry` 登记 |
| Stage01：类型系统残缺（byte/short/long/float、后缀、溢出） | 新增 1 门 foundation 课 `day07-numeric-types`（含整型溢出现场实验） | 新 ID 登记 |
| Stage01：do-while/二维数组/三目/复合赋值 | 并入现有课修改实验与 supplemental（不新增课） | 小改 |
| Stage03：CME | day01_arraylist 代码补预警注释 + 新增预测题 S03A6（边遍历边删） | 小改 + 新题 |
| Stage03：Map 遍历三方式 | day02hashmap 代码补 entrySet/values 演示注释 | 小改 |
| Stage03：可见性/volatile | concurrency-basics 补第二示例（可见性观察） | 小改 |
| Stage02/03：Optional/Comparator/List.of | 以「项目迁移」路标形式写入现有课（正式课留给 Stage04+） | 小改 |
| equals/toString 重写 | 深化课 01（reference-state）补最小 equals/toString 示例（审计建议位） | 小改 |
| building 三专题深度 | **维持 building**，不伪装发布；扩写属后续版本（08 披露） | 不动 |

### 3.3 先修关系修正

- deep01/deep02 练习的 String 方法先修倒挂：在练习处加「够用最小提示」（如 `str.toUpperCase()` 一句话），不改题目。
- Stage01 README 知识地图标注 byte/short/long/float 缺口由新 day07 补足。

## 4. 实践与项目体系设计

### 4.1 预测题覆盖矩阵（目标）

| 主题 | 现状 | 目标 |
|---|---|---|
| 变量/类型/运算符 | A1-A5 ✓ | day07 补溢出预测（S01A9） |
| 条件与循环 | A6-A7 ✓ | — |
| 方法调用/字符串 | A8 + S02A2 ✓ | — |
| 引用与对象状态 | S02A1/A2 ✓ | — |
| 构造器执行顺序 | S02A5 ✓ | — |
| 继承与多态 | **S02A4 draft** | Round 4 发布挂载 |
| 集合与泛型 | **0** | Stage03 接线 A1-A5 + 新增 CME 题 A6 |
| 异常处理 | **0** | Stage03 接线（A2 remove/A4 finally） |
| 文件操作 | **0** | Stage03 接线 B 系列覆盖 |
| 并发执行 | **0** | Stage03 接线（并发计数预测） |

### 4.2 独立练习覆盖目标

- Stage03 4 个结构化练习上站（collection_exception_io_exercises.md 翻译为 cases：normal/boundary/error），exerciseIds 回填到对应课。
- Stage02 保留现有 1 门 + oop_project_exercises 三方向维持 markdown 形态（上站成本高，08 披露）。
- 练习铁律不变：TODO 骨架不含答案；L1-L4 渐进；参考答案需显式确认且留痕。

### 4.3 连续项目教学（审视结论，不新增系统）

现状：Stage01 mini_project（控制台）→ Stage02 src 三大示例（student/library/bank）→ stage03 src 学生系统已有「同一项目渐进复杂」的雏形（Repository 演进深化课 06 即明证）。**判定：保留现有设计**，不做跨章人造大项目；Stage04+（Maven/JUnit/数据库）沿 repository_evolution 继续生长。把该演进线索在 stage03 README 显式标注为「连续项目主线」。

## 5. 网站产品优化目标（第五阶段输入）

| 真实学习场景问题 | 改动 | 明确不做 |
|---|---|---|
| 弱网/手机首屏 1.8MB | catalog 拆分懒加载（documents/topics 正文延迟） | 不做视觉改版 |
| 搜「HashMap 遍历」搜不到 | 构建期正文索引 + documents 入索引 | 不引第三方搜索 |
| 长文页打字/滚动卡顿 | Markdown memo + position 写回解耦 | 不重写渲染器 |
| 未来加字段会打回内存模式 | learning-store 未知字段宽容透传（向后兼容） | **不改现有 schema/不迁移数据**（任务书红线） |
| 修改模式硬编码替换 | 预测题 catalog 增补 modifiedCode 字段（可选，缺省回退） | 不动既有 A3 行为 |

## 6. 发布状态纪律

- 所有改动后重跑：`npm test`（含内容门禁+稳定 ID 契约）、`bash scripts/verify_java.sh`、`python scripts/check_links.py`、`npm run build`；改动 web 数据层另跑 `npx playwright test e2e/core.spec.ts`。
- 新 ID 必须走 `--update-registry`；任何课程 ID 消失/改名 → 构建失败（契约不可绕过）。
- 达不到 85 分或存在 P0 的内容不发布；building 专题不因扩写一节而虚报整本。
