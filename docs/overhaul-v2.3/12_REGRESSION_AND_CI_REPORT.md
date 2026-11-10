# 12 · 终态回归与远端 CI 报告（V2.3 · 终态 `1e9342b`）

> 所有本地结论来自独立干净检出 worktree（`C:\Users\Administrator\AppData\Local\Temp\jrl-v23-clean` @ `1e9342b`，package.json 全程未变故 node_modules 有效）；所有 E2E 以 `CI=1` 强制全新 `vite preview` 且**确认 4173/5173 端口空闲 + 页面内容指纹匹配**后执行。日志：`.audit-work/v23/final-regression.log`、`/tmp/r3-*.log`、`/tmp/r5-*`。

## 一、终态干净检出全量回归（`1e9342b`）

| # | 验证项 | 结果 |
| --- | --- | --- |
| 1 | Java 全量回归 `verify_java.sh` | ✅ **108/108**（含新增 FieldShadowDemo 行） |
| 2 | `npm run typecheck` | ✅ 通过（61 lessons / 12 exercises / 25 predictions / 14 stages） |
| 3 | `npm test`（内容/字体 1416 汉字/Vitest/12 Node 套件） | ✅ **80 pass / 0 fail，EXIT=0** |
| 4 | `npm run build` + `check:build` | ✅ 通过（4.80s；4 入口/Monaco/58 懒加载参考） |
| 5 | 内容生成幂等 | ✅ 生成后 `git status` 零漂移 |
| 6 | 默认 Playwright E2E（CI=1 全新 preview） | ✅ **69/69（4.0m）** |
| 7 | Pages smoke（全新 preview 4173 + 内容指纹核验） | ✅ **10/10（1.2m）** |
| 8 | `check_links.py` | ✅ 347 条 ALL LINKS OK（主工作区终态）/ 干净检出 325 条（不含本轮交付文档） |
| 9 | Stage05 MySQL 隔离实跑（8.0.46 容器） | ✅ **6/6 程序** + 1062/3819/事务回滚复现（当日） |
| 10 | SafeCounter 竞态修复压力实测 | ✅ **30/30**（修复前 16/30 失败） |

## 二、远端 GitHub Actions（Draft PR #11，全部以远端真实结果为准）

| 提交 | verify.yml（Java：windows-latest + macos-latest × JDK 25） | web.yml（web-core：ubuntu/windows/macos × node 24：typecheck/test/build/check:build/core E2E + web-visual） |
| --- | --- | --- |
| `2e39550`（首推） | ✅ success · 2m1s（run 42862482505） | ✅ success · 5m17s（run 42862482624） |
| `e703871`（审查修复） | ✅ success · 2m39s（run 42867935764） | ✅ success · 6m5s（run 42867935849） |
| `1e9342b`（终态） | ✅ success · 1m58s（run 42871671727） | ✅ success（run 42871671578，e2e/visual 断言见 Actions 页） |

CI 覆盖矩阵：Windows + macOS + Ubuntu 三系统、JDK 25 × 3、node 24 × 3、Chromium E2E（core 21 用例）×3、六视口双主题视觉审计 ×1。**无生产部署**（pages.yml 仅 main 触发且带 ref 门禁，本轮零部署）。

## 三、本轮回归体系抓到的真实问题（证明门禁有效）

1. R1 首轮 npm test：gitStep 命令格式门禁、S05B2 参考登记缺失 → 修复。
2. 独立审查 30 次压力实测：SafeCounter 未同步集合竞态（npm test 无法覆盖——骨架测试不跑 Answer）→ 修复 + 压力门禁补位。
3. 终态 E2E：**v14-topics.spec 24 处硬编码 `127.0.0.1:4173`** ——这些用例只有当 4173 恰好有服务时才能通过（V2.2 的"69/69"存在此假象成分），本轮改为 baseURL 相对路由后真实通过；search 探针"合并规则"因 R2 正文扩写失去独有性 → 改 `IndexedDB`（catalog 零命中、文档正文 9 次命中）并对齐直达断言。

## 四、E2E 稳定性结论

基线首跑 16 失败与终态首跑 17 失败的**同一签名根因已查明并修复**（4173 硬编码 + 探针词漂移），非时序抖动；修复后干净检出 69/69 且逐项可复现。
