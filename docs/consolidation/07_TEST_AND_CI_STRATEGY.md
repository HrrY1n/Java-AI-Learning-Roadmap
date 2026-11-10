# 07 · 测试与 CI 策略（任务书 4.3 三方案量化对比）

## 一、基准数据（全部实测）

| spec | 用例 | 本地时长（workers=1） | CI 现状 |
| --- | --- | --- | --- |
| core.spec | 21 | 46.1s | web-core ×3 OS（windows 61s / ubuntu 43s） |
| v14-topics | 16 | 35.9s | **无** |
| visual | 14 | 94.7s | web-visual ×1（ubuntu，仅 PR） |
| sidebar-nav / search / stage02 / v22-lessons | 9/3/4/2 | 11.7/3.1/3.9/3.8s | **无** |
| pages smoke | 10 | 69s | pages.yml 部署后自动跑（main） |

CI 基线（run 42871671578）：web-core windows 6m57s（Install Chromium 3m53s 为关键路径大头，E2E 步骤仅 61s）、ubuntu 1m59s、macos 2m24s、web-visual 2m11s、verify ~2m。Windows E2E 系数 ≈ 1.32×。

## 二、三方案对比

| 维度 | A 现状 | B 现状 + v14-topics 进 web-core | C 分层：PR=B + nightly 全量 |
| --- | --- | --- | --- |
| PR E2E 覆盖 | 35/69（34 用例零 CI） | **51/69** | 51/69 + 定期全量兜底 |
| web.yml 墙钟 | 7m1s | ~7m50s（**+12%**） | PR 同 B；nightly +9–10m |
| 计费增量/次 PR | 0 | ~+2.1 分钟（三系统合计） | 每周 nightly +30–40 分钟 |
| 缺陷发现价值 | core 21 用例历史零失败；34 用例盲区 | 覆盖**唯一有整文件失败史**（16 fail = 4173 硬编码 + 探针漂移）的 spec；专题是最活跃增长区 | 增量只兜住 4 个小 spec（本地合计仅 22.5s）；pages smoke 已由 pages.yml 自动跑，nightly 无线上增益 |
| 维护成本 | 0 | web.yml 一行改动 | 新 workflow + 失败通知运维 |

## 三、决策：**采纳 B**（一行落地）

理由：① E2E 步骤只占 windows 关键路径 61s，+16 用例约 +47s（+12%），远低于 Install Chromium 的 3m53s；② v14-topics 是唯一出过整文件失败的 spec，且专题体系持续扩张；③ core 零失败史说明现状对它已足够；④ C 的 nightly 增加运维面而增量价值小。**实施**：`.github/workflows/web.yml` 的 E2E 步骤改为 `npx playwright test e2e/core.spec.ts e2e/v14-topics.spec.ts`。更简的 B+ 变体（4 个小 spec 直进 web-core，+18 用例 +30s，55/69 全覆盖）列为可选，本轮先落 B 观察。

## 四、本地完整验证纪律（与 CI 互补）

- 全量 69+10 E2E 仍以**本地 `CI=1`**（全新 preview + 端口/内容指纹双核验）作为交付前门禁；CHECKPOINT 固化流程。
- `verify_mysql` 仅在真实 DB 集成验证时人工触发（08 文档前置检查清单）。
- npm test（80 用例，本地 28.5s / CI 26–48s）保持每次提交前运行。

## 五、验收方法

CI 推送后：web.yml 三个 OS 的 E2E 步骤覆盖 37 用例（core 21 + v14-topics 16），墙钟 ≤8 分钟；web-visual 与 verify 不变；本地全量回归保持 69+10 全绿。
