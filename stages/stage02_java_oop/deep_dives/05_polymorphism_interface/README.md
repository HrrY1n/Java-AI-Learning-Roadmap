# 深化课 05：多态与接口——面向"约定"写代码

对应示例：`com/javaroadmap/stage02/deepdives/polymorphism/PolymorphismDemo.java`

**运行后你会看到什么**：5 行输出——同一句 `a.speak()` 打出两种叫声，同一个数组里动物和机器人共处。看完本文你应该能解释"动态绑定发生在哪一步"，并给出接口 vs 抽象类的选择标准。

## 场景

day05 的 `feed(Animal animal)` 已经让你见过"一个方法喂所有动物"。但它为什么能工作？如果用 `if (animal instanceof Dog) ... else if ...` 也能实现——**多态的价值必须与这个 if-else 对照才看得清**：新加一种动物时，if-else 版要改所有判断点，多态版一行不改。改动扩散范围，就是设计质量的分水岭。

## 必须理解

**多态的机制一句话**：编译时检查"约定有没有"（`Animal` 有没有 `speak`），运行时才决定"执行谁的版本"（JVM 看对象实际类型）。这叫**动态绑定**。

三个角色分工：

| 角色 | 提供什么 | 示例 |
| --- | --- | --- |
| 抽象类 | 约定（抽象方法）+ **公共实现与状态** | `Animal`：name 字段、`title()` 实现、`speak()` 约定 |
| 接口 | 纯约定（"能做什么"），无状态 | `Introducible`：`introduce()` |
| 具体类 | 回答约定，可以多实现接口 | `Dog`、`Robot` |

**选择标准**：子类之间有**公共代码和公共状态**要共享 → 抽象类；只是"能力标签"、不同家族的类都要实现 → 接口。拿不准时倾向接口——它约束更少、可组合（一个类可实现多个接口，只能继承一个父类）。

**心智模型**：接口是"插座标准"，抽象类是"半成品框架房"。插座标准让任何符合规格的电器即插即用；框架房只适合真正同宗的户型。

## 理解原理：为什么"加新动物不用改 speakAll"

`speakAll` 的循环里只有一条指令"按 Animal 的约定调用 speak"。JVM 执行时看每个元素的**实际类型**，找到它（或它的父类）的 speak 版本执行。判断逻辑不在你的代码里，在对象自己身上——所以新增类型对老代码**零侵入**。这就是"对扩展开放、对修改关闭"的朴素形态，也是 Stage 03 `StudentRepository` 接口存在的原因：内存版换文件版，`StudentService` 不改一行。

**Observe（先预测再运行）**：预测 `speakAll` 的输出（注意 `title()` 是抽象类里的公共实现，Dog/Cat 都用它）；预测第二段循环的输出顺序。

## 动手：修改一个条件

1. 新增 `Bird extends Animal`（speak 打"啾"），把它加进 zoo 数组：确认 `speakAll` 一行未改。再尝试用 if-else 版实现同样效果，数一数要动几处。
2. 给 `Robot` 加 `implements Animal`？——编译报错：Robot 不是 Animal（没有继承它的状态与实现），体会"实现接口 ≠ 继承类"。

## 常见错误

- 抽象类里写了抽象方法却忘了在子类 `@Override`：子类也得声明为 abstract 才能不实现。
- 滥用接口：只有一个实现且看不到第二个时，先写具体类，需要时再提取接口——接口是"发现的"，不是"预设的"。
- 在接口里加状态：接口没有实例字段；要状态就上抽象类。

## 独立练习

在 `my_practices/` 实现一个最小"通知系统"：接口 `Notifier { void send(String message); }`，两个实现 `ConsoleNotifier`（打印到屏幕）与 `SilentNotifier`（什么都不做但记录调用次数，提供 `getCount()`）。写一个 `notifyAll(Notifier[] list, String msg)`。自检：把两个实现放进同一个数组调用成功；把 `ConsoleNotifier` 换成 `SilentNotifier` 时，调用方代码零修改。

## 与后面学习的联系

- Stage 03 的 `StudentRepository` 接口（内存版/文件版互换）是本课在生产代码里的直接应用。
- Stage 06 Spring 的依赖注入，注入的几乎全是接口：`UserController` 依赖 `UserService` 这个"插座标准"。
- Lambda（Stage 03）是"只有一个方法的接口"的极简写法——接口概念是它的前置。
