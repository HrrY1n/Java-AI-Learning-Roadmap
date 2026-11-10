# JDBC 数据访问、防注入与资源释放

> 对应示例：`day05_jdbc_repository/App.java` · 前置衔接：`s03-repository-evolution`

## 1. Java 代码怎么和 MySQL 对话？（JDBC SPI 模型）

JDBC 是 JDK 标准库（`java.sql.*`）定义的统一数据库操作接口。你的业务代码只依赖 `Connection`、`PreparedStatement`、`ResultSet` 这些标准接口；具体连接 MySQL 的网络协议实现（`mysql-connector-j` 驱动 JAR）通过 SPI 在运行时自动加载。

这正是 `s03-repository-evolution` "面向接口替换存储"思想的延续——但要诚实地告诉你：Stage 05 的 `StudentRepository` 并不是 Stage 03 那个接口的原样复用，而是**升级后的契约**：方法从 3 个（save/findById/findAll）长到 6 个（新增 updateScore/deleteById/saveBatchAtomically，对应唯一学号、删除与整批事务的需求）；`Student` 也从 3 个字段增到 5 个（新增唯一学号 studentNo 与 email，构造器校验同步升级）。所以演进项目的前两个阶段是**用升级后的模型重演**内存版与文件版——练习时请从本 Stage 的 `student/` 包复制代码起步，直接拿 Stage 03 的旧接口替换会在编译期发现方法对不上。这种"先扩契约、再换存储"的顺序，正是真实项目演进接口的常见节奏。

## 2. 为什么严禁字符串拼接 SQL？（SQL 注入与 `PreparedStatement`）

如果你写：
```java
String sql = "SELECT * FROM users WHERE username = '" + input + "'";
```
当用户输入 `' OR '1'='1` 时，拼出的 SQL 变成了 `WHERE username = '' OR '1'='1'`，条件恒成立，整张表直接暴露！

**`PreparedStatement` 的双层防护机制**：
1. 先把带 `?` 占位符的 SQL 模板与参数**结构上分开**；
2. 再通过 `ps.setString(1, input)` 等方法把参数当作**纯数据值**绑定（**注意参数下标从 `1` 开始，而不是 `0`**）——无论输入里带多少引号、分号、`OR 1=1`，都不会改变 SQL 语法结构！

> **驱动实现细节（进阶）**：MySQL Connector/J 默认 `useServerPrepStmts=false`：模板与参数在**驱动侧**组合成最终语句再发送（转义严格，注入同样不可行）；设为 `true` 才由服务端真正预编译并省下重复解析。两种模式防注入结论相同，但机制归属不同——别把"驱动侧预编译"误记成"服务端预编译"。

## 3. 资源关闭纪律（`try-with-resources`）

数据库连接、语句对象与结果集都占用数据库服务端宝贵的连接槽与句柄。如果中途抛异常而忘了关闭，几次请求就会把 MySQL 连接数耗尽导致整个应用崩溃。

**标准写法**：使用嵌套或连续声明的 `try (Connection conn = ...; PreparedStatement ps = ...)`：Java 会按**声明的逆序**（先 `ResultSet` → 再 `PreparedStatement` → 最后 `Connection`）自动调用 `close()`。同时注意：`Connection` 必须从配置文件或环境变量读取凭据，**绝不在源码写死密码**。

## 学习验收与自我检核

- **需要掌握什么**：解释为什么 `PreparedStatement` 能从语法层彻底防住 SQL 注入；熟记 `?` 占位符从 `1` 开始编号；用 `try-with-resources` 安全释放连接与结果集并外置凭据配置。
- **如何证明理解**：① 独立完成连续演进项目 `JdbcStudentRepository` 的完整 CRUD 实现；② 能指出拼接 SQL 下 `' OR '1'='1` 与 `' ; DROP TABLE ...` 的危险并当场改写为 `PreparedStatement`。
- **什么情况属于尚未掌握**：用手写字符串替换 `replace("'", "")` 以为就能防住注入；或只在 `try` 块末尾写 `conn.close()`（一旦前面抛 `SQLException` 就跳过关闭造成连接泄漏）。
- **针对错误如何复习**：继续完成同阶段六阶段演进项目 `StudentEvolutionDemo`，在真实事务与异常处理中巩固。
