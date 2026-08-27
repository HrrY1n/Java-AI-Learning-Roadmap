# Java 后端 + AI 应用开发学习路线

目标是优先打牢 **Java 后端** 主线，再把 Python / LLM / RAG / Agent 发展为第二技术栈，最终完成 Java 智能知识库平台。完整知识地图不等于当前执行清单，仓库也不替你决定何时投递。

## 一分钟状态

- **CURRENT**：Stage 01 Java 基础，学习中；完成独立练习、边界输入、编译运行和复盘。
- **NEXT**：Java OOP → Java Core → MySQL → Spring Boot / MyBatis → Redis → 项目 A 后端 MVP；并发/JVM/HTTP 与算法在 Java Core 后并行补基线。
- **PARALLEL**：少量算法/面试、CS 快速复习、Git/测试/日志工程实践；Python/AI 只做轻量保温。
- **CORE REFERENCE**：Java/算法/并发/JVM、项目 A、工程实践等核心能力用于定位缺口，不是投递许可；学习、项目和求职可以并行安排。
- **LATER**：系统推进 Python 基础与 AI Service，再做真实 LLM、RAG、Agent 和项目 B。

仓库里的 Python 没有删除；Stage 10 明确从 Python 核心语法和工程基础开始，不是直接学习 AI 框架。未学习的 Stage 只保留在知识地图，不创建空目录，也不代表内容被删除。

统一学习动作是：**真实场景 → 为什么需要 → 概念与心智模型 → 最小代码 → 预测并运行 → 改一个条件 → 独立练习 → 在项目中复用**。README 负责导航，局部解释尽量靠近代码。

## Java 每日课程目录怎么读

现在的多层目录不是把一天拆成多个项目，而是让 Java 的文件路径与 `package` 对应。以 Stage 02 第一天为例：

```text
day01_class_object/                              # 当天 lesson，也是这个示例的源码根目录
└─ com/javaroadmap/stage02/day01classobject/    # package 对应的目录
   ├─ App.java                                  # 含 main 的运行入口
   └─ Student.java                              # 与 App 同包的依赖类
```

- 外层 `day01_class_object/` 表示一天的学习单元；在 IntelliJ IDEA 中，这一层是包含 `com/` 的 Sources Root，在命令行中也从这一层编译和运行。
- 内层 `com/javaroadmap/.../` 是包路径，对应文件开头的 `package com.javaroadmap...;`。包名加类名是完整类名（FQCN），例如 `com.javaroadmap.stage02.day01classobject.App`。
- 同一天相互依赖的类放在同一个 package 并一起编译；不同天使用不同 package，所以多个 lesson 都叫 `App`、`Student` 或 `Animal` 也不会冲突。
- 较完整的参考示例使用常见的 `src/main/java/com/...` 结构，此时 Sources Root 是 `src/main/java/`，规则仍然相同。

在 IntelliJ IDEA 中配置好 JDK 和正确的 Sources Root 后，直接点击 `main` 左侧绿色三角。命令行示例：

```powershell
Set-Location stages/stage02_java_oop/existing_course/day01_class_object
javac -encoding UTF-8 -d out com/javaroadmap/stage02/day01classobject/App.java com/javaroadmap/stage02/day01classobject/Student.java
java -cp out com.javaroadmap.stage02.day01classobject.App
```

`out/` 只是本地编译输出，不属于学习源码，也不会提交到仓库。

## 主要入口

- [学习执行计划](学习执行计划.md)：唯一的“现在做什么”入口，包含 CURRENT / NEXT / PARALLEL / LATER。
- [统一学习路线](统一学习路线.md)：完整知识地图、14 Stage、双项目和框架取舍。
- [真实学习进度](真实学习进度.md)：只按自己的代码、验证结果和复盘记录状态。
- [求职能力矩阵](求职能力矩阵.md)：Java 后端、AI 应用能力与 P0-J / P0-AI / P1 / P2 缺口参考。
- [参考路线审计](docs/参考路线审计.md)：指定成熟仓库中吸收与不吸收的内容。
- [`stages/`](stages/)：现有教程、练习、TODO、参考实现和阶段验收要求。

## 求职项目

- **项目 A：传统 Java 后端系统**。从 MySQL 表设计开始，逐步加入 Spring Boot/MyBatis、认证、Redis、测试、日志、接口文档、Docker 和部署；它用于把后端概念放进真实业务闭环。
- **项目 B：Java 智能知识库平台**。建议在项目 A 有稳定 MVP 后渐进实现；Java 承担业务系统，Python/FastAPI 承担 LLM、RAG、评测和受控 Agent。

当前实际进度仍是 **Stage 01 Java 基础，学习中**。参考代码、生成示例、一次运行或本轮文档修改都不等于已经掌握。
