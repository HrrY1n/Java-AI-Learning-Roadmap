# Stage 05 预测与修改练习集

用法：先写预测再运行；答案集中在 [answers.md](answers.md)。A 系列预测题片段均自包含（只使用标准库接口模拟，不依赖外部 MySQL 驱动即可在任何 JDK 上独立编译运行）。

## A. 预测题

### S05A1 `try-with-resources` 的资源关闭顺序
```java
public class CloseOrderDemo {
    static class FakeResource implements AutoCloseable {
        private final String name;
        FakeResource(String name) { this.name = name; }
        @Override public void close() { System.out.println("关闭：" + name); }
    }

    public static void main(String[] args) {
        try (FakeResource conn = new FakeResource("Connection");
             FakeResource ps = new FakeResource("PreparedStatement");
             FakeResource rs = new FakeResource("ResultSet")) {
            System.out.println("执行查询");
        }
    }
}
```
预测 4 行精确输出（重点是资源关闭顺序为什么是这样——JDBC 关闭时顺序反了会发生什么？）。
参考：[JDBC 数据访问](../existing_course/day05_jdbc_repository/README.md)

### S05A2 SQL 拼接陷阱 vs 参数占位符认知
```java
public class SqlInjectionModelDemo {
    static String buildUnsafeSql(String input) {
        return "SELECT * FROM users WHERE username = '" + input + "'";
    }

    static boolean isTemplateValid(String template, int paramCount) {
        long qCount = template.chars().filter(c -> c == '?').count();
        return qCount == paramCount && !template.contains("'?'");
    }

    public static void main(String[] args) {
        String malicious = "' OR '1'='1";
        System.out.println(buildUnsafeSql(malicious));
        System.out.println(isTemplateValid("SELECT * FROM users WHERE username = ?", 1));
        System.out.println(isTemplateValid("SELECT * FROM users WHERE name LIKE '?'", 1));
    }
}
```
预测 3 行输出。注意第 3 行：为什么 `LIKE '?'` 是无效的参数模板？
参考：[JDBC 数据访问](../existing_course/day05_jdbc_repository/README.md)

### S05A3 事务提交前参数校验与异常传播顺序
```java
public class TxGuardOrderDemo {
    static void transfer(int fromBalance, int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("划转数量必须大于 0：" + amount);
        }
        if (fromBalance < amount) {
            throw new IllegalStateException("余额不足，拒绝更新并回滚");
        }
        System.out.println("扣减成功并提交：" + (fromBalance - amount));
    }

    public static void main(String[] args) {
        try {
            transfer(100, -5);
        } catch (RuntimeException e) {
            System.out.println("捕获异常：" + e.getMessage());
        }
        transfer(100, 30);
    }
}
```
预测两行输出。说明为什么参数校验要写在开启事务与更新之前。
参考：[事务、ACID 与隔离级别](../existing_course/day03_transactions_acid/README.md)

## B. 修改题（需连接隔离 MySQL 测试库运行）

### S05B1 `ON DUPLICATE KEY UPDATE` vs 显式主键判存
对照 [JdbcStudentRepository](../existing_course/src/main/java/com/javaroadmap/stage05/student/JdbcStudentRepository.java)：思考如果把 `save()` 改成只用一条 `INSERT ... ON DUPLICATE KEY UPDATE ...`，当存在 `id=1, student_no="S001"` 时再去 `save(new Student(10, "S001", "冒名者", 70, "-"))` 会发生什么？用 `StudentEvolutionDemo` 对比观察。

### S05B2 `EXPLAIN` 索引最左前缀实验
在 [day04_indexes_explain](../existing_course/day04_indexes_explain/com/javaroadmap/stage05/day04indexesexplain/App.java) 中，把第 3 组 SQL 的 `WHERE score >= 80` 改成 `WHERE dept_code = 'D3'` 再运行一次，预测并观察 `type` 与 `rows` 如何变化。
