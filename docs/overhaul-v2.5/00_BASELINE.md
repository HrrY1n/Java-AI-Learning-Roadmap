# 00 · V2.5 基线（2026-11-11）

> 分支：`codex/v2.5-backend-foundations`（自 origin/main `3aa5463` 创建）· 目标：Stage06 Java 后端工程化 + Student Management API 持续项目。

## 一、起点核验（实跑）

| 项 | 值 |
| --- | --- |
| origin/main | `3aa5463`（PR #13 合并后；与任务书一致） |
| 本地工作区 | 干净（仅 3 个受保护用户文件）；遗留分支 `codex/v24-audit-fixes` 与 main 同 tip、零独有提交（未触碰） |
| JDK | 25.0.3 LTS |
| Maven | 系统无 mvn → **采用 Maven Wrapper（提交 mvnw，自动下载官方 3.9.9）+ 本地工具链 `.audit-work/tools/apache-maven-3.9.9`（官方 Central 发行包，gitignored）**；不改用户系统 Java 配置 |
| 网络 | Maven Central HTTP 200 可达 |
| Docker | **引擎未运行**；`jrl-mysql-v22` 无法访问（上轮已知 Exited）→ **MyBatis/真库集成测试本轮记录阻断，仅做可编译与静态验证**（任务书第七节 fallback）；不启动 Docker Desktop |

## 二、Stage06 设计定稿（依据 docs/consolidation/04 第三节 + 任务书第四节）

| # | 课程 | 稳定 ID（拟） | 承载工程 |
| --- | --- | --- | --- |
| 1 | Maven 工程基础 | s06-maven-basics | `stages/stage06_backend_foundations/maven-lab/` |
| 2 | JUnit 自动化测试 | s06-junit-testing | maven-lab |
| 3 | 原生 Java HTTP 服务 | s06-http-server-basics | maven-lab（纯 JDK `com.sun.net.httpserver`） |
| 4 | Spring Boot 入门 | s06-spring-boot-start | `stages/stage06_backend_foundations/student-api/` |
| 5 | REST API 实战（学生管理） | s06-rest-crud | student-api |
| 6 | 参数校验与异常处理 | s06-validation-errors | student-api |
| 7 | MyBatis 数据访问 | s06-mybatis-mapper | student-api（可编译验证；真库集成 = 阻断记录） |

连续项目：Student Management API——契约沿 Stage05 升级版（6 方法/5 字段，V2.4 已有"契约升级说明"），内存版为零依赖初学与单测路径，MySQL/MyBatis 分层单独标记。

## 三、环境纪律

- 不启动 Docker Desktop（本轮零 Docker 操作）。
- 外部依赖仅官方来源：Maven Central / Apache CDN。
- 不修改系统级 Java/Maven 配置；全部通过 wrapper 与本地工具链。

## 四、验收锚点（任务书第十二节）

核心闭环 = 可运行 Maven 工程 + 真实 JUnit + 可讲解原生 HTTP + 可运行 Spring Boot + 完整学生 REST API + 有意义练习 + 网站课程入口 + 回归验证 + 数据库状态披露。MyBatis 允许后置完善。
