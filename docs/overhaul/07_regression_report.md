# 07 · 测试与回归证据（2026-11-10，分支 `codex/deep-overhaul`@85e9ccd）

> 全部结果为本机实跑输出，无虚构。环境：Windows 10 (26200)、Git Bash、JDK 25.0.3、Node 24.14.1、Python 3.12。

## 基线（改动前，main@6c3ca91）

| 命令 | 结果 |
|---|---|
| `python scripts/check_links.py` | checked links: 306，ALL LINKS OK |
| `cd web && npm test` | exit 0（vitest + node 测试全过） |
| `bash scripts/verify_java.sh` | 97 通过 / 0 失败 / 共 97 项 |
| `cd web && npm run verify:practice` | exit 0 |
| `npm run build` | ✓ built in 2.50s |

## 终态全量回归（R10 修复后）

| 命令 | 结果 |
|---|---|
| `cd web && npm run typecheck` | 通过（TS strict 无错误） |
| `cd web && npm test` | exit 0；node 测试 77 pass / 0 fail；vitest 5 文件 41 tests 全过 |
| 其中 `node --test scripts/prediction-semantics.test.mjs` | 1/1 test（21 个预测条目全部编译运行、stdout 与答案逐字符一致，含 A3modified 变体） |
| 其中 `node --test scripts/content.test.mjs` | 12/12 |
| 其中 `node --test scripts/topic-content.test.mjs scripts/algo-java-semantics.test.mjs` | 21/21（含 code 字段与落盘源码严格一致门禁） |
| 其中 `node --test scripts/git-lab.test.mjs` | 全过（Git 沙箱 16 场景：合并/冲突/rebase/cherry-pick/reflog/bisect） |
| `npx playwright test e2e/core.spec.ts` | 21 passed（真实学习闭环：预测判定→草稿保存→刷新恢复→JDK 导入→指纹拒绝→双标签冲突→beforeunload） |
| `npx playwright test e2e/search.spec.ts`（新增） | 3 passed（标题命中优先 / 正文命中带上下文并跳转课程 / 仓库文档直达） |
| `npx playwright test e2e/visual.spec.ts` | 14 passed（多分辨率 1440/720/390、明暗双主题、axe AA 对比度扫描、键盘 Tab 导航、减少动态） |
| `npx playwright test`（完整 E2E 5 spec） | 49 passed / 0 failed（4.7m） |
| `bash scripts/verify_java.sh` | 99 通过 / 0 失败 / 共 99 项（+2 新课 day07_numeric_types、day07_static_visibility） |
| `python scripts/check_links.py` | 306 条，ALL LINKS OK |
| `cd web && npm run build` | ✓ built in 2.33s（typecheck + 字体覆盖门禁前置） |
| `node scripts/check-font-coverage.mjs` | 字体覆盖通过：1430 个已发布汉字均在实际 cmap 中 |
| `cd web && npm run verify:practice` | 通过（真实 JDK 执行练习用例管线） |

## 内容变更的逐点实测记录（关键项）

| 断言 | 验证方式 | 结果 |
|---|---|---|
| S02 ReferenceStateDemo 第 4 行修复后 `内容相同吗：true` | javac+java 实跑 | 与注释/README 动手 2 一致；manifest 原断言保持 |
| S01 B1 double b 五行 `13.0/7.0/30.0/3.3333333333333335/1.0` | sed 替换源码编译运行 | 与新答案逐字符一致 |
| S01 B3 return→break 后 `IllegalStateException: Scanner closed` | 改副本编译运行 | 答案措辞与实测逐字吻合 |
| ScannerGuardDemo fixture `2,10,5` | 实跑 | `商 = 2`、`程序正常结束` 不变 |
| S03 六道预测题 | 独立编译运行 + prediction-semantics 门禁 | 6/6 逐字符一致 |
| S03A6 CME 边界「ArrayList 删倒数第二个不抛」 | CmeTest 三位置实测 | 删 1/3 位抛 CME、删 2 位不抛 `[小明, 小刚]` |
| 4 个新练习参考实现 | javac + 全部 stdin 用例实跑 | 输出与 exercises JSON expected 逐字符一致（含空数组/坏行/边界 0 与 100） |
| day07 数值溢出 `int 最大值 + 1 = -2147483648` | javac+java | 7 行输出全断言进 manifest |
| s02-static-lifecycle static 计数 `0/2/仍是 2` | javac+java | 5 行输出进 manifest |
| sumConstant 溢出临界 | 评审 BigInteger+long 实跑 | n=3,037,000,500 首次绕回为负；注记已按此修正 |
| 12!/13! 溢出 | 评审实测 | 12!=479001600 不溢出；13!=6227020800 首溢（int 版绕回 1932053504）；练习已改 13! |
| 搜索正文索引 | 新增 search.spec E2E | 3/3（真实浏览器 Ctrl+K → 输入 → 命中片段 → 跳转） |
| 学习数据兼容 | learning-store.test.ts 19/19 + core E2E 21/21 | 未知字段宽容+缺失拒绝双向锁定；损坏快照/未来版本/危险键原语义不变 |

## 门禁矩阵说明

未跑的检查及原因：Playwright Pages 配置（`test:pages`，需 preview 服务器，CI 专用）与多 OS 矩阵（CI 侧职责，本次在单 OS 完成同套件）；axe 可访问性已包含于 visual.spec 的 AA 扫描。
