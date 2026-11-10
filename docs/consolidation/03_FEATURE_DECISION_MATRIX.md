# 03 · 功能决策矩阵（20 模块 · KEEP/MERGE/REFACTOR/REMOVE/DEFER）

> 证据来源：三个独立审查代理 + Git 考古（01/02 文档）+ 三轮历史审计报告交叉核对。每项决策附"问题证据 + 验收方法"。

| # | 模块 | V2.1 实现 | V2.2 实现 | V2.3 实现 | 问题证据 | 最终决策 | 验收方法 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 课程内容体系 | Stage01–03+04 首批 | 深度修复+Stage05 | 全量审计修复 | V2.3 审计矩阵闭环；遗留为连接件级 | **KEEP + 连接件修复**（04 文档清单） | 04 文档逐项实施后回归全绿 |
| 2 | Stage 导航 | 侧栏三区布局 | — | — | UI 审查"不迷路"判定 | **KEEP** | UI 走查复验 |
| 3 | 专题体系 | V1.4 架构 + 4 门 Git 扩写 | 3 门 building 升级 | 6 门扩写+stageLinks 修正 | **stageLinks 死数据**（校验后零渲染）+ 5 门 algo 失真 + git 前 4 门缺 '01' | **REFACTOR（小）**：修 stageLinks 数据 + UI 渲染"建议时点" | stageLinks 校验 + 页面渲染走查 |
| 4 | 课程 Registry | knownIds 门禁 | 113 IDs | 零变更 | 引用完整性脚本核对：缺失 0/僵尸 0 | **KEEP** | npm test registry 门禁 |
| 5 | 稳定 ID | 契约建立 | 只增不删 | 只增不删 | 三轮零破坏 | **KEEP** | 同上 |
| 6 | 学习进度 | fields() 前向兼容 | — | — | 机制审查：合理、单调用方、19 用例测试 | **KEEP** | learning-store.test 19/19 |
| 7 | IndexedDB | schemaVersion 1 + BAD_KEYS + revision | 零破坏 | 零破坏 | 红线核对：本轮全部改动零触碰 | **KEEP（红线）** | 兼容测试 + 备份导入导出 E2E |
| 8 | 预测题系统 | modifiedCode schema | 25+15 全量 | A8 重写+真机套件 | prediction-semantics 真机复现 25 题 | **KEEP** | npm test |
| 9 | 交互练习系统 | 12 门 | Stage04 3 门确定性契约 | 契约升级（结构不变量） | 12 用例锁定 + 防伪装验证 | **KEEP** | verify 12/12 + npm test |
| 10 | Java 执行验证 | verify-practice 纯 JDK 沙箱 | 证据 JSON+SHA-256 | — | 运行器/测试职责链清晰 | **KEEP** | verify-practice.test |
| 11 | SQL/JDBC 实践 | — | 6 阶段演进项目 | 契约升级无解释（新发现） | 演进是"重演"非"续写"且契约 3→6 方法零解释 | **REFACTOR（小）**：契约升级说明 + Stage04 绑定（04 文档） | 正文核对 + 学习走查 |
| 12 | 搜索功能 | 全文索引 | 正文命中徽章 | 探针独有词 | 双层排序合理；UI 审查通过 | **KEEP** | search.spec 3/3 |
| 13 | 路由系统 | hash 路由 | — | 4173 硬编码根治 | E2E 相对路由后 69/69 | **KEEP** | E2E |
| 14 | UI 设计系统 | V1.1–V1.9 8 层 | — | — | 死样式=0；层叠顺序即正确性；拆分风险>收益 | **KEEP（不动）** | 死样式脚本复跑 |
| 15 | 响应式布局 | 390–1440 全覆盖 | — | — | 溢出 0px；汉堡按钮 21×44px 偏小（新发现） | **KEEP + 4 项打磨**（06 文档：下一节提议/触控目标/010 编号/暗色 FOUC） | UI 走查 + visual E2E |
| 16 | PWA | 已有 | — | — | 暗色 FOUC：`jrl-theme` 写而不读（新发现） | **REFACTOR（小）**：启动读 localStorage 预设主题 | 深色刷新无闪白 |
| 17 | 自动化测试 | npm test 体系 | E2E 扩展+诊断套件 | 真机 JDK 套件 | 覆盖地图完整；check-build 无单测（低危） | **KEEP + 方案 B**（CI +v14-topics） | 全量回归 |
| 18 | CI/CD | JDK25×2 + core E2E | web-core 3OS + visual | 三提交全绿 | 34/69 用例零 CI（v14 有整文件失败史） | **REFACTOR（一行）**：web-core +v14-topics | CI 实跑时长对比 |
| 19 | 内容生成器 | load/build/generate 已模块化 | — | — | 992 行未到拆分临界（>1200 触发） | **KEEP** | 内容幂等 + npm test |
| 20 | 开发/审计脚本 | verify_manifest 双平台 | verify_mysql 双脚本 | 沙箱实验脚本 | verify_mysql 无环境前置检查 | **REFACTOR（小）**：只读前置检查（08 文档） | 无库时报错可读 |

## 明确不采纳的重构（等价于 REMOVE 提案被否决）

| 提案 | 否决证据 |
| --- | --- |
| 拆分 App.tsx（3064 行） | 三轮 App.tsx 零 bug（V2.3 三个提交零触碰）；页面组件均为叶子、耦合仅在 App() 状态枢纽；拆分后 CSS 仍是单文件，检索成本不降反升 |
| 拆分 styles.css（7436 行） | 死样式=0（423 类 token 全验）；层叠顺序即正确性，拆文件引入顺序风险 |
| 裁剪 Monaco chunk | 已是最优形态（懒加载+独立 worker+移动降级）；进一步裁剪违背 V2.1 KaTeX 崩溃后的"零动态 import 变更"政策 |
| 分片 content-bodies | 217 KB gzip 按需加载已到位；阈值未到（raw>1MB 再评） |
| 合并 Stage03/05 学生源码共享 | 违反每课独立包/纯 javac 门禁纪律 |
| manifest↔registry 交叉检查 | 各自门禁已报错兜底，收益小于改动面（列为观察项） |

## DEFER 清单（保留后续计划）

1. Stage06–08 课程建设（路线已定：04 文档 Stage06 表）。
2. 长课 TOC scroll-spy 高亮、辅导面板路由上下文刷新、首日文案分支、移动端小链接触控（UI 审查 defer 项）。
3. build.mjs 专题装配模块切分（>1200 行触发）。
4. manifest↔registry 交叉检查（观察项）。
5. JPA/Lombok/微服务/Testcontainers（Stage06 明确不引入，理由见 04）。
