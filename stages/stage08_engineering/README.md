# Stage 08：持续软件工程能力

状态：**只有入门示例，尚未通过任何工程验收**　优先级：**P0-J 基线 + P1 加固**

## 阶段定位

能写业务代码不等于能交付软件。Git、构建、测试、日志和排错从 Stage 01 就少量进入；Maven/JUnit 随 Java Core 进入；Docker、部署、CI 和可观测性随项目 A 加固。本目录保留 Stage 08 名称作为知识归档点，但它不是等到前七个 Stage 学完才一次完成的串行课程。

## 前置与节奏

- **现在即可做**：命令行、真实 Git 小提交、编译命令和错误复盘。
- **Stage 03–06**：Maven/JUnit、HTTP 调试、日志、OpenAPI、环境配置。
- **项目 A MVP 后**：Docker/Compose、部署、Nginx、GitHub Actions、指标/日志/trace。
- Python 的 venv/pip/pytest/logging 在 Stage 10 项目中再次实际验收，不用提前学完另一套工具链。

## P0-J：Internship Gate 基线

- Git：status/add/commit/branch/merge、冲突处理、小步清晰提交。
- PowerShell/Linux：路径、文件/权限、进程、端口、日志、`curl` 和基本脚本。
- Maven：pom、生命周期、依赖、测试、打包和一条可重复构建命令。
- JUnit、集成/API 测试、断点调试和从症状到根因的排错记录。
- 日志、环境变量、配置 profile、README 和 OpenAPI；不硬编码密钥/机器路径。

## P1：投递期项目加固

- Docker / Docker Compose：应用、MySQL、Redis 的可复现本地环境。
- 基本服务器部署、SSH/systemd、Nginx 与安全组边界。
- GitHub Actions 最小 CI；构建、测试和检查失败必须可见。
- 指标、日志、trace 基础和一次故障演练。

## P2：当前不深入

- Kubernetes、Service Mesh、复杂微服务发布平台和大规模 DevOps 平台。

## 现有内容怎么用

`examples/command_line_git_python_env/` 是 PowerShell、Git、虚拟环境、requirements 和 Python 目录结构的早期生成示例。它们只会打印或读取少量信息，不能证明已经完成真实分支开发、环境配置、测试或部署。

仓库已经初始化 Git 并连接远程，所以旧任务“初始化本仓库 Git”已失效。真正的练习是在一个学习任务上完成分支、小步提交、检查 diff，并能解释一次冲突或错误。

## 随主线练习

1. **当前**：为自己完成的一次学习修改记录 `git status`、diff、提交意图和验证命令。
2. **Stage 03/04**：给一个 Java 练习建立 Maven/JUnit 的最小可重复验证。
3. **Stage 06**：给项目 A 加日志、校验、统一错误、接口测试、OpenAPI 和环境 profile。
4. **Stage 07**：记录一次 MySQL/Redis/端口或配置问题的完整定位路径。
5. **投递期**：用 Compose 启动项目 A 和依赖，完成一次部署与最小 CI。

## 面试重点

- 工作区、暂存区、提交与分支；merge/rebase 的适用边界和冲突处理。
- Maven 生命周期、依赖作用域、单元/集成/API 测试的区别。
- 日志级别、结构化上下文、如何从进程/端口/日志定位问题。
- 镜像与容器、容器与虚拟机、环境变量和配置隔离。
- CI 与部署的输入、失败反馈和回滚边界。

## 分层完成标准

### Internship Gate

- [ ] 能独立完成一次分支开发、小步提交和安全合并/冲突处理。
- [ ] Java 项目可用一条命令构建并运行测试。
- [ ] 能从日志、进程和端口定位一次真实问题并写复盘。
- [ ] 项目 A 有 README、OpenAPI、环境配置和可重复启动方式。

### 项目 A 加固

- [ ] Compose 可启动应用与必要依赖，配置中没有密钥。
- [ ] 有一次部署记录、最小 CI 和基础观测/故障验证。
- [ ] Python 项目到 Stage 10 后再用 pytest/venv/logging 通过对应验收。

当前任务见根目录 [学习执行计划](../../学习执行计划.md)，完整知识地图见 [统一学习路线](../../统一学习路线.md)。
