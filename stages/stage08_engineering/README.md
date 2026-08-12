# Stage 08：软件工程能力

状态：**只有入门示例，尚未学习**　优先级：**P0**

## 为什么要学

能写业务代码不等于能交付软件。求职需要证明你会版本控制、环境管理、测试、日志、调试、容器化和基本部署；这些能力同时服务 Java 后端与 Python AI 服务。

## 前置知识

- 至少完成 Java Stage 03。
- 进入本阶段时，应同步推进 MySQL 与 Spring Boot，而不是先把工具全部学完。

## 必须掌握（P0）

- Git：status/add/commit/branch/merge、冲突处理、清晰提交。
- PowerShell/Linux：路径、文件、进程、端口、日志和权限基础。
- Java Maven 与 Python `venv`/pip/requirements 的依赖管理。
- 单元测试、接口测试、日志、断点调试、排错路径。
- Docker、Docker Compose、环境变量、基本部署与接口文档。
- 代码规范、README、最小可复现问题。

## 了解即可（P1）

- CI 基础、反向代理、云服务器安全组、性能分析入门。

## 暂时不用深入（P2）

- Kubernetes、复杂微服务平台、Service Mesh、大规模 DevOps 平台。

## 现有内容怎么用

`examples/command_line_git_python_env/` 保留了 PowerShell、Git、虚拟环境、requirements 和 Python 项目结构的早期生成示例。它们只适合入门参考，不代表已完成工程实践。

## 教学与练习

1. 教程：读懂 Git 工作区/暂存区/提交历史和两种依赖管理方式。
2. 示例：运行现有命令行与环境示例。
3. TODO：为本仓库初始化 Git（由你决定何时执行）、建立一次有意义的提交。
4. TODO：为后续 Java 项目补 Maven 测试；为 Python 示例补 `pytest`。
5. TODO：把 Java 后端与 Python AI 服务写入 Docker Compose（到 Stage 14 再做）。
6. Review：从一次真实报错出发写排错记录，而不是抄命令清单。

## 面试重点

- Git merge/rebase 的适用场景。
- Maven 生命周期和依赖作用域。
- 容器与虚拟机的区别；镜像与容器的区别。
- 日志级别、单元测试与集成测试、如何定位端口占用。

## 完成标准

- [ ] 能用 Git 独立完成分支开发和冲突处理。
- [ ] Java/Python 项目均可用一条命令安装依赖和运行测试。
- [ ] 能从日志定位一次真实问题并记录复盘。
- [ ] 能用 Docker Compose 启动一个数据库和一个应用（在后端项目阶段验收）。

完整阶段顺序见根目录 [统一学习路线.md](../../统一学习路线.md)。
