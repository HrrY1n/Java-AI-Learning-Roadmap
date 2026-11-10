# 00 · V2.2 基线验证报告（2026-11-10）

## 一、V2.1 最终 Git 身份核实

| 项 | 事实 |
|---|---|
| `6fc881f` | V2.1 最后一个**代码**提交（评审修复：record-changes 场景/KaTeX 剔除围栏/契约警示/文档校准） |
| `ea1898a` | `6fc881f` 的直接子提交，**仅含 5 份交付文档**（09-13，+217 行）——`git merge-base --is-ancestor 6fc881f ea1898a` 确认祖先关系 |
| V2.1 提交数 | `fb9e267..ea1898a` = **11**（V2.1 报告写"10"是文档提交落地前的计数；两份文档口径不一致已在本轮统一为 11） |
| **V2.1 真实终态** | **`ea1898a`**（含全部代码与文档，无可疑未覆盖改动：6fc881f 与 ea1898a 的文件清单逐一核对，后者纯 docs/overhaul-v2.1） |
| main | 仍 `6c3ca91`，未动 |
| V2.2 分支 | `codex/deep-overhaul-v2.2`（自 ea1898a 创建；发现分支已存在且指向 ea1898a，未覆盖） |

工作区用户文件：`docs/javaroadmap_lab/v1.4_screenshots/`（5 张截图原件，md5 与基线一致）与 `docs/overhaul-v2.1.rar`（用户自建压缩包，27,885 字节）——保持未跟踪、未触碰。

## 二、干净检出全量回归（git worktree @ ea1898a）

| # | 检查 | 命令 | 结果 |
|---|---|---|---|
| 1 | 内容生成+契约 | `node scripts/generate-content.mjs` | ✅ 55 课/9 练习/22 预测（registry 99 IDs 含 S04） |
| 2 | 链接 | `check_links.py` | ✅ 297 条 ALL OK |
| 3 | Java 回归 | `verify_java.sh` | ✅ **103/103** |
| 4 | 单元/门禁全套 | `npm test`（npm ci --offline 安装） | ✅ node 77/0 + vitest 41/41 |
| 5 | 学习数据兼容 | `vitest run src/lib/learning-store.test.ts` | ✅ 19/19（结构零变更） |
| 6 | 生产构建 | `npm run build` + `check-build.mjs` | ✅ 2.8s / 产物完整 |
| 7 | **默认 E2E（全部 67 场景）** | `npx playwright test` | **首轮 10 failed → P0 修复后 67/67** |
| 8 | **Pages smoke（此前从未跑过）** | `playwright.pages.config.ts` 指向本地 preview 构建 | **首轮 2 failed → 修复后 10/10** |

## 三、干净检出暴露的 P0（全部本轮修复）

> 价值证明：主工作区此前"全绿"是 `reuseExistingServer: !CI` 复用 **V2.1 之前启动的旧 dev server** 的假象。以下问题在干净检出上全部必现。

### P0-A 生产构建专题课整页崩溃（V2.1 引入的真 bug）
- 现象：`Unexpected value undefined for tree, expected node`——所有专题课页（KaTeX chunk 组合）整页无 .prose；**dev 模式同样复现**（此前未发现纯粹因为旧 dev server）。
- 根因：V2.1 把 rehype-katex 改为动态 import 独立 chunk；该 chunk 与 react-markdown dep chunk 的 unified 管线组合时 `runSync(parse(file))` 的 parse 返回 undefined 树。
- 修复：KaTeX 插件与 CSS **回归静态 import**（V2.1 前形态，实测渲染 15 公式零错误）；保留 fence 剔除检测作轻优化；主包代价 +38KB gzip（最终 393KB，仍比第一轮 552KB 低 29%）。
- 提交：`9aaac20`（防御版）→ 根治版（本报告后附提交）。

### P0-B Pages smoke 课程计数陈旧（部署即红 CI）
- `smoke/pages.spec.ts` 硬编码 45 课（现 55）；改为派生 + 各 Stage 显式钉数（14/15/22/4）+ 包名断言取自课程 `packageName`。

### P0-C 默认 E2E 陈旧断言三处（干净检出必红）
- `stage02.spec`：目录 45→派生、practice tab 12/6→catalog 派生（22/13）。
- `v14-topics.spec`：未发布门禁探针词「旅行商」在 V2.1 正文搜索上线后已可命中（该词在已发布 algo-time-complexity 正文里）——探针换为全库零命中验证的「微架构分支预测器」，门禁语义未破坏。

### 修复后终态（干净检出）
默认 E2E **67/67**（含 v14-topics 16 个此前从未跑过的 preview 场景）· Pages smoke **10/10** · 其余全部通过（上表）。

## 四、V2.2 后续验证环境

- 隔离 MySQL：Docker 容器 `jrl-mysql-v22`（mysql:8.0.46，端口 3307，库 `javaroadmap_lab_test`，密码仅本地测试用）——**未触碰**本机 MySQL80 服务（端口 3306）与任何既有数据库。
- 跨 OS CI：不可用（无远端权限触发），Windows 单 OS 完成，如实标注。
