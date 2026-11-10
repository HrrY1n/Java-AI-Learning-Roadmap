# 08 · 工程架构与性能审计（V2.3）

> 原则：不为重构而重构。只记录有证据的问题，只实施有明确收益的改动。

## 一、发现的工程问题（按影响排序）

### E1 · E2E 对生产 preview 的门禁覆盖缺口（P1，本轮发现）
- **事实**：`web.yml` CI 只对 preview 跑 `e2e/core.spec.ts`（21 用例）；默认 `playwright test` 的其余 5 个 spec（48 用例）在 V2.2 的"干净检出 69/69"里跑的是 **dev server**（未设 `CI=1` 时 `webServer` 用 `npm run dev` 且 `reuseExistingServer: !process.env.CI`）。生产 preview 下这 48 个用例此前从未被任何门禁覆盖。
- **本轮实证**：干净检出 + `CI=1`（强制 preview、禁复用）首跑 16 个失败（全部 v14-topics），复跑 69/69——定性为资源竞争/冷启动抖动而非代码缺陷，但暴露两点：① E2E 无懒加载 chunk 就绪等待时的脆弱性；② 门禁盲区。
- **处置**：本轮所有 E2E 记录均以 `CI=1` + 新启 preview 为准（69/69 复跑通过 + 远端 CI 双重确认）；「让 CI 覆盖全部 spec 或为本地 preview E2E 增加就绪等待」列为建议项（见 13），本轮不擅自改动 CI 触发面（用户明确偏好精简 CI，扩面需用户决策）。

### E2 · preview 端口残留进程陷阱（本轮实际踩中并固化对策）
- 4173 端口被数小时前基线验证的残留 vite preview 占用，`--strictPort` 启动失败但探活成功，学习路径走查一度打在旧构建上。**对策已执行**：杀残留进程前核对 PID 命令行；探活改为"端口 + 内容指纹"双验证。

### E3 · `reuseExistingServer: !process.env.CI`
- 本轮全部本地 E2E 以 `CI=1` 运行规避；不改默认值（开发者日常用 dev server 复用是合理体验），但所有**验证记录**必须显式 `CI=1`。已写入 CHECKPOINT 与回归报告。

## 二、结构与性能核对（有测量，不凭感觉）

| 项 | V2.2（fca64d2 报告值） | 本轮实测（853ecc7 构建） | 变化 |
| --- | --- | --- | --- |
| 主 chunk `index-*.js` | 1,560 KB raw / 440 KB gzip | 1,572 KB raw / **450 KB gzip** | +12 KB raw / +10 KB gzip |
| 正文 chunk `content-bodies-*.js` | 648 KB | 659 KB raw / 217 KB gzip | +11 KB（Git 6 门扩写 + 新契约正文） |
| 懒加载参考数 | 57 | **58**（S05B2 参考登记） | +1 |
| 字体覆盖 | 1,412 汉字 | **1,416 汉字** | +4（新增正文汉字自动纳入校验） |
| `check:build` | 通过 | 通过（4 入口、Monaco/worker、许可完整） | — |

**诚实结论**：本轮内容修复带来 ~10 KB gzip 净增（约 2.3%），**无性能优化声明**；未做任何投机性代码拆分（V2.1 的 KaTeX 动态拆分崩溃教训保留：本轮零动态 import 变更，KaTeX 静态路径经 E2E 复验）。

## 三、架构检查结论（无须重构项）

1. `App.tsx`（~3000 行）：V2.2 已评估过拆分属低风险纯重构、无用户价值；本轮继续不动，维持遗留记录。
2. catalog 元数据 / content-bodies 正文分离：工作正常（正文懒加载 217 KB gzip 按需），不动。
3. 搜索索引：构建期内联，无运行时构建开销，不动。
4. `learning-store.ts`：本轮零改动（IndexedDB/稳定 ID 兼容门禁持续通过）。
5. 内容生成幂等：干净检出验证通过（生成后 `git status` 零漂移）。
6. 依赖：无新增运行时依赖；本轮零 `package.json` 依赖变更。

## 四、CI 工作流核查（任务书第十三节）

| 工作流 | 触发 | Draft PR 影响 |
| --- | --- | --- |
| `verify.yml` | `pull_request`（任意分支）+ push main + 手动 | 触发 Java 矩阵（windows/macos × JDK 25），`contents: read`，无凭据 → 安全 |
| `web.yml` | `pull_request` + push main | 触发 web-core 三 OS 矩阵（node 24 + JDK 25：typecheck/test/build/check:build/core E2E）+ web-visual（ubuntu，PR 限定）→ 安全 |
| `pages.yml` | 仅 `push: main`（paths-ignore 文档）+ 手动 | **job 内 `github.ref == 'refs/heads/main' && github.ref_protected` 门禁** → 开发分支与 Draft PR 完全不触发部署 |

结论：推 `codex/deep-overhaul-v2.3` + Draft PR **不会**触发任何生产部署或需要敏感凭据，符合任务书放行条件（实测结果见 `12`）。
