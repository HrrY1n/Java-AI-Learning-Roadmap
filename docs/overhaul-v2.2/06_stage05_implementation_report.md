# 06 · Stage 05 实施与隔离 MySQL 实测报告（V2.2-P4）

## 一、环境隔离与凭据安全机制

- **测试数据库隔离**：在本地 Docker 中拉起独立的 `mysql:8.0`（实测版本 **`8.0.46`**）容器 `jrl-mysql-v22`，监听独立端口 **`3307`**，默认字符集 **`utf8mb4`**、排序规则 **`utf8mb4_0900_ai_ci`**、默认隔离级别 **`REPEATABLE-READ`**，专属测试库 `javaroadmap_lab_test`——**全程未触碰本机原有 3306 端口 `MySQL80` 服务与任何既有库**。
- **凭据外置防泄漏**：每课及演进项目均通过 `DbEnv.openConnection()` 从环境变量 `JRL_MYSQL_URL` / `JRL_MYSQL_USER` / `JRL_MYSQL_PASSWORD` 或 `.gitignore` 忽略的 `db.local.properties` 读取配置，只提供占位模版 `db.local.properties.example`；`stage05-compile.test.mjs` 扫描全库源码断言绝不含写死测试密码。
- **可重复初始化与清理**：`sql/00_cleanup.sql` 幂等删除演示/测试表；每门课程的 `App.java` 与演进项目运行前均先重建自己的测试表；`mysql-connector-j-8.4.0.jar` 放置在 gitignored 的 `.audit-work/lib/` 目录（绝不将二进制 JAR 纳入 Git 仓库）。

## 二、真实 MySQL 8.0.46 实测输出证据（6 个入口全部实跑通过）

执行命令：`bash stages/stage05_mysql_db/scripts/verify_mysql.sh`（Windows PowerShell 版 `verify_mysql.ps1` 加 UTF-8 BOM 并引号化 `-D` 参数后同样实跑通过）：

1. **`day01_sql_constraints`**：
   - `UNIQUE 拦截重复学号：errorCode=1062, sqlState=23000`
   - `CHECK 拦截越界分数：errorCode=3819, sqlState=HY000`（真实证实 MySQL 8.0.16+ 强制 `CHECK`）
   - `库内记录：1 | S2026001 | 小明 | 88`
2. **`day02_relational_modeling`**：
   - `INNER JOIN` 仅返回小明两行+小红一行；`LEFT JOIN` 保留未选课的 `小刚 | (未选课) | null`；
   - `外键拦截孤儿记录：errorCode=1452, sqlState=23000`
3. **`day03_transactions_acid`**（双并发 JDBC 连接）：
   - 实验一：`tx1` 扣减后未提交，`reader` 仍读 `100`；第 2 步违背 `chk_credits_nonneg` 后 `tx1.rollback()` 完整回滚。
   - 实验二：`tx2` 提交转账 30 后，尚未提交的老事务 `readerOldTx` 凭借 InnoDB MVCC 快照读依然看到 `100`，新事务查询立刻看到 `小明=70, 小红=80`。
4. **`day04_indexes_explain`**（500 行测试表实测 `EXPLAIN`）：
   - 无索引：`type=ALL | key=null | rows=500`
   - 建联合索引 `(dept_code, score)` 后查 `dept_code='D3' AND score>=80`：**`type=range | key=idx_dept_score | rows=10 | Extra=Using index condition`**
   - 跳过最左列查 `score>=80`：退回 `type=ALL | key=null | rows=500`
   - 覆盖索引只查 `id, dept_code, score`：`type=range | key=idx_dept_score | rows=10 | Extra=Using where; Using index`（免回表）
   - 索引列套用 `LOWER(dept_code) = 'd3'`：退回 `type=ALL | key=null | rows=500`
   - （注：开发期间曾真实踩中并修复 `ANALYZE TABLE` 返回结果集不能调 `executeUpdate()` 必须用 `stmt.execute()` 的 JDBC 陷阱！）
5. **`day05_jdbc_repository`**：
   - 拼接 `' OR '1'='1` 泄露全部两行 `[alice(USER), admin(ADMIN)]`；`PreparedStatement` 参数绑定返回空列表 `[]` 彻底拦截。
6. **连续演进项目 `StudentEvolutionDemo`**：6 阶段全通，唯一学号冲突拦截、事务批处理整批回滚（`id=20` 查回 `null`）与 `utf8mb4` 中文入库实测一致。
