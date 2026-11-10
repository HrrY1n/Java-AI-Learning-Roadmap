# 05 · 工程架构与技术债审计（R3 代理审查整合）

> 来源：架构审查代理的一手实测（npm test 重跑 80/80、CI 步骤级时长、E2E 逐用例时长、死样式脚本交叉比对、调用点全量 grep）。已读 V2.3 08/12 文档做增量核实。

## 一、模块审计结论

| 模块 | 现状（实测） | 判定 |
| --- | --- | --- |
| App.tsx | 3064 行、15 个组件；页面组件均为叶子（统一 PageProps），跨组件耦合仅在 App() 内三条线（全局对话框/保存管线/路由派生）；learning-store 运行时唯一调用方 | **不拆分**。三轮缺陷证据：V2.3 三个提交 App.tsx 零改动，实际 bug 全在内容 JSON/Java 答案/E2E spec；V2.2 两次触碰均为受控局部修改。className 无类型检查 + CSS 单文件依赖声明顺序 → 拆分检索成本不降反升 |
| styles.css | 7436 行、8 个版本层；死样式核查：423 类 token 交叉比对后**零死样式**（14 个候选全部为运行时模板生成/数据休眠/关键字误报） | **不拆分**。层叠顺序即正确性，拆文件引入顺序风险 |
| build.mjs | 992 行**已模块化**（content/load.mjs 109 行、errors.mjs、build.mjs 组装+纯函数校验器、generate-content.mjs CLI）；最大函数 233 行 | **不拆分**；触发条件 >1200 行或新增第二类内容源 |
| learning-store.ts | 577 行；schemaVersion=1、BAD_KEYS、revision 乐观并发、MAX_ITEMS 500；调用点全集 = App.tsx 运行时 + 2 组件仅类型导入；19 用例测试 | **不触碰**（红线）；未来扩字段必须走"可选字段+默认值"路径（2ddf0f5 先例） |
| verify-practice 链 | 运行器 348 行 + 运行器单测 232 行 + 契约测试 122 行，无重复无越界 | **不触碰** |
| 测试覆盖地图 | 12 套 Node 测试 + Vitest 41 用例；check-build.mjs 无专属单测（自验证门禁性质，低危） | 维持 |

## 二、任务书候选技术债的逐一裁定

| 候选 | 裁定 | 依据 |
| --- | --- | --- |
| E2E CI 覆盖面 | **证实，本轮修** | web-core 只跑 core.spec（21 用例 ×3 OS）；34/69 用例零 CI；web-visual 含 visual.spec 全 14 用例（非 2） |
| 4173 残留陷阱 | **大部分已被代码化解** | vite.config `preview.strictPort: true`（残留占用即报错）；E2E 零硬编码端口（1e9342b）；CI=1 禁复用；剩余仅"本地非 CI=1 复用"纪律项 |
| App.tsx 单文件 | **推翻** | 见上表 |
| styles.css 死样式 | **推翻** | 死样式 = 0 |
| content-bodies 659KB | 证实但不构成债 | 动态 import 仅阅读/搜索时加载；gzip 217KB；阈值 raw>1MB 再评 |
| Monaco 2641KB | 已是最优 | lazy + worker 分离 + 移动降级；再裁剪违背"零动态 import 变更"政策 |
| manifest↔registry 双轨 | 证实但低成本 | 职责不同（Java 回归预期 vs 内容 ID 契约）；各自门禁缺登记显式报错；交叉检查列为观察项 |

## 三、技术债 Top-10 决策表

| # | 项 | 风险 | 成本 | 决策 |
| --- | --- | --- | --- | --- |
| 1 | 34/69 E2E 用例零 CI（v14 有整文件失败史） | 高 | S | **做**：CI 方案 B（07 文档） |
| 2 | verify_mysql 无环境前置检查（DB 未起时报错不可读） | 中 | S | **做**：只读前置检查（08 文档） |
| 3 | 本地非 CI=1 复用旧 preview | 中低 | S | 不改代码（strictPort+纪律已挡大半），07 文档重申 |
| 4 | App.tsx / styles.css 单文件 | 低 | L | 不做（证据见上） |
| 5 | content-bodies / Monaco chunk | 低 | M | 不做 |
| 6 | manifest↔registry 交叉检查 | 低 | S | 观察项 |
| 7 | check-build.mjs 无单测 | 低 | S | 不做 |
| 8 | build.mjs 临界观察 | 低 | M | 不做（触发条件已定） |
| 9 | UI 打磨 4 项（06 文档 #1–#4） | 中低 | S | **做**（R7 批次） |
| 10 | stageLinks 死数据 + 教学连接件（04 文档） | 中 | S–M | **做**（R6 批次） |
