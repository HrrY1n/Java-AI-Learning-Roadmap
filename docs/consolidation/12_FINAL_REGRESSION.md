# 12 · 终态回归与远端 CI 报告（整合轮 · 终态 `d958f88`）

## 一、本地干净检出终态回归（`2c57010`，独立 worktree `C:\Users\Administrator\AppData\Local\Temp\jrl-v23-clean`）

| # | 验证项 | 结果 |
| --- | --- | --- |
| 1 | Java 全量回归 | ✅ **108/108** |
| 2 | `npm test`（含内容/字体 1418 汉字/Vitest/12 Node 套件） | ✅ **80 pass / 0 fail，exit=0** |
| 3 | `npm run build` + `check:build` | ✅ 3.93s / 通过 |
| 4 | 内容生成幂等 | ✅ 生成后零漂移 |
| 5 | 默认 Playwright E2E（CI=1 全新 preview） | ✅ **69/69（3.9m）** |
| 6 | Pages smoke（全新 4173 + title 指纹） | ✅ **10/10（1.2m）** |
| 7 | `check_links.py` | ✅ 325 条 ALL LINKS OK |
| 8 | 窄屏 290–390 × 6 路由（手动走查） | ✅ 零溢出 |
| 9 | verify_mysql 前置检查错误分支（DB 未运行，bash+ps1 × 2 场景） | ✅ 4 分支全部可读报错 + exit 2、零 Docker 启动 |

R10 追加改动（5 文件：topics.json 4 门 stageLinks、verify_mysql.sh 超时、3 份文档措辞）后复跑：`npm test` **80/80**、`bash -n` 通过、前置检查实测正常。

## 二、远端 GitHub Actions（Draft PR #11）

| 提交 | verify.yml（Java win+mac） | web.yml（web-core 3 OS + web-visual） | 备注 |
| --- | --- | --- | --- |
| `2e39550`（V2.3 终态） | ✅ 2m1s | ✅ 5m17s | core 21 用例 |
| `e703871` / `1e9342b` | ✅ | ✅ | V2.3 复跑 |
| `135a62f` | ✅ 2m39s | ✅ 6m5s | V2.3 文档提交 |
| `b63eee6`（整合实施） | ✅ 6m29s | ✅ **7m10s** | **方案 B 生效：web-core E2E = core 21 + v14-topics 16 = 37 用例 ×3 OS** |
| `2c57010` / `d958f88`（文档 + QA 修复） | （自动触发） | （自动触发） | 实跑结果以 Actions 页为准，本地等价验证已全绿 |

## 三、整合轮回归体系抓到并修复的真实问题

1. 触控目标加宽导致 290–360px 顶栏溢出（E2E 3 例）→ 三轮定位后以末层 489 块收敛，实测零溢出。
2. 搜索探针之外的连带影响无；Python 裸引号破坏 s03-lambda.json 一次（本地即刻发现修复，未进提交）。

## 四、结论

本地与远端门禁对整合终态全部绿色；CI 覆盖较 V2.3 提升（37/69 E2E 用例进门禁），无未解决缺陷。
