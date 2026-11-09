# 01 · Bundle 优化报告（V2.1-P1）

## 前提核验

任务书假设「相关优化已在独立分支完成」。实测 `git branch -a`：仓库只有 `codex/deep-overhaul`、`codex/v19-visual-design-lab`（视觉实验，已并入 main）、`main`。**不存在 bundle 优化分支**——第一轮 08 报告的表述是「建议独立重构分支完成」。本轮直接在 v2.1 分支实施。

## 方案：元数据/正文分离 + KaTeX 按需加载

数据测量（`src/generated/catalog.json` 750KB 的构成）：

| 块 | 体积 | 占比 | 处置 |
|---|---:|---:|---|
| topics 正文(markdown+code) | 296KB | 39.5% | 拆到懒加载 chunk |
| lessons（主线课） | 249KB | 33.2% | **保留主包**（核心阅读路径，避免首选动作异步化） |
| documents 正文 | 137KB | 18.3% | 拆到懒加载 chunk |
| 其余元数据 | ~68KB | 9% | 保留 |

实施（提交 8d3b542）：

1. `generate-content.mjs` 写出 `content-bodies.json`（专题课 markdown/code + 54 篇文档正文）；catalog.json 仅保留元数据。**内存中 buildCatalog 结构不变**——node 门禁（源码同步、语义、稳定 ID）全部以完整结构为准，只影响前端载体。
2. `src/content-bodies.ts`：动态 import + 模块级缓存；三个消费方改造——TopicLessonReader（骨架→填充）、新组件 LazyDocumentBody（文档页，保留 onReference 主动解锁链路）、SearchDialog（打开后异步补正文命中，标题命中即时）。
3. KaTeX：`Markdown.tsx` 检测数学定界符（`$...$`、`$$`、`\[`、`\(`）才动态加载 rehype-katex+CSS；加载前渲染占位（不闪原始 TeX）。

## 前后对比（vite build 实测，同一机器）

| 指标 | 改动前 | 改动后 | 变化 |
|---|---:|---:|---|
| 主 JS（raw） | 1,892 KB | **1,086 KB** | **-42.6%** |
| 主 JS（gzip） | 552 KB | **307 KB** | **-44.4%** |
| content-bodies | — | 569 KB（懒） | 仅阅读/文档/搜索打开时加载 |
| rehype-katex | 打进主包 | 261 KB（懒） | 仅数学页加载 |
| Monaco/worker | 2,641+297 KB（本就懒） | 不变 | — |

## 正确性验证

- `npm run typecheck` 通过；`npm test` 全过（node 77/0 + vitest 41/41）。
- 完整 Playwright E2E 49/49（v14-topics 21 场景=专题阅读页懒加载链路、search.spec 3 场景=正文搜索）。
- `slug-heading.test.ts` 改读 bodies 文件——锚点唯一性不变量不变，仅数据源适配。
- 字体覆盖门禁自动扫描 `src/generated/*.json`（含新 bodies 文件），全部汉字在 cmap。
- 无循环依赖：content-bodies.ts 只被组件层导入，不反向依赖 catalog。

## 明确不做与原因

- **lessons 正文不拆**：课程阅读是产品第一动作，249KB（gzip 约 90KB）换取"点开即读"的确定性，值得。
- **App.tsx（2999 行）/styles.css（7431 行）拆分不做**：纯机械搬移但回归面覆盖全部页面；本轮已有页面级懒加载与 memo 化兜住最大痛点。判断：收益/风险比不划算——避免"仅为更小入口牺牲可维护性"（任务书红线），保留为独立重构分支事项。
