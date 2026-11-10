# 10 · V2.1 回归报告（最终提交态 6fc881f）

> 全部为本机实跑。环境：Windows / JDK 25.0.3 / Node 24.14.1 / Playwright chromium。

| # | 检查 | 命令 | 结果 |
|---|---|---|---|
| 1 | TypeScript | `npm run typecheck` | 通过 |
| 2 | 单元/门禁全套 | `npm test`（content 生成 + 字体覆盖 + vitest + 9 个 node 测试套件） | exit 0；node 77 pass/0 fail；vitest 41/41 |
| 3 | 预测题语义 | `node --test scripts/prediction-semantics.test.mjs` | 1/1（**23 条目**全部编译运行、stdout 与答案逐字符一致；含 A3modified 显式 modifiedCode 路径） |
| 4 | 内容架构 | `node --test scripts/content.test.mjs` | 12/12（含 stage04 计数、modifiedCode 强断言） |
| 5 | 专题门禁 | `topic-content` + `algo-java-semantics` + `git-lab` | 27/27（含源码严格一致、16 个 Git 沙箱场景） |
| 6 | Java 回归 | `bash scripts/verify_java.sh` | **103 通过 / 0 失败**（97→99→103：+Stage04 四课） |
| 7 | 练习验证 | `npm run verify:practice` | 通过 |
| 8 | 完整 E2E | `npx playwright test`（default 配置） | **49/49**（core 21 + v14-topics 16 + sidebar + stage02 + search 3） |
| 9 | 响应式/主题/可访问性 | visual.spec（含 1440/720/390、明暗、axe AA、键盘导航） | 14/14（含于上项 49） |
| 10 | 搜索 | search.spec | 3/3（标题优先/正文片段/文档直达） |
| 11 | IndexedDB 兼容 | learning-store.test.ts + core E2E 数据层场景 | 19/19 + 21 场景（结构零变更：V2.1 未触碰 learning-store.ts） |
| 12 | 生产构建 | `npm run build` | exit 0（2.3s 级） |
| 13 | Bundle 体积 | dist 实测 | 主 JS **1,121KB raw / 315KB gzip**（基线 1,892/552 → **-41%/-43%**）；懒块 content-bodies 584KB、rehype-katex 261KB、Monaco 2,641KB |
| 14 | 链接与资源 | `python scripts/check_links.py` | 319 条 ALL LINKS OK |
| 15 | 字体覆盖 | check-font-coverage | 1,367 字全部在 cmap |
| 16 | 稳定 ID 契约 | npm run content（含 registry 校验） | 通过（55 课/9 练习/22 预测/14 阶段） |

## 未跑与原因

- `npm run test:pages`（playwright.pages.config，18 个场景）：CI Pages 流程职责，本轮 default 配置已覆盖核心页面；与第一轮口径一致，如实标注。
- 三 OS 矩阵：CI 职责（verify.yml/web.yml），本轮单 Windows 完成同套件。

## 前后对照（关键项）

| 项 | 第一轮末（fb9e267） | V2.1 末（6fc881f） |
|---|---|---|
| 主线课程 | 51 | **55**（+Stage04 四课） |
| 预测题（目录内） | 20 | **22**（+S04A1/A2；semantics 条目 21→23 含 A3modified） |
| Java 回归 | 99 | **103** |
| 主 JS | 1,892KB/574KB gzip | **1,121KB/315KB** |
| Git 薄课 | 4 节 467-636 字符 | 4 节 1,580-1,933 字符（实测输出） |
| 预测架构 | replace 魔法串 | modifiedCode 显式化+强断言 |
