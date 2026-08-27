# Stage 02：Java 面向对象与核心语法

状态：**已有材料，尚未验证掌握**　优先级：**P0-J**

## 为什么要学

Java 后端通过对象表达业务，通过分层控制职责。Spring 的 Controller、Service、Mapper 只有建立在类、封装、接口和多态之上才不会变成机械抄代码。

## 前置知识

- 完成 Stage 01 的方法、数组和控制台程序验收。

## 必须掌握（P0）

- 类与对象、字段与方法、构造方法、`this`。
- 封装、访问修饰符、getter/setter、业务规则。
- 继承、多态、方法重写、抽象类、接口。
- `String`、`StringBuilder` 和常用标准库 API。
- Entity 与 Service 的基本职责边界。

## 了解即可（P1）

- 日期时间 API、`Math`、`Random`。
- 组合优于继承、简单依赖倒置思想。

## 暂时不用深入（P2）

- 大量设计模式、反射框架源码、复杂 UML。

## 当前目录与运行方式

每日目录是一个独立 lesson 的源码根目录，里面的 `com/javaroadmap/...` 才是 package 路径。例如第一天的 `App` 与 `Student` 相互依赖，因此位于同一个 `com.javaroadmap.stage02.day01classobject` 包并一起编译：

```powershell
Set-Location existing_course/day01_class_object
javac -encoding UTF-8 -d out com/javaroadmap/stage02/day01classobject/App.java com/javaroadmap/stage02/day01classobject/Student.java
java -cp out com.javaroadmap.stage02.day01classobject.App
```

其他天可以继续使用 `App`、`Student`、`Animal` 等相同类名，因为每一天都有自己的 package。IntelliJ IDEA 中将对应的 `day*` 目录作为 Sources Root 后，直接运行该包中的 `main`；`existing_course/src/main/java/` 下的完整参考示例则以 `src/main/java` 为 Sources Root。

## 现有内容怎么用

- `existing_course/day01_*` 到 `day06_*`：单知识点示例。
- `existing_course/src/`：学生、图书、银行三个分层示例，属于参考代码，不代表已完成项目。
- `existing_course/exercises/`：需要你独立完成的 OOP 练习。
- `existing_course/examples/common_api/`：String、StringBuilder、日期时间、Math/Random 旧示例。
- `existing_course/mini_projects/early_console_projects/`：早期控制台项目，保留为练习素材，不作为多个简历项目。

## 推荐学习流程

每个概念都按“业务场景 → 为什么需要对象边界 → 最小代码 → 先预测再运行 → 改一个条件 → 独立建模”学习，并在综合练习中再次使用。

1. 先用自己的话解释对象、构造器、封装和 `this`。
2. 运行小示例，再独立实现一个类，不复制 `src/`。
3. 完成学生管理练习：增加 email、按 id 查询、修改分数并校验。
4. 完成银行转账或图书借还中的一个，不同时铺开多个同质项目。
5. 对照参考代码做 Code Review，记录“为什么放在 Entity/Service”。

## 算法与面试同步练

- 链表、栈、队列的对象建模入门。
- 面试：重载与重写、抽象类与接口、继承与组合、`String` 不可变性、`this` 与 `super`。

## 常见错误

- 所有字段都公开，或只生成 getter/setter 却没有业务规则。
- 把所有逻辑放进 `main`。
- 为复用几行代码滥用继承。
- 把三个生成的示例项目当成自己已经完成。

## 完成标准

- [ ] 能独立建模一个含 Entity 和 Service 的小业务。
- [ ] 能解释封装、继承、多态、抽象类和接口的适用场景。
- [ ] 完成一个 OOP 综合练习及边界测试。
- [ ] 能对现有学生/图书/银行示例指出有证据的可改进点并说明取舍。
- [ ] 在根目录 [`真实学习进度.md`](../../真实学习进度.md) 写入自己的实现路径和复盘结论。

上一阶段：[Stage 01](../stage01_java_basics/README.md)　下一阶段：[Stage 03：Java 核心能力](../stage03_java_core/README.md)
