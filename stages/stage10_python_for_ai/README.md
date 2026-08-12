# Stage 10：Python 基础与 AI 开发准备

状态：**课程已存在，未开始**　优先级：**P0**

## 为什么要学

Python 是本路线的第二语言，用于文档处理、模型调用、RAG、评测和 AI 服务。这个阶段**不是直接跳进 AI 框架**：先系统补 Python 基础，再进入数据/API 和 FastAPI。目标是能为 Java 业务系统提供清晰、可测试的 AI 能力，而不是再学一套独立后端路线。

目录名继续保留 `stage10_python_for_ai`，避免无必要地改动路径；阶段显示名以“Python 基础与 AI 开发准备”为准。

## 前置知识

- Java 后端主线至少完成一个可调用 REST API。
- 具备基础 Git、命令行和依赖管理能力。

## 必须掌握（P0）

- 变量、字符串、list/tuple/dict/set、分支与循环。
- 函数、模块、class、typing、异常和文件处理。
- pip、虚拟环境、requirements、环境变量。
- requests、FastAPI、JSON/CSV、NumPy/Pandas 基础。
- 基础测试、日志和项目结构。

## 了解即可（P1）

- 生成器、装饰器、上下文管理器、异步 IO。
- SQLite 作为本地演示存储。

## 暂时不用深入（P2）

- Python Web 全栈、复杂 Django 生态、数据科学全套理论。

## 现有内容怎么用

- `python_basics/`：教学模式最完整，含示例、TODO 练习、challenge、debug_task 和小项目；这是本阶段真正的起点。
- `examples/data_and_api/`：Pandas、requests 和批量文本处理的完整参考示例；其中 `practice.py` 多为已写好的变体，不算你的完成证据。
- `examples/fastapi_sqlite/`：FastAPI、SQLite 和静态 RAG API 示例；只作为参考，不能替代你自己实现接口。

## 三个子阶段

| 子阶段 | 内容 | 当前材料状态 | 产出 |
| --- | --- | --- | --- |
| 10A Python 核心基础 | 变量、字符串、容器、流程、函数、文件、异常、class、typing、module | day01–day07 已存在；tuple/set、class、typing 仍缺教学单元 | 完成 TODO、debug 和一个带类型标注的小工具 |
| 10B Python 工程基础 | pip、venv、requirements、环境变量、pytest、日志、项目结构、requests | 有零散示例，未形成完整练习闭环 | 可安装、可测试的文档/API 工具 |
| 10C AI 服务准备 | FastAPI、JSON API、NumPy/Pandas 的适用边界、Java 调用 Python | 有参考示例，尚未由你实现 | `/health`、`/ask`、测试与接口契约 |

缺失单元会在真正进入 Stage 10 时按“教程 → 示例 → TODO → 测试 → Review”补齐，不在当前 Java 基础阶段提前生成一批空目录或答案。

## 推荐学习流程

1. 先完成 10A：按 `python_basics/README.md` 完成 day01–day07 的 TODO，不修改完整示例来冒充练习。
2. 在进入相应知识点时补齐 tuple/set、class、typing、module 和测试练习，再通过 10A 验收。
3. 完成 10B：将 data/API 示例改造成一个可安装、可测试的文档批处理工具。
4. 完成 10C：自己实现 `/health` 与 `/ask`，再对照 FastAPI 示例。
5. 让 Java 后端通过 HTTP 调用最小 Python 服务，作为简历项目 B 的起点。

## 常见错误

- 把生成的 `practice.py` 当作自己写过。
- 在代码中硬编码密钥。
- 只会运行脚本，不会使用虚拟环境、测试和模块组织。
- 用 Pandas 解决所有简单循环问题，却说不清数据结构。

## 面试重点

- list/tuple、dict/set、可变/不可变对象。
- `*args`/`**kwargs`、异常传播、模块导入。
- FastAPI 请求模型、同步/异步、依赖管理。
- Python 服务与 Java 服务的接口边界。

## 完成标准

- [ ] 完成 `python_basics/` 的 TODO、challenge 和 debug_task。
- [ ] 独立写一个有 class、typing、异常和测试的小工具。
- [ ] 独立实现 FastAPI 接口并通过 Java 或 curl 调用。
- [ ] 能解释 NumPy/Pandas 何时值得使用。

下一阶段：[Stage 11：LLM 应用开发](../stage11_llm_apps/README.md)
