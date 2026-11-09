# 08 · Stage05 及以后课程路线规划审计（V2.1）

> 依据：`public-roadmap.md` 14 Stage 基线 + `web/content/stages.json` 现状 + 第一轮架构设计（02_curriculum_architecture）。原则：**避免知识体系过度扩张**——不是所有计算机知识都进主线；每个 Stage 只回答"学习者此刻最缺什么能力"。

## 现状盘点

| Stage | 主题 | 状态 | V2.1 动作 |
|---|---|---|---|
| 01-03 | Java 基础/OOP/核心 | published（51 课） | 第一轮完成 |
| **04** | **Java 进阶（并发）+ CS 并行层** | **published（首批 4 课）** | **本轮建设** |
| 05 | MySQL + 项目 A 数据设计 | planned | 本文档规划 |
| 06 | Maven/HTTP-REST/Spring-Boot/MyBatis/分层 | planned | 本文档规划 |
| 07 | Redis 与后端加固 | planned | 本文档规划 |
| 08 | 持续工程线 | planned（有入门 README） | 与 04-07 穿插，不建独立课程位 |
| 09 | 项目 A 工程加固 | planned | 依赖 06 |
| 10-12 | Python/LLM/RAG | planned（材料在库） | 第二技术栈，与主线解耦 |
| 13 | Agent 原理与工程 | planned | 依赖 11/12 |
| 14 | 项目 B（Java 智能知识库） | planned | 总集成 |

## Stage05-09 依赖链（主线核心）

```text
S04 并发基础 ──┐
              ├──> S05 MySQL(数据建模/事务/索引) ──> S06 Spring Boot REST(项目A上线) ──> S07 Redis(缓存/会话) ──> S09 工程加固
S03 核心 API ──┘                                    （S08 Git/构建/测试随 06 穿插）
```

每阶段能力目标与首批课程建议（**规划，不虚报为已建**）：

### Stage05 · MySQL + 数据设计（承接 s03 的 Repository 演进）
- 能力目标：把 s03 的 FileStudentRepository 换成真数据库；能建模、写迁移、看 EXPLAIN、理解事务边界。
- 首批课程建议：`s05-sql-foundation`（DDL/DML/约束）、`s05-schema-design`（范式与反范式、项目 A 建模）、`s05-transactions`（ACID/隔离级别/锁现象）、`s05-indexing-explain`（B+树、覆盖索引、EXPLAIN 读法）。
- 先修关系：s03-repository-evolution 是天然引子（接口不变、实现换库——深化课 06 已埋好）。
- 实践项目：项目 A 学生库表结构 + 迁移脚本 + 三条代表性 SQL 的事务/索引实验。
- 参考资料：MySQL 官方文档 + 《高性能 MySQL》第 4-6 章（按需，不整本）。

### Stage06 · Spring Boot 与分层（项目 A 可运行闭环）
- 能力目标：Maven 依赖管理、REST 控制器、Service/Repository 分层、校验/异常/日志/事务落到 HTTP 请求。
- 首批：`s06-maven-basics`、`s06-spring-di`（呼应 s02-entity-service 的手写分层）、`s06-rest-crud`、`s06-exception-validation`。
- 与前面衔接：s04 线程池 → Tomcat 线程池配置；s02 封装/职责 → Controller-Service-Entity 边界。
- 项目迁移位：项目 A 从控制台变成 REST 服务。

### Stage07 · Redis（缓存/会话/一致性）
- 首批：`s07-redis-datatypes`、`s07-cache-aside`（穿透/击穿/雪崩）、`s07-session-consistency`。
- 先修：s06 的数据访问路径；s04 并发（缓存一致性本质是并发问题）。

### Stage08/09 · 工程线
- 08 保持「随主线穿插的归档点」定位（现有 README 已达标）；09 依赖 06 产出物做测试/部署/观测加固。
- 建议：不新增独立课程，把 Docker/CI 落到项目 A 的交付证据里。

## 第二技术栈（10-14）

- 10-12 材料已在库（python_basics 六件套达标；11/12 需按第一轮审计补练习层）。
- 13 Agent 与 14 项目 B 依赖 11/12；不与 Java 主线抢课程位。
- 明确不做：把 Linux/编译原理/分布式理论全铺成主线课程——它们由三大 CS 专题与 08 工程线按需承接。

## 优先级与判断

1. **下一批 = Stage05 MySQL**（项目 A 的数据层是 06/07/09 的前置，阻塞链最长）。
2. Stage04 第二批（原子类/并发容器/Callable-Future/wait-notify）可在 05 之前或并行补——s04-thread-pool 的「教学路标」注释已预告。
3. 三大 CS 专题深化（07_special_topics_audit 的优先前 5）与主线并行，不阻塞。

## 与 Java 后端能力的关系映射

| 能力 | 课程来源 |
|---|---|
| Java 语言/内存模型 | S01-04 |
| 数据结构与算法 | Hello 算法专题 + S03 集合 |
| 计算机系统基础 | CS:APP/OSTEP 专题（building→按方案转正） |
| 数据库 | S05 |
| Web 后端/Spring 生态 | S06/S07 |
| 工程化 | S08 穿插线 + Git 专题（V2.1 已扩写） |
| AI 应用 | S10-14 |
