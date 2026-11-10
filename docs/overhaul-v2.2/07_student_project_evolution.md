# 07 · 学生管理系统六阶段连续项目演进报告（V2.2-P4）

> 核心理念：打破“每章写一个互不相干的一次性控制台玩具”的割裂感，让同一个 `Student` / `StudentRepository` 领域模型随着课程推进从 Stage 03 一路演进到 Stage 05 MySQL 持久化与事务控制（并无缝承接 Stage 06 Spring Boot / MyBatis）。

## 一、六阶段演进脉络与文件映射

所在目录：`stages/stage05_mysql_db/existing_course/src/main/java/com/javaroadmap/stage05/student/`

| 演进阶段 | 实现载体 | 解决的问题与新增工程能力 |
| --- | --- | --- |
| **第 1 阶段：内存存储** | `InMemoryStudentRepository` | 以统一接口 `StudentRepository` 为契约，内部用 `LinkedHashMap` 存储、手动校验学号唯一性、借助快照模拟批处理回滚，暴露进程重启即丢数据的局限 |
| **第 2 阶段：文件存储** | `FileStudentRepository` | 承接 Stage 03 UTF-8 CSV 持久化（本演示采用临时 CSV 文件且 `finally` 自清理，不污染工作区），实现全套 CRUD 与唯一学号校验，暴露“全量读-改-全量写”的并发与扩展瓶颈 |
| **第 3 阶段：MySQL 表设计** | `sql/04_student_system.sql` / `resetSchema()` | 设计规范化 `evo_students` 表：`PRIMARY KEY (id)`、`UNIQUE KEY uk_evo_student_no`、`CONSTRAINT chk_evo_score CHECK (0..100)`、`DEFAULT '-'`、`utf8mb4`、`updated_at` 自动维护 |
| **第 4 阶段：JDBC 数据访问** | `JdbcStudentRepository` + `DbEnv` | 实现同一个 `StudentRepository` 接口，`StudentEvolutionDemo.runCrudCycle(repo)` 调用逻辑一行不改即可切换；`DbEnv` 外置连接配置，`try-with-resources` 防连接泄漏 |
| **第 5 阶段：完整 CRUD** | `save` / `findById` / `findAll` / `updateScore` / `deleteById` | 全部采用 `PreparedStatement` 参数绑定防 SQL 注入；**真实实测纠正了 `ON DUPLICATE KEY UPDATE` 遇唯一学号冲突时会误改他人记录的隐患**，改用按主键 `id` 显式区分 `UPDATE` 与 `INSERT` |
| **第 6 阶段：约束、异常分类与事务** | `saveBatchAtomically` + `translateConstraintOrSystemError` | ① 批处理内复用 `upsertOnConnection`，保持与内存/文件版相同的同 `id` 覆盖语义；② 一旦第 2 条冲突立即 `conn.rollback()`，第 1 条也不会留在库中；③ 独立评审修复后精准区分 `SQLIntegrityConstraintViolationException`/3819（转 `IllegalArgumentException`）与连接/SQL 故障（保留为 `IllegalStateException`） |

## 二、实跑对照结论

在真实 MySQL 8.0.46 下运行 `StudentEvolutionDemo`，内存版、文件版与 JDBC 版执行完全同一段 `runCrudCycle` 代码，最终输出全部严格一致为 `[1:S001/小明/88/ming@school.example, 3:S003/小刚/62/-]`；且独立用 `mysql --default-character-set=utf8mb4` 直连表查询证实库中数据无乱码、被回滚的 `id=20` 彻底不存在。
