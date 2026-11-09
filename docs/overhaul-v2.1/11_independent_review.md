# 11 · 独立评审报告（V2.1）

> 评审角色与开发角色分离：独立评审代理对 `git diff fb9e267..HEAD` 全量改动做对抗式复核（JDK 25 实测、沙箱复现、干净检出验证、全量重跑），本报告为评审结论 + 开发侧修复记录。

## 评审发现与处置

| 级别 | 发现 | 评审证据 | 处置 | 修复后验证 |
|---|---|---|---|---|
| **P0-1** | registry.json 的 Stage04 8 个新 ID 登记漏提交——干净检出上 `npm run content/test/build` 全部失败 | 评审在 git worktree 干净检出 HEAD 实跑，8 条稳定 ID 契约错误 | 补提交工作区已有登记产物（15b25b3） | 干净态 `npm run content` 通过（本轮已把 registry 纳入提交流程纪律） |
| **P1-2** | record-changes 课文沙箱场景缺中间 commit：照课文操作得到 `AM README.md` 而非课文标注的 ` M` | 评审沙箱 cat -A 逐字符验证 | 场景补 `git commit` 步骤；开发侧另以独立沙箱复现 `A  README.md` → ` M README.md` 序列吻合 | topic-content 11/11 |
| **P2-3** | MATH_PATTERN 两处假阳（environment/lab-local-java 的 fence 内 `$VAR`）→ 非数学文档整页占位闪烁 | 评审扫描 146 篇正文定位 | 检测前剔除代码围栏；验证脚本实测：2 篇假阳消除、8 个真数学专题课保持触发 | tsc 通过；E2E 49/49 |
| **P2-4** | 交付文档 Bundle 数字随后期提交漂移；v14-topics 场景计数写成 21（实为 16） | 评审以 HEAD 实测 1148KB/329KB（其时点） | 校准为最终 HEAD 实测：1,121KB/315KB（-41%/-43%）+ 场景计数修正 + pages 配置 18 场景未跑的如实标注 | 文档与 10 报告一致 |
| P3-a | history-diff 叙事中第二次提交与展示 diff 的时序略拧巴（机制展示正确） | — | 保留，记入 12 | — |
| P3-b | 变体题"第二个 java 块"提取规则与题面文案的耦合风险 | — | new-lesson-guide 增补契约警示（变体题题面不放其他 java 块） | 指南已更新 |

## 评审确认通过项（摘录）

- **懒加载六消费方全部核验无误**：TopicLessonReader 切课重置+竞态防护正确；gitSteps 走 manifest 元数据不受拆分影响；TopicHub/OnJavaCard/SidebarNavigation 无被删字段消费；e2e 懒加载链路全过。
- **S04 四课技术断言逐条 JDK 25 实测属实**：day02 的 happens-before 表述（JLS 17.4.5）、day03 static 锁 Class 对象与实例锁不互斥、day04 提交次序与 ThreadPoolExecutor javadoc 一致、丢更新实测 126k-130k 不虚报；S04A2 TreeSet 确定性成立（synchronized(names) 写保护 + awaitTermination 后读的内存一致性）。
- **P5 回归干净**：A3 modifiedCode 与旧行为逐字符相等；content.test 强断言是收紧；学习记录键兼容。
- **P4 属实**：三程序两版源码 stdout 逐字节 diff 相同。
- **数据安全**：registry 零删 ID、learning-store.ts 零改动、e2e 计数非放水。
- **Git 课 3.5/4 课文输出沙箱逐字复现**（stash/tag/history-diff 全过；record-changes 缺陷已修）。

## 结论

评审判定 P0×1 + P1×1 + P2×2 + P3×2，**全部已修复或披露**；修复后全量回归绿（10 报告）。达到"无遗留 P0/P1"交付门槛。
