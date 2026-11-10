# 06 · 预测题架构审计与升级报告（V2.1-P5）

## 七问七答（任务书要求的专项审计）

1. **现状如何表达代码片段？** 单一 `code` 字段（题面 md 第一个 java 块）；"修改后代码"不存在于数据层。
2. **modifiedCode 缺什么？** UI 用 `code.replace("i < 3","i <= 3")` 伪造变体（App.tsx 1729）、checkbox label 硬编码「将 < 改为 <=」、语义测试同款 replace——三处同一个魔法串。新增变体题若代码不含该串：**静默显示原代码却按修改后答案判题**（用户必错且无感知）。
3. **现有题面与代码无法对应的问题？** 当前唯一变体题 A3 恰含目标串——正确性靠巧合耦合维持。
4. **需要多变体吗？** 不需要。教学模型是"修改一个条件"（单变体）；多变体会复杂化学习记录与 UI。保留 `-modified` 单后缀。
5. **需要对变体独立验证吗？** 需要——semantics 门禁现在用**显式 modifiedCode** 实测（此前用 replace 产物实测，等效但依赖巧合）。
6. **影响历史题吗？** 不影响：A3 迁移后行为逐字节一致（学习记录键 `A3-modified` 不变，core E2E 预测流程通过）。
7. **向后兼容？** 保留：`modifiedAnswer` 布尔语义不变；UI 与 semantics 的 replace 兜底保留（仅未迁移旧数据会走到）；content.test 新断言**所有**已发布变体题必须显式携带 modifiedCode——兜底成为纯保险而非依赖。

## 实施（提交 93f80a0，六层协同）

| 层 | 改动 |
|---|---|
| 题面契约 | 变体题含第二个 java 块 = 修改后代码（A3 已迁移：双块+说明文字） |
| build.mjs | `javaBlocks[1]` → `modifiedCode` 字段（缺省省略字段） |
| content-types | `Prediction.modifiedCode?: string` |
| App.tsx | `modifiedCode ?? replace` 兜底；label 通用化「按题面说明修改代码后再预测一次」 |
| semantics 测试 | 变体用显式 modifiedCode 实测 |
| content.test | 强断言：有 modifiedAnswer 必有 modifiedCode |

**结论：确实有必要，已实施；未为加字段而加字段**——拒绝多变体数组（当前教学模型无此需求）、拒绝把变体说明塞进 schema（prompt 文本已承载说明职责，避免元数据与正文双源）。
