# 09 · V2.1 迭代日志

> 每轮：发现 → 改动文件 → 原因 → 测试 → 评审 → 下一步。本轮共 9 轮有效迭代（上限 16）。

## Round 1 · 继承核验 + Bundle 基线（P1 起点）

- 发现：任务书前提「Bundle 优化已在独立分支完成」不成立（仓库无此分支，仅视觉实验分支）；主包实测 1,892KB/gzip 552KB，catalog 750KB 中 topics+documents 正文占 58%。
- 改动：创建分支 codex/deep-overhaul-v2.1；审计 6 个 catalog 消费方。
- 测试：build 基线冻结。

## Round 2 · P1 元数据/正文分离 + KaTeX 懒加载（提交 8d3b542）

- 改动文件：generate-content.mjs、content-bodies.ts（新）、content-types.ts、TopicView.tsx、LazyDocumentBody.tsx（新）、SearchDialog.tsx、Markdown.tsx、App.tsx、slug-heading.test.ts。
- 原因：首屏携带 58% 非即时正文；KaTeX 全量进主包但仅专题课用。
- 测试：tsc 通过、npm test 全过、完整 E2E 49/49；主包 1,892→1,086KB、gzip 552→307KB。
- 过程问题：slug-heading.test 读生成文件需适配 bodies 数据源（改读法，不变量不变）。

## Round 3 · P4 算法纯函数化（提交 ceeb37f）

- 改动：knapsack01Table/editDistanceTable/selectionSortRounds 抽出；topics.json 三处同步。
- 测试：三程序 stdout diff 为空；topic-content+semantics 21/21；verify_java 103/103。

## Round 4 · P5 预测题 modifiedCode（提交 93f80a0）

- 审计结论：单变体模型保留，显式化必要（魔法串 replace 是巧合耦合）。
- 改动：build.mjs 解析第二个 java 块、类型、UI 兜底+label 通用化、semantics 用显式代码实测、content.test 强断言、A3 迁移。
- 测试：13/13；core E2E 预测流程通过；A3 modifiedCode 与旧行为逐字符相等（评审复核）。

## Round 5 · P2 Git 四课扩写（提交 ada78bd）

- 改动：四课 1580-1933 字符（先预测节+实测输出+常见错误+独立操作+项目迁移）、/tmp 表述、页码对齐。
- 测试：git-lab 16 沙箱场景 + topic-content 全过；字体覆盖通过。
- 过程核验：JSON 单行 stat 曾误导读丢内容——实测两提交内容确认全部入库。

## Round 6 · P3 Stage04 审计与示例建设

- 设计：并发四课（续接 s03 路标），确定性输出设计。
- 发现并修正：day02 初版只有一个累加线程（无竞争，原子性教学点失效）→ 改双线程并发，三连跑实证丢更新 125k-129k/200k。

## Round 7 · P3 Stage04 全量接线（提交 4363c8c）

- 改动：4 课 JSON+示例+预测题+修改题+manifest+4 行、stages.json 转 published、registry 登记、README、s03 互链、三处测试断言同步。
- 测试：npm test 全过、verify_java 103/103、core E2E 21/21、字体 1367 字通过。

## Round 8 · P6 三大专题审计 + 快速修复（独立代理审计）

- 发现：43 节实测深度 692-1566 字符（修正第一轮 1.2-1.8k 的估计）；分级 csapp 12A/2B、ostep 10A/7B、network 8A/4B；教材映射 1 处页码重叠；counter++ 四重重复；深化方案与转正门禁产出。
- 改动（提交）：ostep-file-systems 页码标注、三处分工/先修路标。

## Round 9 · 文档 + 最终回归 + 独立评审（提交 15b25b3 / 6fc881f）

- 文档 00-08 落盘；全量回归（npm test 77/0、E2E 49/49、verify_java 103/103、links 319 OK、build OK）。
- **独立评审发现并修复**：
  - **P0-1** registry.json 漏提交（干净检出上 8 条稳定 ID 契约错误、全门禁崩）→ 补提交（15b25b3）。教训：`--update-registry` 之后必须把 registry.json 纳入同一提交的 add 清单。
  - **P1-2** record-changes 沙箱场景缺中间 commit（照做得到 `AM` 而非 ` M`）→ 补 commit 步骤并沙箱复现验证。
  - **P2-3** KaTeX 假阳 2 篇（fence 内 $VAR）→ 检测前剔除代码围栏（脚本实测：2 篇消除、8 个真数学课保持）。
  - **P2-4** Bundle 文档数字随后续提交漂移 → 校准为 HEAD 终态 1121KB/315KB（-41%/-43%）并修正 E2E 场景计数表述。
  - P3：new-lesson-guide 增补变体题 java 块契约警示。
- 修复后复跑：topic-content 11/11、tsc、npm test 全过、完整 E2E 49/49、links ALL OK。

## 教训沉淀

1. `--update-registry` 的产物（registry.json）必须与内容改动同一提交——独立评审用干净检出才能发现这类"工作区绿、提交态崩"。
2. 并发教学示例必须先做"竞争是否存在"的自检（day02 初版错误）。
3. 数值/体积结论要在最终提交态复测（Bundle 数字漂移）。
