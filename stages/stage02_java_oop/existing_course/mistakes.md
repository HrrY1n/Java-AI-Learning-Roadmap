# Stage02 常见错误

## 忘记 new 对象

类只是模板，使用前需要创建对象：

```java
Student student = new Student(1, "小明", 90);
```

## private 字段无法直接访问

字段使用 `private` 后，不能在类外直接写：

```java
student.score = 100;
```

应该通过方法操作，例如 `setScore` 或业务方法。

## 构造器写成普通方法

构造器没有返回值，不能写 `void`。

错误写法：

```java
public void Student() {
}
```

## 把所有逻辑都写进 main

`main` 方法应该负责启动流程，不应该堆满所有业务逻辑。业务逻辑应逐渐移动到 Service 类中。

## 滥用继承

继承表示“是什么”。例如 Dog 是 Animal 合理，但 Student 继承 Score 就不合理。不要为了复用几行代码滥用继承。

