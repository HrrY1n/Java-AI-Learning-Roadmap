# 03 · 执行计划与状态

> 状态标记：`[x]` 完成 · `[~]` 进行中 · `[ ]` 待办 · `[!]` 受阻（含原因）。本文件每轮迭代后更新。

## 基线（Round 0，2026-11-10）

- 分支 `codex/deep-overhaul`（自 `main@6c3ca91`），不直接改 main，不推送远端。
- 基线全绿：`python scripts/check_links.py`（306 OK）· `cd web && npm test`（全过）· `bash scripts/verify_java.sh`（97/97）· `npm run build`（2.5s）· `npm run verify:practice`（OK）。
- 深度审计完成（00/01），教学体系设计完成（02）。

## 迭代轮次计划（PLAN → IMPLEMENT → TEST → REVIEW → SCORE）

| 轮 | 主题 | 状态 |
|---|---|---|
| R1 | 内容 P0 修复：S02 ReferenceStateDemo 矛盾 / S01 answers.md B1+B2 / ScannerGuardDemo / predict_and_modify 题面同步（删 note 补丁）/ algo-ds-basics 标签 | [x] |
| R2 | 课序与断链：stages.json lessonOrder（S02 两处顺序）+ relatedLessonIds 补链 + day03 逻辑运算符示例 | [x] |
| R3 | Stage03 实践接入：S03 前缀改名 + predictions/stage03.json + exercises/stage03 + 回填 IDs + CME 预测题 + registry 登记 | [ ] |
| R4 | 挂载与上站：S02A4/S02B1 转 published 挂多态课 + stage03 深化课 4 篇上站 + hashmap entrySet + concurrency 可见性 | [ ] |
| R5 | web 工程：learning-store 未知字段宽容（带测试）/ Markdown memo / 滚动写回解耦 / 搜索正文与文档索引 | [ ] |
| R6 | 新课补充：s02-static-lifecycle + stage01 day07-numeric-types（新 ID 登记 + manifest 回归） | [ ] |
| R7 | 参考答案达标化（S01 ScoreStatistics/loop）+ day01/03/04 注释补齐 + S02 src 反面教材标注 | [ ] |
| R8 | topics 小修：溢出注记 / println 清理 / git 薄课「先预测」节 / /tmp 表述 / topic-content cwd 统一 | [ ] |
| R9 | UX 浏览器实测走查（多分辨率）+ 修复实测发现的真实问题 | [ ] |
| R10 | 独立评审（评审代理对全部 diff 复核）+ 全量回归 + 评分复核 | [ ] |
| R11+ | 按评审结果修复回归；预算内的追加改进 | [ ] |

## 每轮固定动作

1. 实施改动（最小充分）；2. 跑受影响的门禁测试；3. 独立视角复核（评审代理轮）；4. 更新 04/05 日志；5. 阶段性 `git commit` 到本分支。

## 红线（全程有效）

不推送远端 / 不动 main / 不删改未跟踪用户文件（v1.4_screenshots 等）/ 不改 LearningState schema / 不代填练习答案 / 新 ID 走 registry 登记 / 不虚报完成状态。
