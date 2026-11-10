# 课程目录

从自己私有维护的执行计划确认当前任务，再进入对应阶段。当前实际位置是 **Stage 01 Java 基础，学习中**；本页列出已有材料，学习证据记录在自己私有维护的真实进度。

## 已有阶段

| 阶段入口 | 主要内容 | 如何使用 |
| --- | --- | --- |
| [01 Java 基础](stage01_java_basics/README.md) | 变量、条件、循环、数组、方法、控制台程序 | 当前学习入口，按课程练习和边界验收推进 |
| [02 Java 面向对象](stage02_java_oop/README.md) | 类与对象、封装、继承、多态、接口和对象建模 | Java 基础之后衔接；已有材料不等于已掌握 |
| [03 Java 核心能力](stage03_java_core/README.md) | 集合、泛型、异常、IO、Lambda、Stream 与持久化 | 在 OOP 基础上组织数据和业务职责 |
| [04 Java 进阶（并发）](stage04_java_advanced/README.md) | 线程、volatile/JMM、synchronized、线程池、并发工具 | 从 Stage 03 并发基础续接；数据库学习不强制等本阶段全部学完 |
| [05 MySQL 与数据访问](stage05_mysql_db/README.md) | SQL 约束、关系建模、ACID 事务、B+ 树与 EXPLAIN、JDBC 六阶段演进 | 掌握 Stage 01–03 即可进入（无需先学完 Stage 04 并发） |
| [CS 与工程专题](topics/) | 算法源码、CS:APP / OSTEP / 计算机网络讲义与实验 | 并行穿插，building 专题不冒充全书建成 |
| [独立学习验证集](practice/diagnostic_and_transfer.md) | 理解诊断（U1–U6）、Debug 排错（D1–D5）、迁移任务（T1–T4） | 学完 Stage 01–04 核心课后自测，先做完再主动解锁参考解析 |
| [08 持续工程能力](stage08_engineering/README.md) | Git、命令行、构建、测试、日志和交付 | 随主线穿插，不等到前七阶段全部结束才开始 |
| [10 Python 基础与 AI 准备](stage10_python_for_ai/README.md) | Python 语法、文件与数据处理、API 和 FastAPI | 当前少量保温，后续按执行计划系统推进 |
| [11 LLM 应用](stage11_llm_apps/README.md) | 消息、Prompt、上下文、结构化输出与调用可靠性 | 现有材料主要是 mock 示例，真实调用尚未完成 |
| [12 RAG](stage12_rag/README.md) | 文档处理、检索、问答与评测 | 已有生成示例，进入该阶段时再逐步独立实现 |

完整的 14 Stage、MySQL / Spring Boot / Redis、Agent 与双项目安排见自己私有维护的完整路线。尚未进入的阶段保留在路线中，进入时再创建有效教程和练习。

## 进入一个阶段后

先读该阶段 README，按其中顺序进入课程或深化课。常见目录角色如下，具体路径以阶段导航为准。

| 目录 | 用途 |
| --- | --- |
| `existing_course/` | 保留的原课程、项目与练习材料 |
| `deep_dives/` | 对应主题的概念深化与小实验 |
| `my_practices/` | 个人独立练习，不参与参考课程回归 |
| `examples/` | AI 生成或参考实现，供观察和对照 |
| `answers/` | 参考答案，独立练习后再按需查看 |

Java 课程从包含 `com/` 的源码根目录编译；包路径和命令见 [运行说明](../docs/Java课程运行说明.md)。参考程序的批量验证见 [验证脚本](../scripts/README.md)，通过回归不会改变个人学习状态。

[返回首页](../README.md)
