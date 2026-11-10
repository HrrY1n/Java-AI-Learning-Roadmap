# 公开课程路线基线

本文件是 JavaRoadmap Lab 公开构建所需的 14 Stage 结构基线，只包含课程范围与产出描述，不包含任何个人学习状态、进度证据或求职评估。学习者的私有路线与进度文档不随公开仓库发布。

## 统一 14 Stage 知识地图

| Stage | 能力范围 | 材料/学习状态快照 | 可核验产出 |
| --- | --- | --- | --- |
| [01](stages/stage01_java_basics/README.md) | Java 变量、类型、运算符、条件/循环、数组、方法、Scanner、字符串基础 | 学习中 | 独立控制台程序、数组/双指针题、边界复盘 |
| [02](stages/stage02_java_oop/README.md) | class/对象、构造器、封装、继承、多态、接口/抽象类、String/StringBuilder、对象建模 | 已有材料，未验证 | 一个独立 OOP 小系统及 Review |
| [03](stages/stage03_java_core/README.md) | List/Map/Set、泛型、异常、UTF-8 IO、Lambda/Stream、Repository/Service | 已有材料，练习未完成 | 可持久化学生管理、异常/文件边界和数据结构题 |
| [04](stages/stage04_java_advanced/README.md) | Java 进阶 + CS 并行层：线程、线程池、锁/JMM、并发工具；数据结构算法并行线；HTTP/网络/OS 复习 | 已有材料，未验证 | 随主线穿插并发实验、三大练习闭环与 JVM/网络/算法基线 |
| [05](stages/stage05_mysql_db/README.md) | MySQL + 项目 A 数据设计：SQL/约束、建模、事务/ACID、索引/EXPLAIN、JDBC 防注入 | 已有材料，未验证 | 表结构与清理脚本、JDBC 演进项目（6 阶段）、索引与事务实验 |
| 06 | Maven、HTTP/REST、Spring/Boot、MyBatis、分层、校验、异常、日志、事务、认证 | 未开始 | 项目 A 可运行 REST 业务闭环 |
| 07 | Redis 与后端加固：数据结构、TTL、Cache Aside、会话、一致性、热点/故障边界 | 未开始 | 项目 A 一个必要缓存/会话场景与验证 |
| [08](stages/stage08_engineering/README.md) | 持续工程线：Git、命令行/Linux、构建、测试、日志、Docker、部署、CI、观测 | 只有入门示例 | 随主线累积的构建/测试/排错/交付证据 |
| 09 | 项目 A 工程加固（业务从 Stage 05 开始） | 未开始 | 测试/文档/部署/观测/复盘增强 |
| [10](stages/stage10_python_for_ai/README.md) | Python 核心语法 → 工程基础 → FastAPI/数据处理/Java 联调 | 课程存在，未开始 | 可安装、可测试的 Python 工具和 AI Service |
| [11](stages/stage11_llm_apps/README.md) | messages、token/context、structured output、stream、tool、可靠性、成本与基础评测 | 仅 mock 示例 | 一条真实、可测试、可替换模型的调用层 |
| [12](stages/stage12_rag/README.md) | 解析/清洗、chunk/metadata、embedding/vector DB、retrieval/rerank、引用/拒答、更新与评测 | 生成示例存在，未学习 | 真实 RAG Pipeline、回归集、指标和失败分析 |
| 13 | Agent 原理与工程：context、loop/graph、state/checkpoint、memory、HITL、tools、MCP、guardrails、trace | 未开始 | 受控、可恢复、可评测的单 Agent workflow |
| 14 | 项目 B：Java 智能知识库平台 | 未开始 | Java 业务系统 + Python AI Service 联调、部署、评测与项目证据 |

未开始的阶段不创建空目录。进入对应阶段时，才按“场景 → 为什么 → 概念/心智模型 → 最小代码 → 观察/修改 → 独立练习 → 项目复用 → 验证证据”创建有效内容。
