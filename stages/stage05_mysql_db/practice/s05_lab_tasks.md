# Stage 05 独立实践任务与 TODO 骨架

> **环境约定**：以下任务全部需要连接**独立的测试库**（如本机端口 3307 的测试容器或 `javaroadmap_lab_test` 库），绝不要指向生产库或个人其他项目数据库。凭据通过环境变量或本地忽略的 `db.local.properties` 传入，禁止写死密码。

## 任务 1：给演进项目补充“按姓名模糊搜索 + 分数区间过滤”（防注入与索引意识）

在 `my_practices/` 复制 `existing_course/src/main/java/com/javaroadmap/stage05/student/` 全部文件并修改包名后：
1. 在 `StudentRepository` 与 `JdbcStudentRepository` 增加：
   `List<Student> search(String namePrefix, int minScore, int maxScore);`
2. 实现要求：
   - 必须使用 `PreparedStatement` + `?` 参数绑定（`LIKE ?` 绑定 `namePrefix + "%"`），绝不允许拼字符串；
   - 注意 `namePrefix + "%"`（前缀匹配）能利用索引，而 `"%" + namePrefix + "%"` 会使 B+ 树索引失效；
   - 校验 `minScore > maxScore` 时直接抛出 `IllegalArgumentException`，不浪费一次无意义查库。
3. **渐进提示（卡住才看）**：
   - L1：用 `LIKE ?` 占位，把 `%` 拼在 `setString(1, prefix + "%")` 的 Java 参数值里，而不是写在 SQL 模板里 `LIKE '?%'`。
   - L2：SQL 中写 `WHERE name LIKE ? AND score BETWEEN ? AND ? ORDER BY id`。
   - L3：先判断 `namePrefix == null`（空串代表匹配全部）以及 `minScore > maxScore` 参数合法性，再去打开连接。
   - L4：`SQLSyntaxErrorException` 通常是因为写成 `LIKE ?%`——记住 `?` 本身已经代表整个字符串字面量，不能在外面再贴 `%`。

## 任务 2：独立实现事务转移/奖学金名额分配（TODO 骨架见下）

打开并复制 [skeleton/ScholarshipTransferLab.java](skeleton/ScholarshipTransferLab.java) 到你的 `my_practices/` 目录下独立完成两个方法：
- `transferQuota(Connection conn, long fromDeptId, long toDeptId, int amount)`：在一个事务中扣减源院系名额并增加目标院系名额；若 `amount <= 0` 或目标院系不存在（`executeUpdate() == 0`！）或扣减后名额不足（`CHECK` 报错），必须**回滚整笔操作**。
- `assertConsistent(Connection conn)`：查询两院系总名额是否依然守恒。

**特别常见漏洞（检验你是否真正理解 JDBC UPDATE）**：如果 `UPDATE ... WHERE id = ?` 的目标 `id` 根本不存在，MySQL **不会报错**，它只是正常返回受影响行数 **`executeUpdate() == 0`**！如果你不检查 `rowsAffected == 1` 就直接 `commit()`，源院系扣了钱却没有加给任何人，钱就丢了！

## 任务 3：索引失效改造与 `EXPLAIN` 验证

在测试库运行 `sql/03_indexes_bench.sql` 建表并灌入至少 500 条数据，先执行并记录 `EXPLAIN SELECT id, username FROM lab_index_bench WHERE score + 5 >= 95;` 的输出，再自己建合适的索引并把条件改写为列独立在左侧，确认 `type` 从 `ALL` 优化为 `range`、`rows` 显著下降。
