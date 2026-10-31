# Stage 02 预测与修改练习集

用法：先写预测再运行；答案集中在 [answers.md](answers.md)，做完至少 5 题再看。

## A. 预测题

### S02A1 别名共享
```java
class Student {
    String name;
    int score;

    Student(String name, int score) {
        this.name = name;
        this.score = score;
    }
}

public class AliasDemo {
    public static void main(String[] args) {
        Student s1 = new Student("小明", 88);
        Student s2 = s1;
        s2.name = "明仔";
        System.out.println(s1.name);
    }
}
```
（片段自包含：复制到 `AliasDemo.java` 即可编译运行。）参考：[深化课 01](../deep_dives/01_reference_state/README.md)

### S02A2 `==` 与 equals
```java
String a = new String("Java");
String b = new String("Java");
System.out.println(a == b);
System.out.println(a.equals(b));
```
预测两行；再解释 `==` 比较的到底是什么。

### S02A3 字段默认值
```java
class Point {
    int x;
    String label;
}

public class DefaultValueDemo {
    public static void main(String[] args) {
        Point p = new Point();
        System.out.println(p.x + " / " + p.label);
    }
}
```
（片段自包含：复制到 `DefaultValueDemo.java` 即可编译运行。）
预测输出。`int` 和 `String` 的默认值为什么不同？

### S02A4 多态分发
```java
Animal a = new Dog("旺财");
a.eat();
```
（Animal/Dog 用 day04/day05 里的定义。）
预测调用的是谁的 eat？依据是什么（编译时看什么，运行时看什么）？

### S02A5 构造顺序
```java
class A {
    A() { System.out.println("A 诞生"); }
}

class B extends A {
    B() { System.out.println("B 诞生"); }
}

public class ConstructionOrderDemo {
    public static void main(String[] args) {
        new B();
    }
}
```
（片段自包含：复制到 `ConstructionOrderDemo.java` 即可编译运行。）
预测输出顺序。

## B. 修改题

### S02B1 day05 多态顺序
在 `existing_course/day05_polymorphism/` 里把数组/调用顺序中 dog 与 cat 的位置对调。
预测输出顺序变化；验证后说明"输出顺序由什么决定"。

### S02B2 day03 封装
在 `existing_course/day03_encapsulation/` 里把 `withdraw` 的条件 `amount > balance` 删除。
预测：`withdraw(99999)` 会发生什么？运行验证，然后回答这个删除破坏了什么约定。

### S02B3 深化课 EntityService 示例
在 [06_entity_service](../deep_dives/06_entity_service/README.md) 的示例里，把 main 中 `try/catch` 去掉直接调用。
预测：程序在哪一行、以什么异常终止？第 4 行的统计还打印吗？

### S02B4 给 SafeAccount 加"大额提示"
给深化课 03 示例的 `deposit` 增加规则：单笔超过 1000 打印提示。
先预测改动点数量；实现后用 50、1001 两笔验证。

---

完成后回到 [结构化练习](../existing_course/exercises/oop_project_exercises.md) 三个方向任选其一做深。
