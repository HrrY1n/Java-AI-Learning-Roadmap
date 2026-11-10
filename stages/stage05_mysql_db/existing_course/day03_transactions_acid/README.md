# 事务、ACID 与隔离级别（MySQL InnoDB）

> 对应示例：`day03_transactions_acid/App.java` · 目标引擎：**MySQL 8.0 InnoDB**

## 1. 为什么几条 SQL 不能靠默认的自动提交？

JDBC 连接和 MySQL 终端默认开启 `autocommit = 1`：每一条 `INSERT` / `UPDATE` 单独成事务，刚执行完就立刻持久化。在“小明转 30 学分给小红”业务中：
- 第 1 条 `UPDATE` 扣了小明 30；
- 第 2 条 `UPDATE` 给小红加 30 时网络断了或触发约束失败；
结果 30 学分凭空蒸发！**事务**把多步操作捆成一个逻辑单元：`conn.setAutoCommit(false);` → 全部成功才 `commit()`，任何异常进 `catch` 执行 `rollback()` 全部复原。

## 2. ACID 四特性（InnoDB 视角）

- **A（原子性 Atomicity）**：要么全成功、要么全回滚（InnoDB 靠 **undo log** 记录修改前的旧值实现回滚）。
- **C（一致性 Consistency）**：事务前后数据必须满足全部业务与约束规则（如总学分守恒、余额非负）。
- **I（隔离性 Isolation）**：并发事务彼此不可互相看到未提交的半成品。
- **D（持久性 Durability）**：一旦 `commit()` 返回成功，即使立刻断电数据也不丢失（InnoDB 靠 **redo log** 顺序刷盘保证）。

## 3. 并发读异常与 MySQL 四大隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | MySQL InnoDB 备注 |
| --- | :---: | :---: | :---: | --- |
| `READ UNCOMMITTED` | 可能 | 可能 | 可能 | 几乎不用 |
| `READ COMMITTED` | ✗ | 可能 | 可能 | Oracle/PG 默认；每次普通 SELECT 生成新快照 |
| **`REPEATABLE READ`** | ✗ | ✗ | **基本解决** | **MySQL 默认级别**：普通 SELECT 用 **MVCC 一致性视图**固定首次读快照；`SELECT ... FOR UPDATE` / 更新用 **Next-Key Lock（记录锁+间隙锁）**防幻读 |
| `SERIALIZABLE` | ✗ | ✗ | ✗ | 全部读加共享锁，吞吐最低 |

> 本课示例用两条并发 JDBC 连接亲自实测了 `REPEATABLE READ` 的 MVCC 快照读：`tx2` 提交之后，早已开始但还没结束的 `readerOldTx` 第二次普通 `SELECT` 依然读到 `100`——既无脏读，又在同一事务内保持“可重复读”。

## 4. JDBC 事务模板（注意两点常见错误）

1. **忘记关闭连接前恢复或忘了 `rollback()`**：在 `catch` 块里必须调 `conn.rollback()`（且保护性包一层 `try/catch` 避免掩盖原异常）。
2. **只对部分 SQL 开了事务，或把耗时 HTTP 调用放进长事务**：长事务会一直霸占行锁与 undo 版本，拖垮整个数据库的并发吞吐——**只在需要原子写库的那几步保持短事务**。

## 学习验收与自我检核

- **需要掌握什么**：说清 `autocommit=1` 的隐患；写出 JDBC `setAutoCommit(false)`/`commit`/`rollback` 标准模板；区分 `READ COMMITTED` 与 MySQL 默认 `REPEATABLE READ`（MVCC 快照读 vs 加锁当前读）。
- **如何证明理解**：① 运行 `day03_transactions_acid/App.java` 并能指着输出解释为什么 `readerOldTx` 在 `tx2.commit()` 后还打印 `100`；② 在异常发生时能够确保第 1 步扣减被回滚。
- **什么情况属于尚未掌握**：写了 `setAutoCommit(false)` 却忘了写 `commit()`（导致数据全留在未提交会话里，退出后自动回滚丢数据）；或把长耗时网络请求夹在事务中间。
- **针对错误如何复习**：对照查看本课代码实验一、二的两个独立 `Connection` 生命周期；后续 Stage 06 Spring `@Transactional` 正是把这里的 `try { setAutoCommit(false); ... commit(); } catch { rollback(); }` 自动化。
