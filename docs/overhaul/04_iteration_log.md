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
