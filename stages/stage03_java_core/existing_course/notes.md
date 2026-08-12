# Stage03 笔记：集合、异常、IO、泛型

## List

`List` 适合保存一组有顺序的数据。学生列表、订单列表、菜品列表都可以用 `List` 表达。

```java
List<Student> students = new ArrayList<>();
```

## Map

`Map` 适合根据 key 快速查找数据。例如根据学生 id 查学生：

```java
Map<Integer, Student> studentMap = new HashMap<>();
studentMap.get(1);
```

后面项目中，Redis、配置缓存、临时映射关系也经常使用 Map 思想。

## Set

`Set` 适合保存不重复数据。例如统计所有学生姓名、所有分类名称。

## 泛型

泛型用于在使用时指定类型。`Result<T>` 表示这个结果对象可以包装任何类型的数据：

- `Result<Student>`
- `Result<List<Student>>`
- `Result<String>`

这和后端接口统一返回非常接近。

## 自定义异常

业务异常不是程序崩溃，而是业务规则不满足。例如学生 id 重复、学生不存在、分数不合法。

本阶段使用 `BusinessException` 表示这类错误。后面 Spring Boot 会用统一异常处理把它转换成统一响应。

## 文件持久化

内存中的数据在程序结束后会消失。文件持久化可以把数据写到本地文件中，下次启动再读取。

这不是最终方案。真实后端项目会使用 MySQL，但文件版能帮助你理解“持久化”的意义。

## Lambda 和 Stream

Stream 常用于处理集合：

- `filter`：筛选
- `map`：转换
- `collect`：收集结果

例如筛选及格学生：

```java
students.stream()
        .filter(student -> student.getScore() >= 60)
        .collect(Collectors.toList());
```

