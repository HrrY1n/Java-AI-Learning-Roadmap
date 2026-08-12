# Stage03 练习题

## 练习 1：增加删除学生

在 `StudentRepository` 中增加删除方法：

```java
boolean deleteById(int id);
```

要求：

- 学生存在时删除并返回 true。
- 学生不存在时返回 false 或抛出业务异常。

## 练习 2：增加修改分数

在 `StudentService` 中增加修改分数方法。

要求：

- 分数必须在 0 到 100。
- 学生不存在时返回失败 `Result`。

## 练习 3：统计优秀学生

使用 Stream 筛选分数大于等于 90 的学生。

## 练习 4：文件格式扩展

当前文件使用：

```text
id,name,score
```

请增加 email 字段，改成：

```text
id,name,score,email
```

