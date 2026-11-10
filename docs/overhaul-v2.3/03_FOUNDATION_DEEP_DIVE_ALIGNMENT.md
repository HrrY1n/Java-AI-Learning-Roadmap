# 03 · 基础课与深化课融合对齐报告（V2.3 · R2 轮）

> 任务书第五节要求检查"基础课 + 深化课"是否造成学习割裂。本报告给出全量对齐结论、本轮实际调整与"不做什么"的理由。

## 一、全量对齐结论（61 门主线 + 配对关系核查）

| Stage | 基础课 | 配对深化课 | 对齐判定 |
| --- | --- | --- | --- |
| 01 | day01–day07（7 门） | deep01–deep07（7 门；语义配对 day03↔deep07、day04↔deep05、day05↔deep03、day06↔deep04+deep06、day07↔deep02，编号不代表配对） | ✅ 配对完整（V2.4 整合轮修正"一一配对"表述）；本轮把"只存在于代码注释"的 3 个机制成文进深化课（见第三节） |
| 02 | 9 门基础 | 6 门深化（object-construction / encapsulation-why / inheritance-vs-composition / polymorphism-mechanism / reference-state / entity-service） | ⚠️→✅ interface-abstract 与 stringbuilder-intro 曾断档：前者本轮补上与 polymorphism-mechanism 的互链（选择标准已在该深化课内）；后者在项目迁移步补深化入口与容量增长/编译器自动 StringBuilder 指引。审计确认配对不重复、不割裂 |
| 03 | 16 门基础 | 6 门深化（choose-collection / generics-why / exception-design / utf8-io / lambda-stream / repository-evolution） | ⚠️→✅ 审计把候选断档从 13 门修正为 9 门（其余 4 门实有配对）；其中 8 门由高密度示例代码承载可接受，真正不足的 hashset（去重机制）与 lambda（变量捕获）本轮已补机制；file-read↔utf8-io 单向关联已修复 |
| 04 | 5 门 | 无深化课（长正文 + 练习闭环承接） | ✅ s04-concurrent-tools 兼任深化角色；本轮补 jstack/Thread.start HB/shutdownNow/Future.cancel 后机制覆盖完整 |
| 05 | 5 门 | 无（每课自带连续正文） | ✅ |

**结论**：基础课把理解必需的机制留在本课内（补齐后），深化课承担"为什么/判断题/工程取舍"增量——"基础课只有几句定义、把理解推给深化课"的情况已消除；两节课大量重复的情况经审计确认不存在（重叠限于规则陈述层）。

## 二、"为了排版而排版"的证据化处理

任务书点名的问题（固定七步模板、短段落拼凑）经六代理审计的实证结论：

1. 28 门无连续正文的课程中，绝大多数 steps 与本课示例代码真实联动（预测指向具体输出、修改指向具体条件），**不构成空模板**；本轮不为其批量生成正文——那正是"为了排版而排版"的反面。
2. 真实缺陷是**少数机制只存在于代码注释而从未成文**，已全部成文：
   - Stage01：for 三段执行时序（→ deep05 新小节）、`new int[n]` 与默认值（→ deep03 新小节）、方法声明完整语法（→ deep06 新小节）。
   - Stage02：字段遮蔽（→ 深化课 05 新小节 + `FieldShadowDemo` 可运行演示，入 `verify_manifest.tsv`）。
   - Stage03：HashSet 去重机制（→ 概念卡 + 代码注释）、Lambda 变量捕获/effectively final（→ 概念卡 + App 实验 + 深化课 05 新小节）。
3. 每个新小节都遵守"机制 + 为什么 + 可验证实验"结构，而非定义复读。

## 三、Git 专题薄课密度治理（6 门，真实沙箱实测）

审计发现 6 门正文 <740 字符且缺沙箱实测叙述。本轮在**真实 Git 沙箱**（Git Bash + Git 2.5x，`/tmp/gitsb`）逐门实验并采集真实输出后扩写（日志存 `.audit-work/v23/git-sandbox-*.log`）：

| 课程 | 前 | 后 | 新增实测内容 |
| --- | --- | --- | --- |
| git-merge-conflict | 714c | 1199c | 真实冲突全程：`UU ideas.md`、Unmerged paths、双父节点 `log --graph`、`merge --abort` 后 status 为空 |
| git-interactive-staging | 736c | 972c | y/n 分块实测三段输出 + **修正原课不严谨断言**：hunk 合并规则（间隔 ≤6 行并成一个 hunk，8 行小文件实测复现） |
| git-rebase-cherry-pick | 538c | 993c | 前置条件、分叉→直线图、哈希改写证据（`0d02434`→`4323900`）、真实冲突停下形态（`Could not apply`）、cherry-pick 哈希复制证据 |
| git-collab-workflow | 620c | 1262c | 本地裸仓库模拟远端：**克隆空仓库默认 master 的真实行为**、`push -u` 与无 `-u` 的 `branch -vv` 对比（有/无方括号）、双克隆 `branch -a` |
| git-history-archaeology | 626c | 1234c | reflog 两行定位 + `branch rescue` 三笔全回；bisect `run` 约 3 步命中 `is the first bad commit`；blame 逐行定责 |
| git-internals-basics | 627c | 1087c | `hash-object` 同内容同哈希（可跨机复现值）、一字节改变哈希、`cat-file -t/-p` 三层对象引用 |

实验中发现并写入课文的三个真实行为（均为诚实呈现而非教材化美化）：
1. 克隆空仓库时本地默认分支跟随 `init.defaultBranch`（实测 master），想要 main 需显式 `git switch -c main`。
2. `git push` 失败（refspec 不匹配）时的报错形态与 `branch -vv` 的 `[origin/…: gone]` 显示。
3. `git add -p` 上下文合并规则会导致"两处改动收进一个 hunk"，需先 `s` 拆分。

## 四、验收自查（任务书 5.4 七问）

- **这节课要教会什么**：每门被修改的课在其概念卡/正文首段均有明确任务陈述（审计确认，未改动者略）。
- **哪个真实问题使其必要**：场景节均为具体开发情境（冲突/误删/协作/定位），沙箱实测从场景直接展开。
- **准确含义**：本轮全部机制表述给出 JLS/官方文档/真实命令行为依据（`04_TECHNICAL_ACCURACY_REVIEW.md` 汇总）。
- **代码如何运行**：新增演示均真 JDK 实跑（FieldShadowDemo 入回归 108 项、lambda 实验行入 manifest）。
- **边界与错误**：新增 hunk 合并规则、rebase 冲突停下形态、reflog 时效性、数组默认值隐患等边界。
- **能否完成新任务**：每门课的独立练习/预测题均要求在新数据上重做（既有设计保留）。
- **与后续工程联系**：Git 课指向 Stage 08 协作实践、Stage01 机制小节指向 Stage02/03 对应概念，衔接未断。
