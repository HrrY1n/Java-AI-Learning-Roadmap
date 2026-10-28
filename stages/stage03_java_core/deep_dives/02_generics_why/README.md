# 深化课 02：泛型——为什么集合都要带尖括号

对应示例：`com/javaroadmap/stage03/deepdives/genericswhy/GenericsWhyDemo.java`

**运行后你会看到什么**：4 行输出；取消一行注释会得到编译错误。看完本文你应该能解释"泛型把什么错误提前到了什么时候"，并看懂 `Result<T>`、`List<Student>` 这类声明的含义。

## 场景

`ArrayList<String>` 的尖括号你可能已经照写了一段时间。它不是装饰：Stage 03 的 `Result<T>`、`StudentRepository` 返回的 `List<Student>` 全靠它表达类型约定。不理解泛型，读 `FileStudentRepository` 的方法签名就会卡住。

## 必须理解

泛型解决两个在"没有泛型的旧 Java"里天天发生的问题（示例第一段是活化石）：

1. **取出来类型未知**：从 raw `ArrayList` 里 get 到的是 `Object`，用之前必须强转，转错类型运行时才炸（`ClassCastException`）。
2. **塞错无法阻止**：往"名单"里 add 一个数字，编译器毫不知情。

`List<String>` 的含义是**容器与使用者之间的类型约定**：只装 String、取出来就是 String。错误从"运行时崩溃"提前到"写代码的瞬间被编译器拒绝"——这是泛型的全部意义。

**心智模型**：尖括号是贴在容器上的**类型标签**。标签参与编译期检查；标签本身不是数据，运行时会被擦掉（类型擦除，P1 了解即可——现阶段只需知道 `List<String>` 和 `List<Integer>` 运行时是同一个类）。

## 理解原理：泛型方法的 `<T>`

示例第三段的 `static <T> T pickFirst(List<T> list, T fallback)`：

- `<T>` 在返回类型前声明："本方法引入一个类型标签 T"；
- 三处 T 是**同一个 T**：传 `List<String>` 进去，返回就是 String，fallback 也必须是 String；
- 调用处不写 T，编译器从实参**推断**。

读法练习：`Result<Student>` 读作"结果容器，成功时里面装学生"；`Function<String, Integer>` 读作"从 String 到 Integer 的转换"。**会读泛型签名比会写泛型类优先**——日常 90% 的场景是读。

**Observe（先预测再运行）**：预测 4 行输出；取消 `names.add(42)` 注释，读一遍编译错误，确认它指向"添加那一行"而不是"崩溃那一行"。

## 动手：修改一个条件

1. 把 `pickFirst(nums, -1)` 的 fallback 改成 `"<空>"`：编译错误——感受"三处 T 必须一致"的约束如何帮你。
2. 给 `Box<T>`（day04 的类）加个方法 `T swap()`？没有意义——但给 `List<T>` 写 `static <T> void swap(List<T> list, int i, int j)` 就完全成立。体会：T 在"多个位置必须指同一类型"时才产生价值。

## 常见错误

- 写 `new ArrayList()`（raw type）然后到处强转：把泛型的保护全部关掉。
- 把 `List<Object>` 当"万能列表"传给需要 `List<String>` 的方法：不兼容——`String` 是 `Object` 的子类，但 `List<String>` **不是** `List<Object>` 的子类（P1 深入，先记住现象）。
- 泛型类型用基本类型：`List<int>` 不存在，要用包装类 `List<Integer>`（自动装箱的性能意识 Stage 04 再谈）。

## 独立练习

在 `my_practices/` 写一个泛型类 `Pair<K, V>`（两个只读字段 key、value，构造器赋值），再写泛型方法 `static <T> T lastOf(List<T> list, T fallback)`。自检：`Pair<String, Integer>` 装 "语文", 95；`lastOf` 对空列表返回 fallback、对 `[7]` 返回 7，两种元素类型都能编译运行。

## 与后面学习的联系

- `Result<T>`（existing_course/src/common）把"成功值或失败消息"装进同一个泛型容器——读它的源码检验本课成果。
- Stream API（下一课）几乎每个方法都是泛型方法：`filter(Predicate<T>)`、`map(Function<T,R>)`——不懂 T/R 就读不懂 Stream。
