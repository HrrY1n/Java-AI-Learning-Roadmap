# 11 · 独立对抗审查与修复报告（V2.3）

> 审查由职责分离的只读对抗审查代理执行：只审查 `32ecf59..2e39550` 全部 4 个提交，假设修复可能有错、有遗漏、有伪装。审查代理自跑了 `npm test`（80/80）、`verify_java.sh`（108/108）、A8/calculator/FieldShadowDemo/SafeCounter 30 次压力/Thread 10 次/Git 沙箱复跑/关联完整性脚本等实测。全部发现已在 R3 提交中修复并复验。

## 一、审查确认通过的关键项

1. **修复真实性**：A8 重写（双路 javac 实测）、calculator 7/7 用例、FieldShadowDemo（含 manifest TAB 格式 `cat -A` 核验）、Stage05 三处 MySQL/Connector/J 表述、hunk 合并规则边界（gap=6→1 hunk、7→2 hunks 实测）、git-internals-basics 哈希逐字复现——全部成立。
2. **关联完整性**：61 课/12 练习/25 预测/15 修改全部引用 id 存在；registry 113 个 knownIds 缺失 0、僵尸 0；R1 修复的双向关联经脚本确认对称。
3. **回归自跑**：npm test 80/80、verify_java 108/108（审查代理独立复跑）。
4. **伪装检查**：`git diff 32ecf59..2e39550 -- web/scripts/ web/src/` **零 diff**——无测试放水、无生产代码污染、断言只增未减、package.json 未动。

## 二、发现的问题与修复处置（R3 提交）

| 级别 | 发现问题 | 审查证据 | 修复措施与复验 |
| --- | --- | --- | --- |
| **P0-1** | `SafeCounterLabAnswer:59` 用未同步 `TreeSet` 承接 4 线程并发 `add`——审查代理 30 次实测 **16 次丢条目/乱序（TreeMap 结构损坏）+ NPE 线程死亡**，且违反练习自身"线程安全集合"要求；npm test 未抓到是因为骨架测试不跑 Answer | 30 次压力实测日志 | 改为 `Collections.synchronizedSet(new TreeSet<>())`（与 ThreadPool 答案一致）；**修复后 30 次压力实测 30/30** 输出 `[counter-worker-1..4]` + 计数 200000 |
| **P1-1** | git-merge-conflict "实测输出"graph 第二行 `|| *` 为转写损坏（git 无法产出该形状；实现者自己的沙箱日志里是正确的 `\|`） | 沙箱日志 `.audit-work/v23/git-sandbox-1.log:34-39` 对照 | 按真实日志修正图块（`\|` + `\| *` 结构） |
| **P1-2** | deep03 新小节仍引用 R1 已删除的旧 A8 `arr[2]` 题面（R2 在 R1 之后提交的自相矛盾） | README:40 | 改写为指向现有越界实验 + 正确的 A8 关联说明 |
| **P1-3** | git-branch-create-merge gitSteps 缺 `git switch main`：第 3 步 repoStateBefore 写"位于 main"与实际矛盾，逐字回放得 `Already up to date`；且空提交序列只能演 FF、演不出标题承诺的三方合并 | 步骤序列推演 | 插入 `git switch main` 步骤（4 步）；merge 步解释收窄为"本序列演示 Fast-forward；三方合并需 main 分叉后再前进一笔" |
| P2-1 | 4 处基线既有单向关联漏网（s03-exception-design→s03-email-csv、s03-lambda-stream→s03-excellent-stats、s03-repository-evolution→s03-delete-student、S02A5↔s02-constructor-this） | 关联脚本 | 全部补齐回列（与 R1 口径一致） |
| P2-2 | deep05 "for≈while 不改变语义"在含 `continue` 时不成立（下一段自相矛盾） | 文本审查 | 措辞收窄为"无 continue 时等价 + continue 时 for 步进仍执行" |
| P2-3 | git-internals-basics 哈希实测未提示"无换行"字节前提（`echo hello >` 会得另一哈希） | 哈希复现 | 补充说明（含 `ce013625…` 对照值与"内容寻址对每字节敏感"） |

## 三、R3 复验结果

| 验证 | 结果 |
| --- | --- |
| SafeCounterLabAnswer 30 次压力实测（4 50000） | **30/30** 输出正确（修复前 16/30 失败） |
| `npm test`（R3 后全量） | **80 pass / 0 fail，EXIT=0** |
| 关联回列后双向一致性 | 修复项全部对称 |
| 远端 CI（2e39550 首跑） | verify.yml ✅ 2m1s（Java Windows+macOS）、web.yml ✅ 5m17s（web-core 三 OS + web-visual）；R3 推送后二次复跑见 `12` |

## 四、结论

审查代理判定标准："修完 P0-1 与 3 个 P1 并补跑回归后可进 RC"——P0-1 与全部 P1/P2 已在 R3 修复，回归与压力实测全绿，**达到发布候选条件**（远端 CI 终态结果见 `12_REGRESSION_AND_CI_REPORT.md`）。
