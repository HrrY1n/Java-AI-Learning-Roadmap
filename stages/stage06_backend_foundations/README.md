# Stage 06 · Java 后端工程化（Student Management API）

## 范围与顺序

从 Stage 05 的"SQL 可见性 + Repository 契约"出发，把学生管理系统演进为有真实 HTTP API、
分层架构、自动化测试的后端应用。课程顺序见 `web/content/stages.json` 的 lessonOrder：

1. [Maven 工程基础](courses/01_maven_basics/README.md) — 坐标/依赖/生命周期/Wrapper
2. [JUnit 自动化测试](courses/02_junit_testing/README.md) — 契约测试/边界/异常路径
3. [原生 Java HTTP 服务](courses/03_http_server/README.md) — 拆开看框架封装了什么
4. [Spring Boot 入门](courses/04_spring_boot/README.md) — IoC/构造器注入/自动配置
5. [REST API 实战](courses/05_rest_crud/README.md) — 学生资源完整契约 + 契约测试
6. [参数校验与异常处理](courses/06_validation_errors/README.md) — 双保险 + 状态码语义表
7. [MyBatis 数据访问](courses/07_mybatis_mapper/README.md) — SQL 可见性延续（真库接入状态见根目录 07 文档）

## 工程与运行

| 工程 | 用途 | 运行 |
| --- | --- | --- |
| maven-lab/ | 课 1–3：Maven/JUnit/原生 HTTP | ./mvnw test；HTTP selftest 见课 3 |
| student-api/ | 课 4–6：Spring Boot + REST API | ./mvnw spring-boot:run；契约测试 ./mvnw test |
| mybatis-lab/ | 课 7：Mapper + 无数据库绑定验证 | ./mvnw test（真库接入见 docs/overhaul-v2.5/07） |

三个工程都自带 Maven Wrapper（自动下载官方 Maven 3.9.9），无需预装 Maven；JDK 21+ 即可。

## 独立练习

[practice/s06_tasks.md](practice/s06_tasks.md) — 8 个工程任务（建工程/写测试/修 DI/加接口/
补校验/修状态码/加事务/定位构建失败），每个含完成条件与 L1–L4 提示；参考复现材料在
[practice/answers/](practice/answers/)（先自己完整尝试再对照）。

## 证据期望

- 每个工程 `./mvnw test` 全绿是 Stage 06 的基本证据；
- student-api 的 14 条测试（其中 7 条走真实 HTTP 的契约测试）即 REST 行为的验收标准；
- 学完的标志不是"读完"，而是 8 个独立任务在你的副本里红→绿可复现。
