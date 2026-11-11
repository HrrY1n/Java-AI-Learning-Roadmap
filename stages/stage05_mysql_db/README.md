# Stage 05 · MySQL 与项目数据设计

本阶段定位：让学习者从 Java 集合与易脆的 CSV 文件持久化，正式过渡到真实的关系型数据库（目标版本：**MySQL 8.0+ / InnoDB**）。

**先修路线说明**：进入本阶段只需掌握 Stage 01–03（集合、异常、接口、`try-with-resources`、CSV 文件版 Repository）——**不需要先学完 Stage 04 并发全部课程再看数据库**。事务隔离级别里的行锁/MVCC 概念已自包含在本阶段第 3 课中；并发高并发调优会在 Stage 06/07 与本阶段汇合。

## 课程导航（按学习顺序）

| 课 | 主题 | 解决的真实问题 | 衔接来源 |
| --- | --- | --- | --- |
| 01 | [SQL 基础、数据类型与约束](existing_course/day01_sql_constraints/) | 为什么不能一直用 CSV？让脏数据进不了库 | `s03-file-read` / CSV 坏行 |
| 02 | [关系模型、外键与多表连接](existing_course/day02_relational_modeling/) | 避免单表冗余更新异常，避开 LEFT JOIN 退化陷阱 | — |
| 03 | [事务、ACID 与隔离级别](existing_course/day03_transactions_acid/) | 多步写库如何同成同败，MVCC 快照读如何工作 | `s03-exception` / 回滚语义 |
| 04 | [索引、B+ 树原理与 EXPLAIN](existing_course/day04_indexes_explain/) | 为什么加索引能提速，哪些写法会让索引失效 | 算法专题树查找模型 |
| 05 | [JDBC 数据访问与防注入](existing_course/day05_jdbc_repository/) | Java 如何连 MySQL、PreparedStatement 参数绑定如何让数据不再变成语法结构（及其边界） | `s03-repository-evolution` |

## 连续演进项目：学生管理系统（阶段 1 → 6）

> 与 Stage 03 的关系：`StudentRepository`/`Student` 契约在此做了升级（3→6 方法、3→5 字段），阶段 1–2 是用升级后模型的重演而非复用旧代码——详见 day05 课正文的"契约升级说明"。

入口源码：[StudentEvolutionDemo.java](existing_course/src/main/java/com/javaroadmap/stage05/student/StudentEvolutionDemo.java)

沿用同一份 `StudentRepository` 接口，完整走过六个阶段：
1. 内存版 `InMemoryStudentRepository`
2. CSV 文件版 `FileStudentRepository`
3. 规范化 MySQL 表设计（`sql/04_student_system.sql`，含唯一学号与成绩范围约束）
4. MySQL JDBC 实现 `JdbcStudentRepository`
5. 完整增删改查（显式区分插入与更新，防止 `ON DUPLICATE KEY UPDATE` 误修改别人记录）
6. 数据库唯一约束转化、事务原子批处理回滚与外置配置（`DbEnv`，零硬编码密码）

## 运行与验证方式（Windows / macOS 通用）

1. 准备测试库：建议使用隔离的本地 Docker MySQL 8.0 容器（例如端口 `3307`，库 `javaroadmap_lab_test`），**不要动本机已有业务库**。资源提示：MySQL 容器常驻约占 400–600 MB 内存，8 GB 内存设备跑 Docker Desktop + IDE 会比较吃紧——不用容器时可以先只做纯 `javac` 编译与 String 模拟（`stage05-compile` 测试不依赖数据库），把容器实验集中安排，用完 `docker stop` 释放。
2. 准备驱动：从 Maven Central 获取官方 `mysql-connector-j-8.4.0.jar` 放在本地（通过 `JRL_MYSQL_JAR` 指定，不要提交到 Git）。
3. 配置凭据：复制 [db.local.properties.example](db.local.properties.example) 为 `db.local.properties`（已忽略），或设置环境变量 `JRL_MYSQL_URL`、`JRL_MYSQL_USER`、`JRL_MYSQL_PASSWORD`。
4. 一键可重复验证（编译全部 5 课 + 演进项目并连库实测）：
   - macOS / Linux / Git Bash：`bash stages/stage05_mysql_db/scripts/verify_mysql.sh`
   - Windows PowerShell：`powershell -ExecutionPolicy Bypass -File stages\stage05_mysql_db\scripts\verify_mysql.ps1`
   - 清理演示表：`mysql ... javaroadmap_lab_test < stages/stage05_mysql_db/sql/00_cleanup.sql`
