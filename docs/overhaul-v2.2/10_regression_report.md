# 10 · V2.2 最终回归测试报告（提交态 `fca64d2`）

> 以下全部结果均在独立干净检出 worktree `/tmp/jrl-v22-clean`（`HEAD = fca64d2`，不含未提交残留，离线全新 `npm ci` 构建并新启 `vite preview` 服务器，绝无旧进程复用假象）与隔离 MySQL 8.0.46 Docker 容器上实跑取得。

## 一、全量工程与内容测试汇总

| # | 验证项 | 运行环境与命令 | 结果 | 关键证据 |
| --- | --- | --- | --- | --- |
| 1 | 干净依赖与 TS 类型 | `npm ci --offline && npm run typecheck` | ✅ 通过 | `Content: 61 lessons, 12 exercises, 25 predictions, 14 stages.` |
| 2 | 单元与语义门禁全套 | `npm test`（含内容构建、字体覆盖、Vitest 与 11 个 Node 套件） | ✅ 通过 | Vitest **5 文件 / 41 passed**；Node **80 pass / 0 fail**（含 `diagnostic-semantics`、`stage05-compile`、`prediction-semantics` 26 条目、`topic-content`、`algo-java-semantics`、`git-lab` 16 场景） |
| 3 | 字体子集覆盖 | `check-font-coverage` | ✅ 通过 | **1,412 个**已发布汉字均存在于 `NotoSansSC-Subset.woff2` 实际 cmap 中 |
| 4 | Java 主线与专题回归 | `bash scripts/verify_java.sh` | ✅ **107 / 107** | 0 失败（含 Stage01–04 修正代码、Stage04 5 课、P6 三大专题升级实验） |
| 5 | Stage 04 练习校验 | `verifyPractice()` 实跑 3 个参考实现 | ✅ **12 / 12** | 独立评审复核 3 个答案改用模板身份经真 JDK 执行，normal/boundary/invalid 全过 |
| 6 | **Stage 05 MySQL 实测** | `bash stages/stage05_mysql_db/scripts/verify_mysql.sh` + `verify_mysql.ps1` | ✅ **6 / 6 入口全过** | 真实连接端口 3307 **MySQL 8.0.46** 容器运行 `day01..05` 与 `StudentEvolutionDemo`，已验证 `1062` / `3819` / `1452` / MVCC / `EXPLAIN` / 批处理整批回滚及 `utf8mb4` 中文入库；`00_cleanup.sql` 清理后空库 |
| 7 | 生产构建与产物检查 | `npm run build && node scripts/check-build.mjs` | ✅ 通过 | 4 个入口资源、Monaco/worker、自托管字体、57 个懒加载参考、字体许可完整 |
| 8 | Bundle 体积对比 | `dist/assets/*.js` 实测 | ✅ 优化生效 | 主 JS 较第一轮基线 **1,892 KB raw / 552 KB gzip → 1,560 KB raw / 440 KB gzip（-17.5% raw / -20.3% gzip）**——在重新保证 KaTeX 静态零崩溃、新增 10 门正式课与 9 门长正文基础上依然净减 ~112 KB gzip；专题与文档 55 篇正文继续按需懒加载于 **`content-bodies` 648 KB** chunk |
| 9 | 默认 Playwright E2E | `npx playwright test`（本地新启 preview/dev） | ✅ **69 / 69** | 4.4m（覆盖 `core` 21、`v14-topics` 16、`visual` 14、`sidebar-nav` 8、`stage02` 5、`search` 3、`v22-lessons` 2），含响应式 360–1440px、axe AA 对比度、键盘焦点与正文锚点 |
| 10 | Pages 配置 E2E | `LAB_SITE_URL=http://127.0.0.1:4173/ npx playwright test --config playwright.pages.config.ts` | ✅ **10 / 10** | 1.1m（桌面 1440×900 与手机 390×844 双工程走遍全部 61 课、预测、Monaco Worker、参考解锁、备份恢复与零页错/零横向溢出） |
| 11 | 学习数据兼容性 | `vitest run src/lib/learning-store.test.ts` + `core.spec` | ✅ **19 / 19** + E2E | `learning-store.ts` 本轮零修改，前向兼容与 IndexedDB 快照结构 100% 保持 |
| 12 | 链接检查 | `python scripts/check_links.py` | ✅ 通过 | 干净检出 325 条（含新增 V2.2 交付文档后待末轮复跑汇总数）`ALL LINKS OK` |

## 二、未执行或受限测试说明（如实披露）

- **跨操作系统 GitHub Actions Runner 实跑**：当前为本地任务且禁止自行推送远端或触发生产部署，因此未在 GitHub 云端 `macos-latest` 与 `ubuntu-latest` 上跑 CI 矩阵（`verify_java.sh` 与 `verify_mysql.sh` 的 macOS bash 兼容性通过语法纪律与 `cygpath` 条件分支保障，Windows 与 Git Bash 已本机实测）。
- **真实 GitHub Pages 线上地址冒烟**：`pages.spec.ts` 指向的线上站点仍是旧 `main@6c3ca91`，本轮通过 `LAB_SITE_URL` 指向本地隔离构建的 `vite preview` 完整跑通全部 10 个 Pages 场景。
