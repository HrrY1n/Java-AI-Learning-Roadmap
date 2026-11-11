# MyBatis 数据访问：SQL 可见性延续到后端应用

> 对应工程：`stages/stage06_backend_foundations/mybatis-lab/`（可编译 + 静态验证的独立模块）
> ⚠️ 诚实状态：本课的 Mapper 代码与 SQL 均已通过编译验证，但**真实 MySQL 集成测试未执行**——
> 本轮开发环境的 Docker 引擎未运行，按任务书记录为阻断（见 docs/overhaul-v2.5/07_DATABASE_INTEGRATION.md）。
> 所有"运行后应看到"的描述均为按 MyBatis/MySQL 官方语义的预期，**不冒充实测**。

## 1. 为什么是 MyBatis 而不是 JPA：Stage 05 主线的延续

Stage 05 的立场是"SQL 可见性"：你手写 SQL、理解每一列与每个约束。Spring Data JPA 会把 SQL 藏进"实体关系自动推导"——学习阶段这会切断你与数据库的真实联系。**MyBatis 的核心立场恰好是"SQL 是你的"**：你在 XML/注解里写真实 SQL，MyBatis 只做参数绑定与结果映射两件体力活。

它替代的是课 5 讲过的 JDBC 模板代码：`PreparedStatement` 参数绑定、`ResultSet` 逐列读取、连接资源管理——**替代的是这些体力活，不是 SQL 本身，也不是事务语义**。

## 2. 从 JDBC 到 MyBatis 的对照（同一查询的两种写法）

Stage 05 JDBC 版查一个学生：

```java
PreparedStatement ps = connection.prepareStatement("SELECT id, student_no, name, score, email FROM students WHERE id = ?");
ps.setInt(1, id);
try (ResultSet rs = ps.executeQuery()) {
    if (rs.next()) return new Student(rs.getInt("id"), rs.getString("student_no"), ...);
    return null;
}
```

MyBatis Mapper 版：

```java
public interface StudentMapper {
    @Select("SELECT id, student_no, name, score, email FROM students WHERE id = #{id}")
    Student findById(int id);
}
```

对照读出三层含义：① SQL 一模一样（可见性保持）；② `#{id}` 替代 `?` + `setInt`——**参数绑定仍然是预编译的**，注入防护不变；③ 返回值直接是 Student 对象——`ResultSet` 手工映射被 MyBatis 的自动映射替代（列名 student_no ↔ 驼峰 studentNo 需要 `map-underscore-to-camel-case` 配置，见模块内 mybatis-lab 的配置文件）。

## 3. 读懂本模块的 Mapper（编译验证通过）

`mybatis-lab/` 的 `StudentMapper` 接口包含与 Stage 05 契约对应的语句：按 id 查、全查、插入（含回填自增 id）、更新分数、删除、批量插入。每条 SQL 都可以在 `xml` 或注解里找到原文——**不看懂 SQL 就写不出 Mapper**，这是它与 JPA 的本质区别。

**事务归属**：MyBatis 本身不管事务，Spring 的 `@Transactional` 接管（对应 Stage 05 `saveBatchAtomically` 的"整批回滚"语义——MySQL 版就是真实事务）。批量插入失败 → 事务回滚 → 数据库回到调用前状态，与内存版的快照回滚**语义一致、机制不同**。

## 4. 本模块在仓库中的位置与验证方式（如实声明）

```text
mybatis-lab/  （独立 Maven 模块：mybatis + mysql-connector-j 依赖）
├── pom.xml                      → ./mvnw compile 通过 = 代码可编译
├── src/main/java/.../StudentMapper.java
└── src/main/resources/mapper/StudentMapper.xml
```

验证等级（如实三级）：① **编译验证已通过**（`./mvnw compile`）；② Mapper XML 与接口绑定关系静态核对已做；③ **真实 MySQL 运行验证未执行**（环境阻断）。课内所有"运行后"描述请按"将来接入真实库时"理解。真库接入需要：运行中的 MySQL 8.0 + Stage 05 的 `lab_students` 建表脚本 + `application-mysql.properties` 配置（模板已备）。

## 5. 数据访问层的最终形状（课 5 → 课 7 的完整对照）

```text
Controller（不变）→ Service（不变，@Transactional 真事务）→ StudentRepository 接口
                                                      ├─ InMemoryStudentRepository（默认，零依赖）
                                                      └─ MyBatisStudentRepository（MySQL profile）
```

`StudentRepository` 接口一行未改——这就是课 5 "Repository 只谈存取"承诺的兑现：换存储实现，上层完全不动。切换方式：MySQL profile 下让 MyBatis 实现标注 `@Primary`（或条件装配），内存版在默认 profile 下生效。

## 6. 排查 SQL 错误（MyBatis 时代的三板斧）

1. **看生成的 SQL**：`log.level.com.javaroadmap=DEBUG` 让 MyBatis 打印"Preparing:"与"Parameters:"两行——90% 的绑定错误当场现形（占位符个数、类型、顺序）。
2. **SQL 原文单独执行**：把 Preparing 行的 SQL 拷出来放 MySQL 客户端跑一遍，区分"SQL 错"还是"映射错"。
3. **读异常链**：`DataAccessException` 的 cause 是 SQLIntegrityConstraintViolationException（约束冲突，如唯一学号 → 1062）还是语法错——Stage 05 的错误码知识（1062/3819/1452）在这里全部适用。

## 7. 修改一个条件（静态核对练习）

把 `StudentMapper.xml` 里插入语句的 `student_no` 列名改成 `no`（模拟列名笔误），再 `./mvnw compile`——**编译照样通过**：SQL 字符串编译器不检查。这正是"SQL 可见性"的另一面：错误要到运行时才炸。改回，并用课内"排查三板斧"的第 2 条说明：真库场景下这条错误会在第一次 INSERT 时以 `Unknown column 'no'` 暴露。

## 8. 独立练习与真库接入路线（供拥有 MySQL 环境后执行）

**练习**：给 `StudentMapper` 增加 `findByStudentNo`（与课 5 练习同语义的 SQL 版），编译通过后按官方 MyBatis-Spring 文档接入 `student-api` 的 `application-mysql.properties`。
**真库接入步骤**（全部步骤见 07_DATABASE_INTEGRATION.md）：启动隔离 MySQL → 建表（Stage 05 `01_constraints.sql`）→ 配 datasource → `./mvnw test` 跑 `@SpringBootTest` 的 MySQL profile 版契约测试（同一套契约测试换 profile 复跑——这是分层的最终收益）。

## 9. 常见误区

- 以为 MyBatis 防 SQL 注入靠它自己：防注入的是 `#{}` **预编译参数绑定**；`${}` 是字符串拼接（排序字段白名单场景才用，且必须白名单）。
- 列名驼峰映射不配置就期望自动转换。
- 在 Mapper 里写跨表大 SQL 而不测：SQL 是代码，要有自己的测试（真库后用契约测试复跑）。
- 事务写在 Mapper 里：事务是 Service 层的职责（`@Transactional`），MyBatis 只提供 SqlSession。
