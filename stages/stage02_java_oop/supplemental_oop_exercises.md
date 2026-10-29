# 面向对象练习（每日小题库）

随堂小练习：每个主题挑 1–2 题，目的是让 OOP 语法过手。**验收标准：编译运行通过 + 能说出"这个设计防住了什么问题"**（例如封装题要能指出 public 字段会出的事故，见 [封装深化课](deep_dives/03_encapsulation_why/README.md)）。综合性的结构化练习见 [existing_course/exercises](existing_course/exercises/oop_project_exercises.md)。做完的代码放 `my_practices/`（Stage 02 下）。

## 类与对象

1. 创建 `Car` 类，包含品牌和价格，并输出信息。
2. 创建 `Teacher` 类，包含姓名和课程，并写一个 teach 方法。
3. 创建两个对象，观察它们的字段是否互相影响。

## 构造方法与 this

1. 给 `Car` 增加构造方法。
2. 创建 `Book` 类，使用构造方法初始化书名和作者。
3. 给构造方法中的参数和字段使用相同名字，练习 `this`。

## 封装

1. 创建 `Phone` 类，把 price 字段设为 private。
2. 给 `Phone` 增加 getPrice 和 setPrice。
3. setPrice 中判断价格不能小于 0。

## 继承与多态

1. 创建 `Animal` 父类和 `Cat` 子类。
2. 让 `Cat` 重写 eat 方法。
3. 写一个方法，参数是 `Animal`，传入 `Cat` 对象。

## 接口与抽象类

1. 创建 `RunnableThing` 接口，定义 run 方法。
2. 创建 `Person` 类实现接口。
3. 创建一个抽象类 `Shape`，定义抽象方法 area。

