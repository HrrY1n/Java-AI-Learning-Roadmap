# 00 · V2.3 基线与出处核验（2026-11-11）

> 全部结论在独立干净检出 worktree（`C:\Users\Administrator\AppData\Local\Temp\jrl-v23-clean`，detach 于 `32ecf59`，全新 `npm ci --offline`）与主工作区实跑取得；日志保存在 gitignored 的 `.audit-work/v23/`。

## 一、Git 身份链核实

| 分支 | 提交 | 状态 |
| --- | --- | --- |
| `codex/deep-overhaul`（V2.0） | `fb9e267` | 完好保留 |
| `codex/deep-overhaul-v2.1` | `ea1898a` | 完好保留 |
| `codex/deep-overhaul-v2.2` | `32ecf59` | **确认为 V2.2 最终提交** |
| `main` | `6c3ca91` | 与 `origin/main` 同步，本轮零改动 |
| `codex/deep-overhaul-v2.3`（本轮） | 自 `32ecf59` 创建 | 开发分支 |

**报告-代码一致性（任务书 3.3）**：`git diff --stat fca64d2 32ecf59` 显示差异**仅为 13 份交付文档**（`docs/overhaul-v2.2/01`–`13`，366 行插入），无代码/registry/测试混入——V2.2 报告针对 `fca64d2` 的测试结论对最终提交 `32ecf59` 依然有效，不存在"报告与提交态不一致"问题。

**统计核对**（与 V2.2 交付声明逐项对账）：`registry.json` 113 个 `knownIds` ✓；`verify_manifest.tsv` 107 条数据行（113 行含 6 行注释）✓；catalog 61 lessons / 12 exercises / 25 predictions / 14 stages ✓。

**用户文件保护**：`docs/javaroadmap_lab/v1.4_screenshots/`、`docs/overhaul-v2.1.rar`、`docs/overhaul-v2.zip`（本轮新出现的未跟踪文件，一律不触碰）均保持未跟踪原样。

## 二、干净检出全量验证（提交态 `32ecf59`）

环境：Node v24.14.1 · JDK 25.0.3 (2026-04-21 LTS) · Windows 10 + Git Bash · `reuseExistingServer` 通过 `CI=1` 强制关闭，E2E 一律新启 `vite preview`（生产构建，非 dev server）。

| # | 验证项 | 结果 | 证据 |
| --- | --- | --- | --- |
| 1 | Java 全量回归 `bash scripts/verify_java.sh` | ✅ **107/107** | `baseline-clean-checkout.log` STEP1 |
| 2 | `npm run typecheck` | ✅ 通过 | 同上 STEP2（61 lessons / 12 exercises / 25 predictions / 14 stages） |
| 3 | `npm test`（内容构建 + Vitest + 11 个 Node 套件） | ✅ **80 pass / 0 fail** | 同上 STEP3（含 `verify-practice` 真 JDK 执行、process 限额、进程树清理等实跑用例） |
| 4 | `npm run build` + `check:build` | ✅ 通过（3.34s） | 同上 STEP4/5（4 入口资源、Monaco/worker、1412 汉字字体覆盖、57 懒加载参考） |
| 5 | 内容生成幂等（再跑 `generate-content.mjs` 后 `git status` 零漂移） | ✅ 通过 | 同上 STEP6 |
| 6 | 默认 E2E（CI=1，新启 preview） | ⚠️→✅ 首跑 53 过 + **16 失败**（全部 `v14-topics.spec.ts`）；**复跑 69/69（3.4m）** | `e2e-preview-full.log`（复跑 EXIT=0） |
| 7 | Pages smoke（新启 preview 4173） | ✅ **10/10**（1.1m） | `baseline-clean-checkout.log` STEP8 |
| 8 | `python scripts/check_links.py` | ✅ 325 条 ALL LINKS OK | 同上 STEP9 |

### 6.1 E2E 首跑 16 失败的诚实记录（不粉饰）

- **现象**：首跑（chain 内）`stats: expected 53 / unexpected 16`，失败集中在 `v14-topics.spec.ts` 全部 16 个用例（含主线阅读、搜索穿梭、键盘无障碍、Git 步进、路由历史、窄屏溢出）；复跑（同一 dist、同一 preview 模式）69/69 全过。
- **环境差异**：首跑与 6 个课程审计代理的 javac/java 实测（数十个 JDK 进程）并发执行，CPU 与冷文件缓存竞争剧烈；复跑时代理已收尾大半。
- **定性**：未复现的疑似资源竞争/冷启动抖动，**不是代码缺陷**；但暴露两个真实风险——① E2E 对懒加载 `content-bodies` chunk 无就绪等待时的脆弱性；② CI（web-core）只对 preview 跑 `core.spec.ts`（21 用例），**其余 5 个 spec 文件在生产 preview 下从未被任何门禁覆盖**（V2.2 的 69/69 是 dev server 结果）。这两条进入 `08_ENGINEERING_AND_PERFORMANCE.md` 工程审计议题。
- **教训落实**：本轮起所有 E2E 记录保留完整日志（不再 `tail -8` 截断）。

## 三、V2.2 成果继承确认

干净检出验证证明以下 V2.2 成果在最终提交态**真实成立**（不依赖报告自述）：61 门正式课内容可构建；Stage04 3 门并发练习参考答案经真 JDK 12 用例通过；Stage05 全 5 课 + 6 阶段演进项目原生 `javac` 编译（零写死密码）；KaTeX 静态渲染生产可用（E2E 全过）；`learning-store.ts` 零改动、IndexedDB 兼容门禁通过。

## 四、环境备忘（后续轮次使用）

- 清洁验证 worktree：`C:\Users\Administrator\AppData\Local\Temp\jrl-v23-clean`（含 node_modules，可复跑）。
- Docker Desktop 未运行（容器 `jrl-mysql-v22` 停止态）；MySQL Connector/J 缓存于 `.audit-work/lib/mysql-connector-j-8.4.0.jar`（gitignored）。
- `gh` 已认证（HrrY1n）；`verify.yml`/`web.yml` 对 `pull_request` 触发（无敏感凭据、`contents: read`），`pages.yml` 仅 `push: main` 且 job 带 `github.ref == 'refs/heads/main'` 门禁——**推开发分支 + Draft PR 不会触发任何部署**。
