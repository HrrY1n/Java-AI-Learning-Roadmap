# 05 · 练习与测试质量（V2.3）

> 覆盖 12 门结构化 Web 练习、25 道预测题、15 道修改题、Stage05 本地实验任务。核心问题：题目能否区分"理解原理的学习者"与"机械复制示例的学习者"。

## 一、12 门结构化练习审计结论

| 练习 | cases | 覆盖 | 防硬编码/防伪装能力（本轮后） |
| --- | --- | --- | --- |
| scores / calculator / menu / refactor（S01） | 3/7/4/3 | normal+boundary+invalid 全覆盖 | 固定输入可被硬编码绕过属**固有局限**（题面已声明"以题面规则为准"，多组用例部分抑制）；calculator 参考答案本轮对齐 7/7 用例 |
| s02-bank-account | 5 | 含全额取出边界+2 非法 | 提示只给结构不泄漏实现 |
| s03-delete-student / update-score / email-csv / excellent-stats | 4/4/4/3 | 边界+非法全覆盖（email-csv 本轮补 score 非数字） | 逐行消费 stdin 类无法整体硬编码；expected 唯一确定 |
| s04-thread-order / safe-counter / thread-pool-lab | 4/4/4 | 含溢出/零次/非法参数 | **本轮升级**：见第二节 |

## 二、Stage04 并发练习的"真结构不变量"升级（本轮核心改进）

**原缺陷（P1）**：输出契约只验证结果正确性——串行 start→join、单线程累加、手开普通 Thread 都能逐字通过（线程名检查只排除 "main"）。

**升级后的契约**（`s04-exercises.md` 陈述 + 练习 JSON + 参考答案三处同步）：
1. `s04-safe-counter`：工作线程统一命名 `counter-worker-<i>`；在**工作线程内部**登记真实执行的线程名到线程安全集合，join 后打印 `实际累加线程（排序去重）：[...]`——单线程伪装无法产出 4 个不同名字的集合（TreeSet 排序保证输出确定性）。
2. `s04-thread-pool-lab`："任务均由池线程执行"的判定改为**登记线程名必须以 `pool-` 开头**（默认线程工厂命名，手开普通 Thread 无法伪造）+ 打印 `执行线程名（排序去重）`（0 任务时 `[]`）。
3. `s04-thread-order` 保持原契约并记录理由：其契约是"每任务独立线程 + join 汇合"，串行 start→join 也是合法实现，不是伪装。

**验证**：3 个参考答案 × 12 用例真 JDK 全过；`exercise-java.test.mjs` 的 passing/wrong/compilation 三类结果记录 + 进程树清理测试全过。诚实的局限：无法阻止学习者打印假线程名（任何 stdout 契约都有此极限），但伪造必须**主动复刻结构**（命名线程+并发集合），这本身就是要学的结构。

## 三、预测题与修改题（25 + 15）

- `prediction-semantics.test.mjs`：全部客观预测题（含 modifiedAnswer 的修改版）在真 JDK 25 编译运行，normalize 后与答案逐字比对——**25 题全部真机复现**。本轮重写的 A8（除零短路版）双路实测：`&&` 打印"安全"，`&` 抛 `ArithmeticException: / by zero`。
- 修改题答案独立成档（`answers/` 不进公开文档视图，主动解锁 + 查看行为计入学习记录）。
- S05B2 referencePaths 补齐并登记懒加载参考（catalog.references 58 个），B3 锚点门禁测试通过。

## 四、诊断与迁移体系（V2.2 建立的闭环）

`stages/practice/diagnostic_and_transfer.md`（U1–U6 理解诊断、D1–D5 Debug 排错、T1–T4 迁移任务）+ `diagnostic-semantics.test.mjs`：
- 报错题在真 javac（locale 固定 `-J-Duser.language=en`）上严格复现错误信息；
- CRLF 归一化保证干净检出可用；
- 四要素闭环（理解→预测→独立→验证）强校验 14 门升级课全过；
- 答案隔离：`diagnostic_solutions.md` 只走 Stage04 referenceDocuments 主动解锁，文档视图断言不泄漏。

## 五、验证体系的边界（不允许伪造学习效果）

自动化能证明：题目有效、标准答案正确、验证脚本正常、错误案例可复现。**不能证明**：真实学习者已掌握。本报告所有"掌握"相关表述仅指结构可检验性；真实效果需真人使用验证（模拟走查已在 `06` 中明确标注为模拟）。

## 六、本轮新增/修改的测试资产

1. `verify_manifest.tsv` +2 行：`FieldShadowDemo`（字段遮蔽演示）、day01_lambda 扩展输出 `带基数结果：40`——Java 回归 107→**108**。
2. 练习契约变更同步三处（陈述 md / 练习 JSON / 参考答案）并有 12/12 用例锁定。
3. `npm test` 现含 80 个 node:test 断言 + Vitest 套件 + 内容/字体/链接门禁；两轮修复中被门禁抓出的回归（gitStep 命令格式、S05B2 参考登记）证明门禁有效。
