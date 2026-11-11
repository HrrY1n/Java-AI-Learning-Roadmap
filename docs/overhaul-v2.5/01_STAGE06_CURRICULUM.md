# 01 · Stage06 课程结构（定稿）

> 课程设计依据：docs/consolidation/04 第三节路线 + 任务书第四节；先修核对（Stage05 契约/Stage03 接口/课 1 前的 JDK 21+）。

## 1. 七门课与承载工程

| # | 稳定 ID | 课程 | 工程 | 验证 |
| --- | --- | --- | --- | --- |
| 1 | s06-maven-basics | Maven 工程基础 | maven-lab | mvnw compile/test/package 实跑 |
| 2 | s06-junit-testing | JUnit 自动化测试 | maven-lab | 12 条 JUnit（12/12） |
| 3 | s06-http-server-basics | 原生 Java HTTP 服务 | maven-lab | selftest 三状态码（200/200/404） |
| 4 | s06-spring-boot-start | Spring Boot 入门 | student-api | @SpringBootTest 启动 + 上下文 |
| 5 | s06-rest-crud | REST API 实战 | student-api | 7 条 HTTP 契约测试 |
| 6 | s06-validation-errors | 参数校验与异常处理 | student-api | 400/409/404 契约断言 |
| 7 | s06-mybatis-mapper | MyBatis 数据访问 | mybatis-lab | 3 条绑定验证（真库=阻断） |

两工程演进关系：maven-lab（课 1-3，纯 JDK+JUnit）是"演练场"；student-api（课 4-7）是主演进项目——同一契约（Stage05 升级版 6 方法/5 字段）在两个工程中"重演"，课程正文已声明关系（课 1/课 2 javadoc 与 README）。

## 2. 任务书第四节要求 → 课程落点核对

| 任务书要求 | 落点 |
| --- | --- |
| Maven：坐标/生命周期/本地与远端仓库/依赖冲突/排查 | 课 1 §2-§7 + 任务 1/8（dependency:tree + exclusions 实操） |
| 实际创建可运行 Maven 工程，不只展示 XML | 课 1 独立练习（java -jar 运行成功）+ 任务 1 从零建工程 |
| JUnit：结构/断言/生命周期/替身/异常/边界/通过≠正确 | 课 2 §2-§6（12 测试覆盖三类路径；§6 明确"通过≠正确"） |
| 已有 StudentRepository 接入真实测试 | 课 2 被测对象 = Stage05 契约副本（12/12 通过） |
| 原生 HTTP：请求响应/URL/Method/状态码/头体/JSON/分发/错误处理 | 课 3 §2-§5（全部在 StudentHttpServer 手写一遍） |
| 理解框架封装了什么，不建复杂框架 | 课 3 §1 定位声明 + 课 4 对照表（手写→注解） |
| Spring Boot：IoC/DI/Bean/上下文/自动配置/分层/构造器注入/启动流程/配置环境 | 课 4 §2-§5（每项落到 student-api 真实代码行） |
| 避免注解背诵与复制 | 课 4 §7 修改条件（字段注入实验）+ 课 2 的构造器注入可测试性论证 |
| REST：CRUD/验证/状态码/统一错误/DTO-Controller-Service-Repository 分层及原因 | 课 5 全篇（分层论证 §2，状态码表 §1） |
| 校验：参数/Bean Validation/全局异常/业务 vs 系统异常/约束异常/错误响应设计/真实案例 | 课 6 全篇（异常映射表 §3、真实 curl 案例 §5、吞根因实验 §6） |
| MyBatis：Mapper/绑定/映射/事务/与 JDBC 关系/排查/不隐藏底层 | 课 7 全篇（JDBC 对照 §2、事务归属 §3、三板斧 §6、${} 注入红线） |
| MySQL 不可用时不伪称集成测试通过 | 课 7 顶部声明 + 07_DATABASE_INTEGRATION.md 阻断记录 |

## 3. 刻意不做（避免薄弱半成品与机械配置）

- Stage06 不配 Web 预测题/判题练习：Maven/JUnit/Spring 任务无法落入"纯 JDK stdout 比对"判题器，强行配置会失真；改用 practice/ 工程任务模式（8 任务 + 完成条件 + 先红后绿纪律 + answers 可复现）。
- 不做"7 门课均匀分布"：Maven/JUnit/Spring/REST 四环为核心闭环（全部真实构建+测试），MyBatis 为可编译+绑定验证模块（真库阻断如实记录），验收口径与任务书第十二节一致。
- 不引入 Spring Security/JPA/Lombok/Docker（consolidation/04 的"不引入"清单）。
