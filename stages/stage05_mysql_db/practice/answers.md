# Stage 05 预测与修改练习：答案

## S05A1
```text
执行查询
关闭：ResultSet
关闭：PreparedStatement
关闭：Connection
```
`try-with-resources` 按**声明的逆序**关闭资源。在 JDBC 中，必须先关 `ResultSet`、再关 `PreparedStatement`、最后关 `Connection`——如果先关了连接，后续语句和结果集就失去宿主通道。

## S05A2
```text
SELECT * FROM users WHERE username = '' OR '1'='1'
true
false
```
字符串拼接直接把输入 `' OR '1'='1` 解释为 SQL 逻辑恒真条件；而 `LIKE '?'` 加了单引号后，`?` 被当成了普通的单字符问号，不再是预编译占位符（正确写法是 SQL 写 `LIKE ?`，在 Java 里传 `setString(1, prefix + "%")`）。

## S05A3
```text
捕获异常：划转数量必须大于 0：-5
扣减成功并提交：70
```
合法性校验写在事务和数据库写操作之前（Fail-Fast），能防止非法参数无谓占用数据库锁资源并触发不必要的事务回滚。

## S05B1
`INSERT ... ON DUPLICATE KEY UPDATE` 在 MySQL 中会匹配**任意一个**撞车的唯一键（无论是主键 `id` 还是唯一索引 `uk_evo_student_no`）。因此当新主键 `id=10` 撞上旧记录的学号 `S001` 时，它不会报唯一约束冲突，反而会直接把 `id=1` 的姓名篡改成 `"冒名者"`！按 `id` 显式区分 `UPDATE` 与 `INSERT` 才能让唯一索引真正拦住冒用。

## S05B2
改回 `WHERE dept_code = 'D3'` 后命中联合索引 `(dept_code, score)` 最左前缀：`type` 从 `ALL`（全表 500 行）变成 `ref`（`key=idx_dept_score`），扫描行数 `rows` 大幅下降到约 50 行。
