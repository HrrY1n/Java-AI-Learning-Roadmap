# JavaRoadmap Lab 交付计划

目标：复用仓库权威资料，交付本地优先、可运行并经过浏览器验证的 Stage 01 学习产品。

| 阶段 | 状态 | 验收 |
| --- | --- | --- |
| 1 仓库与课程审计 | complete | 确认 Git 基线、课程、教学规则、工具能力 |
| 2 产品与设计系统 | complete | 两种方向比较、统一 tokens 与交互规范 |
| 3 工程实现 | complete | 五页面、课程、实验室、证据与备份 |
| 4 自动验证 | complete | 类型/构建、29项单元工具、31项浏览器、59项Java通过；链接与依赖检查通过 |
| 5 浏览器视觉审计 | complete | 六视口双主题72组无违规/溢出，74张真实PNG，Edge实际检查与Lighthouse测量 |
| 6 修订与交付 | complete | 修复问题并定向复测；交付文档齐备；最终构建与本地任务提交 |

范围：web/ 应用、必要内容转换与本地验证工具、docs/javaroadmap_lab/、README 入口、忽略与链接检查适配。不修改课程原文、my_practices、真实进度或能力矩阵。

## 决策

- React + TypeScript strict + Vite；浏览器 IndexedDB；静态部署。
- 没有凭据时不接付费模型或公网执行器，提供明确服务契约与课程提示。
- 当前工作区干净，无额外 worktree；使用 codex/javaroadmap-lab 分支。
- 当前全局 AGENTS.md 仅含占位符，没有实际 Git Gate 协议；不虚构审批条款。

## 错误与处理

| 问题 | 处理 |
| --- | --- |
| Oracle javapath shim 挂起 | 本次验证用进程内 JAVA_HOME 指向真实 JDK，不改机器配置 |
| Monaco 0.57 exports 路径变化 | 使用实际安装包导出路径，Java单语言懒加载 |
| 文本/注释对比度不足 | 按真实 axe 结果修主题色与编辑器 comment token |
| 对话框关闭未可靠回焦 | 记录触发器，关闭后在同一路由恢复焦点 |
| npm audit 发现旧 DOMPurify | override 至 3.4.17，生产依赖重查为0漏洞 |
| 报告替换补丁同时删除/新增同一路径被拒绝 | 改用原位更新，无数据丢失 |
| Lighthouse动态调试端口启动失败 | 单独临时QA浏览器固定本地端口，成功得到真实报告 |

最终结果：完整31项浏览器回归通过；视觉14项复测通过；最后移动软换行相关7项通过。首页mobile与实验室desktop的Lighthouse均100/100（保留IndexedDB提示）；npm全量审计0漏洞。仅文档与构建打包收尾，不增加新功能。
