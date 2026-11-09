# 00 · 项目完整资产清单（2026-11-10 深度审计基线）

> 审计基线：`main@6c3ca91`，分支 `codex/deep-overhaul`。本清单由 6 个独立审计分片（Stage01 / Stage02 / Stage03 / 专题 / stages 目录 / web 工程）交叉核对生成，所有路径均经真实存在性校验（139/139 内容引用零断链）。

## 1. 产品定位

JavaRoadmap Lab：面向独立编程能力培养的 Java 后端与 AI 应用开发学习平台。本地优先（IndexedDB 存储，无账号），验证闭环为「概念阅读 → 输出预测 → 条件修改 → 独立练习 → 本地 JDK 实测 → 学习复盘」。在线地址 `https://hrry1n.github.io/Java-AI-Learning-Roadmap/`。

## 2. 课程资产（网站已发布）

| 板块 | 规模 | 来源 | 状态 |
|---|---:|---|---|
| 主线 Stage01 Java 基础 | 6 foundation + 7 deep-dive = 13 课 | `web/content/lessons/stage01/` + `stages/stage01_java_basics/` | published |
| 主线 Stage02 OOP 基础 | 8 foundation + 6 deep-dive = 14 课 | `web/content/lessons/stage02/` + `stages/stage02_java_oop/` | published |
| 主线 Stage03 Java 核心 | 16 foundation + 2 deep-dive = 18 课 | `web/content/lessons/stage03/` + `stages/stage03_java_core/` | published |
| 专题：数据结构与算法 | 29 课 | `web/content/topics.json`（自包含）+ `stages/topics/algorithms/` | published |
| 专题：Git 工程实践 | 19 课 | `web/content/topics.json`（自包含）+ git-lab 沙箱测试 | published |
| 专题：CS:APP / OSTEP / 计算机网络 | 14 + 17 + 12 课 | `web/content/topic-lessons/` + `stages/topics/*/lessons/` | building（专题级） |
| 仓库只读文档 | 48 篇 | `web/content/documents.json` | published |
| 教材索引 | 6 本 | `web/content/books_index.json` + `on_java_mapping.json` | published |
| 预测题 | stage01（A1-A8/B1-B4）+ stage02（S02 系列，2 道 draft） | `web/content/predictions/` | published/draft |
| 结构化练习 | stage01×4、stage02×1 | `web/content/exercises/` | published |
| **Stage03 预测题/练习** | **0 接入（仓库素材已备而未上站）** | `stages/stage03_java_core/practice/` | **缺口** |

## 3. 教学内容资产（stages/）

| 目录 | 内容 | 课程化程度 | 分级 |
|---|---|---|---|
| `stages/stage01_java_basics/` | existing_course（day01-06+src+answers）、deep_dives×7、practice、my_practices、mini_project | 完整课程 | A |
| `stages/stage02_java_oop/` | existing_course（day01-06、src 三大示例、mini_projects）、deep_dives×6、practice | 完整课程 | A |
| `stages/stage03_java_core/` | existing_course（legacy_fundamentals 三组 + src）、deep_dives×6（仅 2 篇上站）、advanced×8、practice | 完整课程，4 篇深化未上站 | A- |
| `stages/stage08_engineering/` | README（P0/P1/P2/证据期望）+ 5 个占位级 main.py 示例 | 导航文档 | B |
| `stages/stage10_python_for_ai/` | python_basics day01-07 六件套 + examples 两周 | 未上站中最完整 | A |
| `stages/stage11_llm_apps/` | mock_llm_prompt 6 天完整示例 + mock/real LLM 接口 | 示例堆，无练习层 | B |
| `stages/stage12_rag/` | minimal_rag/vector_retrieval/streamlit/evaluation 4 组 + career_materials | 示例较全；career_materials 为高风险遗留 | B |
| `stages/topics/` | csapp 14+5、network 12+2、ostep 16+6（正文全部上站）；algorithms 29 个 App.java（无讲义） | 三书课程化良好 | A- |
| `stages/**/my_practices/` | 学习者私有练习区（仅约定 README） | 与回归解耦 | 正常空区 |

## 4. Web 工程

| 模块 | 文件 | 规模 | 评价 |
|---|---|---|---|
| 页面壳层 | `web/src/App.tsx` | 2999 行 | 9 类页面 + 4 对话框单文件；双巨石之一 |
| 样式 | `web/src/styles.css` | 7431 行 | 手写语义 CSS；Tailwind 仅作 preflight |
| 学习状态层 | `web/src/lib/learning-store.ts` | 577 行 | 教科书级本地优先数据层；**无 schema 迁移机制（唯一 P0）** |
| 专题视图 | `web/src/components/TopicView.tsx` | 775 行 | 三态路由 |
| 侧边导航 | `web/src/components/SidebarNavigation.tsx` | 549 行 | 展开态由路由派生 |
| 可视化 | `web/src/components/TopicVisualizer.tsx` | 469 行 | 算法/Git 交互图解 |
| 搜索 | `web/src/components/SearchDialog.tsx` | 311 行 | 仅标题匹配；不搜正文/文档（P1） |
| 渲染 | `web/src/components/Markdown.tsx` 等 | ~1000 行合计 | ReactMarkdown 无 memo（P1） |
| 生成目录 | `web/src/generated/catalog.json` | 1.08MB | 静态导入进主包；dist 主 JS 1.80MB（P1） |
| 内容管线 | `web/scripts/content/` + 各脚本 | ~5300 行 | build.mjs 985 行为唯一目录组装实现；稳定 ID 契约完整 |
| E2E | `web/e2e/` 5 spec | 2060 行 | core.spec.ts 21 场景为全仓最有价值资产之一 |
| CI | `.github/workflows/` 3 个 | — | web.yml 三 OS 矩阵 / verify.yml Java 回归 / pages.yml 部署+冒烟 |

## 5. 仓库级验证设施

| 设施 | 位置 | 覆盖 |
|---|---|---|
| Java 回归 | `scripts/verify_manifest.tsv`（97 项）+ `verify_java.sh/.ps1` | stage01×18、stage02×22、stage03×28、topics×29，UTF-8 编译+输出断言 |
| 链接检查 | `scripts/check_links.py` | 306 条链接 |
| 练习验证 | `web/scripts/verify-practice.mjs` | 真实 JDK 执行练习用例 |
| 内容门禁 | `content-architecture.test.mjs` 等 8 个 node 测试 | 稳定 ID 契约、未发布内容门禁、源码一致性、字体覆盖、预测语义、Git/算法语义沙箱 |
| 基线状态（2026-11-10） | 链接 306 OK · vitest 全过 · Java 97/97 PASS · build 2.5s OK · verify:practice OK | **全绿** |

## 6. 私有资产（不随公开仓库发布，本次审计只读不碰）

`学习执行计划.md`、`求职能力矩阵.md`、`真实学习进度.md`、`统一学习路线.md`（gitignore）；`stages/**/my_practices/`；未跟踪目录 `docs/javaroadmap_lab/v1.4_screenshots/`（用户截图原件，保持未跟踪）；`.audit-work/`（gitignored 工作区）。

## 7. 历史与品牌

- 线上版本 = `main@6c3ca91`（Logo Kit 上站）；`codex/v19-visual-design-lab@943f6cc` 由分支引用持有。
- 品牌 SVG 在仓库内（无外部矢量源依赖）。
