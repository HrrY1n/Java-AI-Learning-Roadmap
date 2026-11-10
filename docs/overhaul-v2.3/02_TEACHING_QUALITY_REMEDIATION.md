# 02 · 教学质量修复实施记录（V2.3 · R1 轮）

> 对应 `01_FULL_CURRICULUM_AUDIT.md` 的修复清单。全部修改均经真 JDK 25 / 真实测试数据验证；每项注明证据。回归结果见文末。

## 一、P1 修复（11/11 全部完成）

| # | 问题 | 修复 | 验证 |
| --- | --- | --- | --- |
| 1 | `answers.md` B1"对比原版 3/7/30/3/1"首值笔误 | 改为 `13/7/30/3/1`，并修正"结尾是 5 不是 7"为可验证事实（10.0/3.0 = 3.3333333333333335，二进制舍入） | 临时编译 `int a=10; double b=3.0` 五行输出逐项核对 |
| 2 | `day07 App.java:7` 注释承诺不存在的"编译报错演示行" | 改为指向真实存在的实验行（29 行 byte 整型提升、15 行 L 后缀） | 文件内两处目标行号核对 |
| 3 | SimpleCalculatorAnswer 与 calculator 7 用例不对齐 | 补 `结果：` 前缀（除零消息按契约无前缀）、改"暂不支持这个运算符：%"、`hasNextDouble` 防御"请输入数字"后体面结束 | **7/7 用例输出逐一实测 MATCH** |
| 4 | A8 预测题在 day03 使用未教数组语法 | 题面重写为除零短路版（`score > 100 && score / 0 == 1`），仅依赖 day03 条件分支概念；关联 lessonIds 调整为 [day03, deep07] | `&&` 版实跑打印"安全"；`&` 版实跑抛 `ArithmeticException: / by zero`；`prediction-semantics` 真 JDK 套件通过 |
| 5 | s02-polymorphism-basics 独立练习要求 Robot 子类，与深化课"Robot 不是 Animal"反例冲突 | 改为 Rabbit（is-a 成立），并注明反例出处 | lesson JSON 修改 + 深化课 05 交叉核对 |
| 6 | "字段不参与多态"全阶段缺失 | 新增 `FieldShadowDemo.java`（独立文件、显式包名）+ Animal/Dog 增补 `label` 遮蔽字段 + 深化课 05 新增小节 + 基础课概念卡一句 | **新增 `verify_manifest.tsv` 行**，Java 回归 108/108 实跑输出 `Animal 的 label / [旺财] 汪 / Dog 的 label` |
| 7 | s03-hashset 未讲去重机制（40 字概念卡 + 零机制注释） | 概念卡补"hashCode 分桶 → equals 判等 → 自定义对象不重写当不同元素"；App.java 注释逐 add 讲机制 | 输出零变化（注释级修改），manifest 行为不变 |
| 8 | s03-lambda effectively final 全阶段零覆盖 | 概念卡补规则 + App.java 增加真实捕获实验（`base` 有效 final + 注释实验行）+ 深化课 05 新增"变量捕获与 effectively final"小节（含设计动机） | manifest 行新增 `带基数结果：40`，Java 回归实测通过 |
| 9 | Stage04 练习输出契约无法区分真并发/线程池与串行伪装 | **契约升级**：safe-counter 增加"实际累加线程（排序去重）"行（工作线程内部登记真实线程名，TreeSet 排序保证确定性）；thread-pool-lab 的"均由池线程执行"判定改为**线程名以 `pool-` 开头**（默认线程工厂命名，手开普通 Thread 无法伪造）并增加"执行线程名（排序去重）"行 | 两答案 × 8 用例全过；`s04-exercises.md` 陈述同步；thread-order 保持原契约并说明理由（每任务独立线程+join 即契约，串行 start→join 也是合法实现） |
| 10 | git-intro-basics 断言 `git init` 必得 main | 命令保持 `git init`（门禁要求），解释文本明确 `init.defaultBranch` 差异与 `git init -b main` 方案；status 输出如实标注 main/master 两种可能 | `topic-content.test.mjs` 11/11（含 Unborn/index/No commits yet 严谨断言） |
| 11 | git-branch-create-merge 两步照做只得 Already up to date | 插入 `git commit --allow-empty` 步骤（纯 git 命令满足门禁；解释空提交用于制造分叉点，真实工作为功能提交） | 同上 11/11 |

## 二、P2 修复（24 项全部完成）

- **Stage01**：deep02 `(int) sum` 结论改写（int 时恒等价、double 时截断）；day01 Modify 改为真实触发 definite-assignment 错误的操作；练习 2 L2/L3 与"提示后体面结束"契约对齐；scores note 去掉对 method.java 不成立的"方法拆分"表述。
- **Stage02**：day01_string 常量池注释按 JLS §3.10.5（同类字面量保证同一池对象，工程上仍只用 equals）；reference-state "5 行"→"6 行"；interface-abstract/inheritance-basics/entity-service 三处 relatedLessonIds 断链补齐；encapsulation-basics 修改条件补金额操作；stringbuilder-intro 项目迁移补深化入口（容量增长/编译器自动 StringBuilder）；entity-service ArrayList 前向依赖注释。
- **Stage03**：hashmap README 补 Map 版 CME 边界（第 5 条）；file-read relatedLessonIds 增 s03-utf8-io + 相对路径按启动目录解析说明；excellent-stats 答案 Stream 版改 `IntStream.range`（兑现 Javadoc"无外部可变变量"承诺，输出逐字节不变）；email-csv 答案补 email 非空校验（对齐题面"允许任何非空值"）+ 新增"score 非数字"case；type-information 概念卡与代码 `getDeclaredConstructor().newInstance()` 措辞对齐。
- **Stage04**：thread-basics 概念卡补 `Thread.start()` HB 与 jstack 对照；thread-pool 概念卡补 `shutdownNow`；concurrent-tools README 补 `get(timeout)`/`cancel(mayInterruptIfRunning)` 路标；safe-counter 回链 s04-concurrent-tools。
- **Stage05**：day01 UNIQUE 多 NULL 语义；day04 EXPLAIN 估算波动声明 + `ANALYZE TABLE` 作用解释；day05 Connector/J 默认客户端预编译与服务端预编译差异（防注入结论不变）；`stage05_mysql_db/README.md` 补 8GB 设备资源成本提示；S05B2 `referencePaths` 补齐并同步登记 `day04_indexes_explain` 为懒加载参考根（catalog.references 58 个）。
- **算法专题**：`algo-iteration-recursion` 转义损坏修复（控制字符 0x0B/0x07 → `φ≈1.618`，与代码注释一致）；selection-heapsort / non-comparison-sort 章节号 4/5/6 → 3/4/5 连续化（确认无"第 N 节"自引用）；graph 第 3 节复杂度论断与防环论断拆句。
- **Git 专题**：3 门课 h1 与 title 对齐；rebase-interactive "3 条变 2 条"改为精确表述（窗口 3→2、全史 4→3）。

## 三、评估后不采纳/维持现状项（如实记录）

1. **全量给 28 门无正文基础课补连续讲义**：不采纳。审计证据显示这些课的 7 步与本课代码真实联动、非空模板，机制缺失集中在少数具体点（已逐一修复）；全量重写属于"为了修改而修改"。
2. **method.java 类名小写**：维持。历史文件无导航/运行问题，AGENTS.md 约定不机械改名。
3. **day07 无结构化练习**：留待后续轮次评估（新增练习涉及 registry/门禁联动，单独小轮处理更稳）。
4. **menu/refactor 练习散文 expected**：维持。它们是"行为自比"任务，散文契约符合设计意图（审计代理亦判定为固有而非缺陷）。

## 四、R1 回归结果（真实命令与数字）

| 验证 | 结果 |
| --- | --- |
| `bash scripts/verify_java.sh` | **108 通过 / 0 失败**（含新增 FieldShadowDemo 行） |
| `npm test`（含内容构建、字体覆盖 1413 汉字、Vitest、12 个 Node 套件） | **80 pass / 0 fail，EXIT=0**（日志 `.audit-work/v23/npmtest-r1b.log`） |
| 首轮 npm test 抓到并修复的回归 | 2 处：gitStep 命令必须以 `git ` 开头（改 `--allow-empty` 方案）；S05B2 referencePaths 必须登记懒加载参考（补 referenceRoot） |
| 练习参考答案 × 用例 | Stage01 calculator 7/7、Stage03 excellent 3/3 + csv 4/4、Stage04 12/12 全部真 JDK 实测 |
| `prediction-semantics`（25 预测 + 修改版真 JVM 运行） | 通过（含重写的 A8） |
| 字体覆盖 | 1413 个已发布汉字全部在子集字体 cmap 中（新增汉字自动纳入校验） |
