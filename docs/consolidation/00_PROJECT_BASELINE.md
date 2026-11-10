# 00 · 整合工程基线与出处（2026-11-11）

> 本目录（`docs/consolidation/`）记录 V2.1–V2.3 三代成果的系统性整合工程。全部结论基于真实代码、Git 历史与实测，报告与实现同步提交。

## 一、Git 基线（执行时全部重新核验）

| 引用 | 提交 | 状态 |
| --- | --- | --- |
| `main` | `6c3ca91`（= `origin/main`） | 本轮零改动、零推送 |
| V2.0（`codex/deep-overhaul`） | `fb9e267` | 本地保留（其 11 个提交同样**未在 main 中**） |
| V2.1（`codex/deep-overhaul-v2.1`） | `ea1898a` | 本地保留 |
| V2.2（`codex/deep-overhaul-v2.2`） | `32ecf59` | 本地保留 |
| V2.3（`codex/deep-overhaul-v2.3`） | `135a62f` | **已推送远端**，承载 Draft PR #11 |
| `codex/v19-visual-design-lab` | `943f6cc` | 本地保留 |
| tags | 无 tag | — |
| worktrees | 主工作区 + `/tmp` 干净验证树（detach @`1e9342b`） | 用户未跟踪文件原样保留 |

**Ancestry（严格线性链）**：`merge-base(main, v2.1) = main`（V2.0+V2.1 共 21 提交全在链上）；`merge-base(v2.2, v2.3) = v2.2`（`32ecf59`）→ 三代是**逐层演进的同一产品**，不是三个独立项目；"合并三代"实为"在 V2.3 终态上继续收敛"。

**三代规模**（按演进边界切分）：

| 代际 | 提交 | 文件 | 行变更 | 主要构成 |
| --- | --- | --- | --- | --- |
| V2.0+V2.1 | 21 | 125 | +3,792/−289 | stages 43 / web-content 37 / web-src 10 / docs 26 |
| V2.2 | 13 | 159 | +5,578/−633 | stages 90 / web-content 33 / web-tests 6 / docs 14 |
| V2.3 | 7 | 89 | +1,071/−123 | stages 30 / web-content 29 / **web-src 0**（仅 R5 改 2 个 E2E spec）/ docs 27 |

**版本身份统一说明**：V2.3 的代码完成提交为 `1e9342b`，其后的 `135a62f` 为纯交付文档提交（`git diff 1e9342b..135a62f` 仅 6 份 md）；`e703871`、`2e39550` 等为中间迭代提交。本轮整合的基线 = `135a62f`；所有测试结论（Java 108/108、npm test 80/80、E2E 69/69 + Pages 10/10）在 `1e9342b` 干净检出取得，对 `135a62f` 同样成立（两者代码树一致）。

## 二、当前产品资产盘点（核验值）

- 主线课程 61 门（Stage01–05；33 门连续正文 + 28 门 7 步短卡+配对深化课）
- 已发布专题 48 门（算法 29 + Git 19）；building 专题 43 门（csapp 14 / ostep 17 / network 12，标注诚实）
- 结构化练习 12 门、预测 25 + 修改 15、诊断与迁移题集 1 套
- registry 113 稳定 ID（knownIds）+ 1 suspended；`verify_manifest.tsv` 108 条 Java 回归（V2.3 +FieldShadowDemo 后 108 项全过）
- IndexedDB `learning-store.ts`（schemaVersion 1，三轮未破坏）
- 测试：Vitest 41 用例 + 12 套 Node 测试（npm test 80/80）+ Playwright 69 默认 + 10 Pages smoke
- CI：verify.yml（Java win+mac）、web.yml（web-core 3 OS + web-visual）、pages.yml（仅 main + ref 门禁）
- Stage05 真实 MySQL 实验路径：隔离容器 + `verify_mysql.sh/.ps1`（6 程序实测通过）

## 三、Docker 环境现状调查（任务书第六节）

1. **仓库脚本零 Docker 引用**：遍历 `stages/stage05_mysql_db/scripts/`（verify_mysql.sh/.ps1）、`web/scripts/` 全部 19 个 .mjs、根 `scripts/`、`.github/`——无 `docker start/compose/run` 任何引用。`verify_mysql.sh` 只编译 Java 并以环境变量注入的 JDBC URL 连库。
2. **启动动作来源**：全部来自 AI 开发会话的人工决策——V2.2 会话创建容器 `jrl-mysql-v22`（创建时间 2026-11-10 15:30，与 V2.2 P4 Stage05 建设吻合）+ 启动 Docker Desktop；V2.3 会话再次启动 Docker Desktop 并 `docker start jrl-mysql-v22` 做终态复验。全仓库**仅此一个容器**，V2.2→V2.3 复用同一容器（无重复建设）。
3. **当前状态**：容器 Exited；Docker Desktop `autoStart: false`（不会随开机自启）。
4. **普通测试与 Docker 的关系**：npm test / Java 回归 / 构建全部**不依赖也不启动** Docker（`stage05-compile.test.mjs` 明确以"零数据库可编译"为门禁）。唯一需要数据库的是 Stage05 真库集成验证（人工触发）。
5. **本轮纪律**：整合期间除非用户明确批准，不启动 Docker Desktop；Stage05 复验按"先检查引擎/容器状态，未运行则记录条件不足继续其他工作"执行（落地见 `08_DOCKER_ENVIRONMENT_POLICY.md`）。

## 四、分支策略决策

**继续在 `codex/deep-overhaul-v2.3` 上追加整合提交，PR #11 继续承载最终整合**。理由：① 三代是同一条演进链，整合是 V2.3 的直接延续，拆新分支只会割裂评审脉络；② PR #11 已具备绿色 CI 历史与评审上下文；③ 任务书明确"不为分支整洁机械新建分支"。不合并 main、不推送 main 的红线不变。

## 五、审查代理分工与独立性

R2 教学体系、R3 工程架构、R4 UI/UX 三个只读审查代理并行执行（互相不共享中间结论），总架构师（本会话）整合结论并负责实施；R13 阶段再派独立 QA 对抗审查代理复核实施结果。全部代理禁止修改仓库文件（UI 代理仅写 gitignored 截图目录）。
