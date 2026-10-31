# Java 后端 + AI 应用开发学习路线

以 **Java 后端** 为主线，Python / LLM / RAG / Agent 为第二技术栈。当前从 Java 基础练习开始，逐步完成传统后端系统和 Java 智能知识库平台。

## 从哪里开始

| 你要做什么 | 入口 |
| --- | --- |
| 确认现在学什么、接下来做什么 | [学习执行计划](学习执行计划.md) |
| 继续当前 Java 基础课程与练习 | [Stage 01：Java 基础](stages/stage01_java_basics/README.md) |
| 查找全部现有课程、深化课与参考示例 | [课程目录](stages/README.md) |
| 浏览完整知识地图与两个项目的安排 | [统一学习路线](统一学习路线.md) |
| 查看自己的学习证据与能力缺口 | [真实学习进度](真实学习进度.md) · [求职能力矩阵](求职能力矩阵.md) |
| 配置环境、运行课程、排查错误 | [文档目录](docs/README.md) |
| 使用 JavaRoadmap Lab 学习工作台 | [在线打开](https://hrry1n.github.io/Java-AI-Learning-Roadmap/) · [本地使用](web/README.md) |

当前实际进度是 **Stage 01 Java 基础，学习中**。Stage 02–03 已有材料；Python / AI 按执行计划轻量保温，后续再系统推进。课程、生成示例和工作台功能的存在都不等于已经掌握。

## 目录怎么放

```text
stages/                课程、深化课、练习、个人实践和参考实现
docs/                  环境、运行、排错、教学协作与项目文档
web/                   JavaRoadmap Lab 学习工作台源码
scripts/               课程回归、输入样例与文档链接检查
统一学习路线.md         完整知识地图
学习执行计划.md         当前行动安排
真实学习进度.md         独立实现与验证证据
求职能力矩阵.md         能力缺口参考
```

`output/` 保存本地下载与导出文件，`.audit-work/` 保存本地核查资料，均不提交。`out/`、`__pycache__/`、网站构建和测试输出是工具生成物；`archive/` 为停用的旧材料。个人 IDE 配置与安装依赖各自保留。

## 课程怎么学

按 **真实场景 → 为什么需要 → 概念与心智模型 → 最小代码 → 预测并运行 → 改一个条件 → 独立练习 → 项目复用** 推进。

各 Stage 的 README 负责导航；`deep_dives/` 放概念深化课，`my_practices/` 放个人练习，`examples/` 与 `answers/` 是参考材料。练习先自己实现，再按需查看参考；具体位置以对应 Stage 的说明为准。

Java 的包路径、Sources Root 和编译命令见 [Java 课程运行说明](docs/Java课程运行说明.md)。统一验证命令与范围见 [验证脚本](scripts/README.md)。

AI 协作方式见 [教学协作细则](docs/教学协作细则.md)；工作台的设计、内容接入、数据边界和验收见 [交付文档](docs/javaroadmap_lab/README.md)。工作台记录不自动修改仓库学习状态，参考实现也不作为个人完成证据。
