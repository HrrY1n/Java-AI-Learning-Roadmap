# 05 · Stage 05 MySQL 课程体系设计（V2.2-P4）

> 目标版本：**MySQL 8.0+ / InnoDB**（所有行为以 MySQL 官方文档与实机运行结果为准，不使用 SQLite 或 H2 替代）。

## 一、先修架构调整（解耦并发硬前置）

原路线隐含按 `Stage 04 → Stage 05` 线性顺序推进。经审视教学依赖：
- 学习 SQL 建表、约束、多表连接、索引与基础 JDBC CRUD，真正强依赖的是 **Stage 01–03**（基本类型与溢出、封装与实体建模、集合/接口/异常/CSV 文件持久化/`try-with-resources`）。
- 并发基础（Stage 04）**不应该**机械阻断数据库实践；事务与锁机制将在 Stage 05 课程内通过双连接实验直观建立，而在 **Stage 06 Spring Boot 项目** 中再将 Stage 04 并发与 Stage 05 数据库综合运用。
- 落地证据：`web/content/stages.json`（Stage 05 `prerequisites`）、`stages/README.md`、`stages/stage04_java_advanced/README.md`、`stages/stage05_mysql_db/README.md` 以及 `s03-repository-evolution` 到 `s05-jdbc-dao` 的跨阶段 `relatedLessonIds` 互链。

## 二、首批五门核心课程设计与依赖链

```text
s05-sql-basics（SQL 与 5 类约束，解决 CSV 脆性与脏数据问题）
  └──▶ s05-relational-design（1:N / M:N 中间表、外键取舍与防退化 LEFT JOIN）
        └──▶ s05-transactions-acid（ACID、事务边界、InnoDB REPEATABLE READ 与 MVCC）
              └──▶ s05-indexes-explain（B+树、回表/覆盖索引、最左前缀与 EXPLAIN 诊断）
                    └──▶ s05-jdbc-dao（PreparedStatement 防注入、资源释放与演进 DAO 接口）
```

每门课均采用**“精简导读 + 独立 `bodyPath` 连续深入讲义（含原理/版本边界/常见陷阱/四要素验收闭环）+ 独立可编译可连真库实跑的 Java JDBC 实验 + SQL 脚本 + 实践步骤”**形态，避免为了凑七步模板制造空洞短块。

## 三、配套轻量纯 JDK 预测与隔离实践安排

- 为让网站「输出预测与修改」中心直接覆盖数据库前置安全习惯，新增纯 JDK 自包含预测题 `S05A1`（`try-with-resources` 逆序关闭）、`S05A2`（SQL 拼接 vs `LIKE '?'` 模板认知）、`S05A3`（事务前参数校验 Fail-Fast）及修改题 `S05B1`、`S05B2`（均通过 `prediction-semantics.test.mjs` 实测）。
- 需要真 MySQL 服务器的实操（3 个 SQL/JDBC 实战任务 + `ScholarshipTransferLab.java` TODO 骨架）集中于 `stages/stage05_mysql_db/practice/s05_lab_tasks.md` 与 `verify_mysql.sh`/`.ps1` 脚本，做到“**无 DB 环境可 100% 编译校验、有 DB 环境（如 Docker 隔离库）真连 MySQL 实跑且不误改业务库**”。
