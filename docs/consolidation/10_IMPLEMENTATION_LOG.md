# 10 · 整合实施日志（R0–R9）

## R0–R5 · 审计与规划（零代码改动）

- Git 全景/ancestry/PR#11 差异核验；Docker 启动链调查（结论：仓库零引用，启动均为 AI 会话人工决策，容器仅 1 个且复用）。
- 三个只读审查代理并行（教学/工程/UI），产出 04/05/06 素材；20 模块决策矩阵（03）与批次计划（09）。

## R6 · 批次 1：教学连接件（提交 `b63eee6` 前半）

| # | 改动 | 文件 | 验证 |
| --- | --- | --- | --- |
| 1 | s05 契约升级说明（替换"同一个接口"不准确表述） | `day05_jdbc_repository/README.md` | 正文核对 |
| 2 | stage05 README"与 Stage 03 的关系"两行 | `stages/stage05_mysql_db/README.md` | 同上 |
| 3 | 演进项目类注释（契约升级 + Service 裁剪声明） | `StudentEvolutionDemo.java` | verify 6 程序（此前已过；本轮未重跑 DB——代码仅注释变更，无行为影响，由 stage05-compile 门禁兜底） |
| 4 | Stage04 两课"项目迁移"绑定学生仓库 | s04-synchronized-mutex/concurrent-tools.json | 内容校验 + npm test |
| 5 | 选做任务 4：并发学生仓库 | `s04-exercises.md` | 同上 |
| 6 | s02 catch 前向说明 + s03-lambda Stage04 指针 | entity-service README / s03-lambda.json | 同上（期间 Python 裸引号破坏 JSON 一次，当即修复并用 json.loads 复验） |
| 7 | stageLinks 数据修正（algo 5 门 +03；git 4 门 +01） | topics.json | 构建校验 + chips 渲染实测 |
| 8 | TopicView 渲染"建议学习时点"chips + CSS | TopicView.tsx + styles.css | 实测 algo-graph=["Stage 01","Stage 03"]、git-intro=["Stage 01","Stage 08"] |
| 9 | Stage01 README deep 配对说明 + Git 工具课指引；Stage02 README 同；V2.3 03 文档"一一配对"表述修正 | 3 份 md | — |

## R7 · 批次 2：UI 四修（提交 `b63eee6` 后半）

| # | 改动 | 验证 |
| --- | --- | --- |
| 1 | 首页"下一节"提议（已读当前课 → 次级入口指向 catalog 顺序下一课） | 实测标记 day03 已读后出现「下一节：循环与边界」 |
| 2 | 移动端触控目标：`.icon-button` min-width 44 + flex:none（修 flex 压缩）、≤699 theme/data 加宽、≤489 隐藏 save-status 文本 + 面包屑 font-size:0 + strong 76px | 实测 290–390px × 6 路由 **零溢出**；按钮实测 menu/theme/data 全 44×44 |
| 3 | 实验室 tab 编号 padStart（**共 3 处**，UI 代理只报了 1 处——grep 找全） | 实测 01…12 |
| 4 | 深色首帧不闪（主题写入延后到 IndexedDB `ready`；index.html 引导脚本本就存在——UI 代理的"写而不读"判断不准确，实证为 React 初始化覆盖引导值） | 实测 IndexedDB=dark 场景 reload 采样全程 dark、首帧 dark |

**过程修正（诚实记录）**：触控目标加宽在 290–360px 引发顶栏横向溢出（E2E 抓到 3 例）——三轮定位（offender 精确测量 → 裸文本节点无法用 span 选择器 → ≤374 后置规则压过 489 块），最终以"末层 489 块 + font-size:0 + 76px"收敛，全部宽度 × 6 路由零溢出。

## R8 · 批次 3：环境纪律 + CI 方案 B（同提交）

- `verify_mysql.sh`/`.ps1` 只读前置检查（TCP 探活 + 只读 `docker ps` 提示 + "永不自动启动 Docker"声明）；**DB 未运行实测**：双脚本均输出可读错误并 exit 2，零 Docker 启动。PS1 修正一处 PS 5.1 不兼容的 `??` 运算符并保持 BOM。
- `.github/workflows/web.yml` E2E 步骤 +`e2e/v14-topics.spec.ts`（方案 B，07 文档量化：+12% 墙钟、+2.1 计费分钟、覆盖唯一整文件失败史 spec）。

## R9 · 回归终态

| 项 | 结果 |
| --- | --- |
| `npm run typecheck` / 内容生成幂等 / `check:build` | ✅ |
| `npm test` | ✅ **80/80**（两次） |
| 默认 E2E（CI=1 全新 preview） | ✅ **69/69** |
| Pages smoke（全新 4173 + 指纹） | ✅ **10/10** |
| 窄屏 290–390 × 6 路由 | ✅ 零溢出 |
| stageLinks chips | ✅ 渲染实测 |

## 尚未完成 → R10+

干净检出终态回归（b63eee6）+ 独立 QA 对抗审查（11/12 文档）+ 13/14 交付。
