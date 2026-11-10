# 09 · 整合实施计划（R6–R19 批次安排）

> 依据：03 决策矩阵 + 04/05/06/07 审查结论。原则：只做有证据收益的改动；每批独立可回归；触碰 `web/src` 生产代码的改动全部有 E2E/手动走查双验证。

## 批次安排

| 批次 | 内容 | 触碰面 | 验证 |
| --- | --- | --- | --- |
| R6 批次 1 · 教学连接件 | ① s05-jdbc-dao 契约升级说明 + stage05 README 两行；② s04 两门课"项目迁移"绑定句 + s04-exercises 选做任务；③ stage05/student Service 声明；④ s02-entity-service catch 免责 + s03-lambda Stage04 指针；⑤ stageLinks 修正（algo 5 门、git 前 4 门）；⑥ TopicView 渲染"建议学习时点"；⑦ Stage01 README deep 配对导航说明 + V2.3 03 文档表述修正 | 内容 JSON/md + TopicView.tsx（新增渲染块） + topics.json | npm test + 内容幂等 + 页面走查截图 |
| R7 批次 2 · UI 四修 | ① 首页"下一节"提议；② 移动端触控目标 ≥44×44 + Ctrl K 键帽；③ 实验室 tab padStart；④ 暗色 FOUC（index.html 启动读 localStorage） | App.tsx（3 处小改）+ index.html + styles.css | 手动走查 + visual E2E + 全量 E2E |
| R8 批次 3 · 环境纪律 | ① verify_mysql.sh/.ps1 只读前置检查；② web.yml E2E 步骤 +v14-topics（方案 B）；③ 08 文档已交 | 2 个脚本 + 1 行 CI | 脚本错误分支实测（无 Docker 状态下）+ CI 推送实测 |
| R9 | 全量回归（干净检出终态）+ 独立 QA 对抗审查代理 | 只读 | 12 文档 |
| R10–R12 | 审查发现修复 + 二次回归（视 R9 结果，可能为空轮） | — | — |
| R13+ | 13 Release Notes / 14 Final Acceptance + 最终汇报 | 文档 | — |

## 明确不做清单（防止范围膨胀）

App.tsx/styles.css 拆分、chunk 裁剪、manifest 交叉检查、Stage04 第 4 门 Web 练习、Stage03/05 源码合并、12 门练习题面换域、任何 Stage06 课程开发（只留路线文档）。

## 红线（全程有效）

不合并/推送 main；不动历史分支与用户未跟踪文件；不启动 Docker Desktop（除非所有者批准）；`learning-store.ts`/registry/稳定 ID 零触碰；每次触碰 `web/src` 后必须全量 E2E。
