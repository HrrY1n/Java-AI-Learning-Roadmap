# 04 · 迭代日志

> 每轮记录：做了什么 / 测试证据 / 评审结论 / 是否提升。评分复核采用 01 审计的 7 维标准。

## Round 0 · 深度审计（2026-11-10）

- **做了**：6 分片并行审计（Stage01/02/03、专题、stages 目录、web 工程）+ 全量基线测试 + 00/01/02 文档产出。
- **证据**：基线全绿（链接 306 OK、vitest 全过、Java 97/97、build OK、verify:practice OK）；全部 P0/P1 带实测证据（见 01）。
- **结论**：项目整体质量高于预期（数据层/E2E/稳定 ID 契约为 A 级资产）；问题集中在「补丁式维护、Stage03 最后一公里、web 性能与搜索、1 处 schema 演进风险」。
- **评分基线**：S01 85.5 / S02 84 / S03 84 / algo 85.5 / git 86 / csapp+ostep+network 66.5-69（building）。

## Round 1 · 内容 P0 修复（2026-11-10）

- **做了**（全部先实测再改）：
  - P0-1 `ReferenceStateDemo.java`：第二段 `c` 改为 `(小明, 95)` 并注明原因（a.score 已在第一段被改），第 4 行实测由 `false` 变 `true`，与注释/README 动手 2 恢复一致；manifest 断言 `a.score = 95`/`a == c：false` 保持成立。
  - P0-2 `practice/answers.md`：B1 改为五行逐行对照（实测 13.0/7.0/30.0/3.3333333333333335/1.0）并解释显示 vs 值变化、double 舍入尾数；B2 清除双数据残留（只按 day05 数据 351→321）。
  - P0-3 `ScannerGuardDemo.java`：误导提示「输入 10 / 0」改为「输入两个整数（试试 10 和 5）」（fixture 实际就是 2,10,5），新增注释把 int 除零 ArithmeticException 变成显式教学点；fixture 实测输出 `商 = 2`/`程序正常结束` 不变。
  - P1（题面-代码漂移）：`predict_and_modify.md` B3 题面改为「把 return 改成 break」；answers.md B3 重写并实测（close 后 nextInt 抛 `IllegalStateException: Scanner closed`，逐字核实）；删除 `predictions/stage01.json` B1/B2/B3 三条 note 补丁。
  - P1（标签失实）：`algo-ds-basics` 「无序数组」改为如实描述（数据按 `i*3+7` 生成、恰好有序，线性扫描不利用有序性），三处同步：源码 + topics.json markdown/code 字段 + verify_manifest.tsv 预期子串（`线性查找比较次数：988`）。
- **证据**：`npm run content` OK（45 课/5 练习/12 预测）；`algo-java-semantics` + `prediction-semantics` 11/11 过（预测题逐题与真实 Java 输出比对）；`bash scripts/verify_java.sh` 97/97 PASS。
- **评审**：改动均为最小充分点位修复，未触碰 A 级资产结构。
- **提升**：S01 技术准确性 P0 清零、S02 P0 清零、topics P1-1 清零。S01 评分 85.5 → ~87（B1 答案错误消除 + 题面一致）。

## Round 2 · 课序与断链修复（2026-11-10）

- **做了**：
  - `stages.json` Stage02：foundations 把 `s02-string-common-api` 提到 `s02-stringbuilder-intro` 之前（正文「下一课」成立）；deep-dives 把 `s02-reference-state` 提到 `s02-object-construction` 之前（02 课「上一课」指 01 课成立）。两模块 lessonOrder 显式声明，受 `validateLessonOrderCoverage` 门禁保护。
  - 补断链：`s02-inheritance-basics` +`s02-inheritance-vs-composition`；`s03-hashset` +`s03-equals-hashcode`。
  - `day03_if_switch/App.java` 重写：清除排版噪声与中英混杂输出；新增 `&&` 短路保护示例（挂靠预测题 A8，注释指向换 `&` 的对照实验）；switch 注释呼应课程「删一个 break」修改实验；manifest 预期同步为 `优秀	星期三	短路保护生效`（实测输出一致）。
- **证据**：`sidebar-navigation.test.ts` + `catalog.test.ts` 6/6 过（新顺序通过导航测试）；新 App.java javac 编译 + 运行输出核对；Java 回归 97/97（含 day03 新预期）。
- **提升**：S02 衔接维度 +2（顺序矛盾清零）；S01 day03 与 A8 的「先看课再做题」链路恢复；S03 hashset 去重失败根因可跳转。


## Round 3 · Stage03 实践接入（2026-11-10）

- **做了**：
  - `stages/stage03_java_core/practice/predict_and_modify.md`：题号 A1-A5/B1-B4 → S03 前缀（避开与 Stage01 短编号冲突）；A1 重设计为可运行形式（null/getOrDefault/containsKey 三行，NPE 教学移入解析）；A4 改自包含全类；新增 S03A6（CME 安全写法 removeIf，解析讲清 modCount 失败语义与"ArrayList 删倒数第二个恰不抛"的实测边界）。
  - `answers.md` 同步重命名并逐题实测（6/6 输出与答案逐字符一致，CME 边界断言经 CmeTest 实证）。
  - 新建 `practice/s03-exercises.md`（4 个网站交互版练习 + L1-L4，照 s02-exercises 模式）；配套 4 个参考实现写入 `existing_course/answers/.../stage03/answers/`（PascalCase、注释教学、下标循环删除避免 CME），全部用例实测输出逐字符冻结进 JSON。
  - 接线：`web/content/predictions/stage03.json` + `web/content/exercises/stage03/*.json`×4；18 门课的 predictionIds/exerciseIds 回填；S03A5 跨阶段挂到 s02-string-common-api；stage03 补 packageNamePrefix/slug/referenceRoots（21 个 Java 文件成为站点可懒加载参考，与 Stage01 对齐）。
  - `--update-registry` 登记 14 个新 ID（83 known IDs）；day01_arraylist 代码补 CME/remove 重载教学注释（输出不变，manifest 断言保持）。
  - 测试断言随内容状态演进：prediction-semantics 13→19（注释更新）；content.test 计数/答案表/needsInput 清单同步，B1/B3 note 断言反转为"补丁不再回来"（R1 修复的锁定）。
- **证据**：`npm test` 全过（node 77 pass/0 fail + vitest）；`verify_java.sh` 97/97；目录 5→9 练习、12→18 预测、4→8 修改题。
- **提升**：Stage03 实践练习维度 0→满（P0-4 清零）；CME 全仓零覆盖问题清零（P1-7）；预测覆盖矩阵新增集合/泛型、异常、文件、并发（删除）四个块。

## Round 4 · 挂载与上站（2026-11-10）

- **做了**：
  - S02A4（多态分发）自包含化（Animal/Dog 完整定义，实测输出 `旺财 狗啃骨头`）+ 答案 text 块补齐 → 转 published 挂到 s02-polymorphism-basics；S02B1（多态调用顺序）转 published 挂到 s02-polymorphism-mechanism（referencePath 指向 day05_polymorphism/App.java，stage02 增加最小 referenceRoot 使其可懒加载）。多态考点预测链从 0→1。
  - stage03 深化课 4 篇上站（s03-generics-why / s03-exception-design / s03-lambda-stream / s03-repository-evolution，bodyPath 机制），deep-dives 模块声明 lessonOrder（按 README 编号），基础课补反向链接（s03-generics → 泛型深化等 4 处）；练习验收引用的深化课全部可跳转。课程总数 45→49，stage03 README 导航表承诺与网站一致（P1-9 清零）。
  - day02_hashmap 补遍历三方式演示（entrySet/values 注释 + entrySet 代码 + getOrDefault 确定性行，manifest 断言 `李雷的分数（默认 0）：0`）；P1-11"先考后教"清零。
  - concurrency_basics 补可见性讲解：value() 注释讲 join 的 happens-before、输出新增四行讲 volatile/AtomicInteger 路标（manifest 断言同步）；课程卡"为什么需要"步骤补可见性一段。P1-10 清零。
  - 顺手发现并确认：stage02 answers.md 并无重复 S02B1 段（审计分片的 grep 拼接误报），未做无谓改动。
- **证据**：`npm test` 全过（node 77/0 + vitest）；`verify_java.sh` 97/97（含 hashmap/concurrency 新断言）；`check_links.py` ALL OK；目录 49 课/19 预测。
- **提升**：S02 评分预计 84→88+（多态预测链、src 反面教材待 R7）；S03 评分预计 84→88+（深化课全上站、Map 遍历、可见性）。

## Round 5 · web 工程修复（2026-11-10）

- **做了**：
  - **P0-5 learning-store 前向兼容**：`fields()` 从「字段数量完全一致」改为「必要字段齐全即可」，未知额外字段宽容放行、净化保存时按当前版本结构丢弃。未来版本新增字段后旧代码不再整体拒绝、不再把用户打回内存模式。`schemaVersion` 显式门禁与全部值域校验保持不变；`docs/javaroadmap_lab/data-and-services.md` 的行为承诺同步更新（原文承诺"检查未知字段"）。新增测试锁定双语义（宽容未知 + 拒绝缺失）。
  - **P1-3 渲染性能**：`Markdown` 与 `Code` 组件 `memo` 化（props 均为稳定字符串/setState）。阅读页滚动停止写回位置、编辑器打字存草稿触发的父级重渲染不再引发 ReactMarkdown 全文重解析/整段重新高亮。
  - **P1-2 搜索补全**：主线课正文（steps + 深化 markdown + 课程源码）、已发布专题正文、54 篇仓库文档全部入索引；标题命中优先于正文命中，正文命中显示上下文片段；与首页宣传语「搜索课程/资料」语义对齐。
- **证据**：`tsc --noEmit` 通过；vitest 41/41；learning-store 19/19；`playwright e2e/core.spec.ts` 21/21（数据层改动后真实浏览器闭环全过）；`npm test` 全过。
- **未做（披露）**：catalog 代码分割与 App.tsx/styles.css 拆分经评估触及面大、回归验证成本高，列入 08 遗留；预测题 modifiedCode 字段与路线页硬编码属 P2，后续处理。

## Round 6 · 知识断档补课（2026-11-10）

- **做了**：
  - 新增 Stage01 `day07`（数值类型与溢出）：byte/short/int/long 四档格子模型、字面量后缀 L/f、int 溢出现场实验（实测 `int 最大值 + 1 = -2147483648`）；补审计列出的类型系统最大缺口。新增预测题 A9（溢出预测，挂 day07+deep02，JVM 实测）。
  - 新增 Stage02 `s02-static-lifecycle`（static、可见性与对象的一生）：static 字段/方法边界（静态上下文无 this）、四档可见性门牌规则（示例类即"包私有"现场）、对象生命周期与 GC 时机不可控；插入 foundations 课序（encapsulation-basics 之后）。
  - 两个示例均进 verify_manifest（99 项回归），registry 显式登记 day07/s02-static-lifecycle/A9，测试断言随内容演进（S01 foundation 7 门、S02 15 门、预测 21 题实测）。
- **证据**：`npm test` 全过（node 77/0 + vitest 41/41）；`verify_java.sh` 99/99；目录 51 课/20 预测。
- **未做（披露）**：Stage01 的 do-while/二维数组/三目、Stage02 的 equals/toString 重写、Optional/Comparator 路标——按 02 设计以小改形式处理或留 Stage04+（08 披露）。

## Round 7 · 参考答案达标化与教学代码补齐（2026-11-10）

- **做了**：
  - 新增达标参考 `LearningMenuAnswer.java`（PascalCase）：hasNext/捕获+消费坏记号双防线，非法数字与非数字同一提示语，退出措辞与 menu.json 用例逐字一致（3 组用例实测）；删除崩溃且措辞不符的旧 `loop.java`，menu.json referenceFiles/note 与 deep07 README 引用同步。
  - 重写 `ScoreStatisticsAnswer.java`：求和/平均/最值/计数拆独立方法 + 空数组先处理（`暂无成绩数据`），与 scores.json 三组用例实测逐字符一致——参考答案现在满足练习自身验收（P1-4 清零）。
  - day01 App 补七步卡对应的注释头与教学注释，硬编码拼音样例改为有意义的中文样例（淄博→济南：子集字体缺「淄」，经 cmap 探针选择已覆盖城市——字体覆盖门禁实测通过 1430 字）；day04 删除无教学增量的冗余 `jian` while，补 for/while 心智模型注释与"删 count-- 会怎样"修改实验（P2 清零）。
  - deep dive 06 README 显式标注 src 参考代码两处"故意的旧风格"（setScore 静默降级、Service println）为反面教材，与练习"指出可改进点"形成结业检查（P1-5 清零）。
  - content.test 懒加载守卫名单加入 LearningMenuAnswer。
- **证据**：`npm test` 全过（node 77/0 + vitest）；`verify_java.sh` 99/99；字体覆盖通过；links ALL OK。
- **方法记录**：字体覆盖门禁拦下新字符是有效防线；缺字时优先"选已覆盖的表达"而不是重新子集化（无源字体，增量加字不可行）。

## Round 8 · topics 小修与测试健壮性（2026-11-10）

- **做了**：
  - algo-complexity-eval：sumConstant 补溢出边界注记（long 下 n>4.3e9 溢出——O(1) 只描述步数），topics.json markdown/code 与落盘源码三处同步（源码同步门禁验证）。
  - algo-iteration-recursion：fib 复杂度表述改为「指数阶，上界 O(2^n)，真值 O(φ^n)」（同为三处同步）。
  - topic-content.test.mjs 移除 `path.resolve("..")` cwd 依赖，统一 import.meta.url 推导（与 algo-java-semantics 同约定），跨目录运行不再误报。
- **证据**：topic-content + algo-semantics 21/21；`verify_java.sh` 99/99；`npm test` 全过。
- **未做（披露）**：algo 3 处算法函数内 println 的纯函数化重构（需逐一保证 stdout 与 manifest 断言一致，价值 P2）；git 专题 4 个薄课补「先预测」节（需沙箱实测真实输出，属下一内容批次）；见 08。
