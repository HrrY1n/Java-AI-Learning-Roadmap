# Stage 01：Java 基础

状态：**学习中**　优先级：**P0-J**

## 为什么要学

变量、分支、循环、数组和方法是后续 OOP、集合、Spring Boot 乃至算法题的共同基础。本阶段的目标不是继续堆语法示例，而是把已经开始练习的内容真正练熟。

## 前置知识

- 已安装 JDK，能运行 `java -version` 和 `javac -version`。
- 会在 PowerShell 中进入目录。

## 必须掌握（P0）

- 变量、基本数据类型、运算符、类型转换。
- `if` / `switch`、`for` / `while`、`break` / `continue`。
- 一维数组、遍历、最大值/最小值/平均值。
- 方法的参数、返回值、作用域和拆分逻辑。
- `Scanner` 输入、基础调试、`javac` / `java` 的关系。

## 了解即可（P1）

- 二维数组、可变参数、方法重载。
- 基础时间与空间复杂度意识。

## 暂时不用深入（P2）

- 反射、注解处理器、复杂 JVM 参数。
- 为简单练习引入框架或设计模式。

## 先理解：包是类的“完整地址”

**Scenario → Why**：多个逐日练习都可以叫 `App`，但如果都没有包声明，Java 会把它们都当成同一个 `App`，IntelliJ 编译整个模块时就会报告重复类。

**Concept → Mental Model**：`package` 声明类属于哪个包；没有 `package` 的类位于 **default package（默认包）**。把“包名 + 类名”连起来就是 **fully qualified class name（FQCN，全限定类名）**，它像类的完整地址，例如 `com.javaroadmap.stage01.day01outputvariable.App`。

**Minimal Code**：`package` 要写在源文件最前面（注释除外），并让目录与包名逐级对应。

```java
package com.javaroadmap.stage01.day01outputvariable;

public class App {
    public static void main(String[] args) {
        System.out.println("Hello Java");
    }
}
```

**Observe → Modify → Exercise → Real Usage**：先从 `existing_course/day01_output_variable/` 运行下面两条命令并观察输出，再只修改打印内容重新运行；最后解释为什么另一天也能有自己的 `App`。IntelliJ 中应把包含 `com/` 的课程目录作为 Sources Root，然后可直接点击 `main` 旁的绿色三角。

```powershell
javac -encoding UTF-8 -d out com/javaroadmap/stage01/day01outputvariable/App.java
java -cp out com.javaroadmap.stage01.day01outputvariable.App
```

## 现有内容怎么用

- `existing_course/day01_*` 到 `day06_*`：已有逐日示例，其中包含你的实际修改；每个 `day*` 目录是该课的源码根目录，Java 文件位于与 package 对应的 `com/javaroadmap/...` 下。
- `deep_dives/`：7 个概念深化课，按下面的主题导航进入；每篇含可运行示例。
- [结构化练习](existing_course/exercises/basic_syntax_exercises.md)：含边界用例、验收条件与分级提示；[随堂小练习](supplemental_exercises.md)仅用于语法热身，不必另做一轮完整课程。
- [`practice/`](practice/predict_and_modify.md)：预测与修改练习集，答案独立成档（[answers.md](practice/answers.md)），先预测再看。
- [`my_practices/`](my_practices/README.md)：你的独立练习区，验证脚本不检查这里。
- [实现参考答案](existing_course/answers/)：保留的练习实现；先自己写，再复盘，不要直接照抄。
- `existing_course/src/`：由完整示例演示成绩统计、猜数字、菜单和计算器。
- `mini_project/guess_number/`：早期控制台小项目，只作为综合练习，不计作简历项目。

### 概念深化导航

| 基础课程 / 遇到的问题 | 对应深化课 |
| --- | --- |
| [day01 输出与变量](existing_course/day01_output_variable/)：编译成功却不能启动 | [01 main 与 JVM](deep_dives/01_main_and_jvm/README.md) |
| [day02 类型与运算](existing_course/day02_data_type_operator/)：平均分丢失小数 | [02 整数除法与类型转换](deep_dives/02_integer_division/README.md) |
| [day05 数组](existing_course/day05_array/)：下标越界、共享数组 | [03 数组与内存](deep_dives/03_array_memory/README.md) |
| [day06 方法](existing_course/day06_method/)：方法内修改参数是否影响外部 | [04 参数传递](deep_dives/04_argument_passing/README.md) |
| [day04 循环](existing_course/day04_loop/)：少一次或多一次 | [05 循环边界](deep_dives/05_loop_bounds/README.md) |
| day06 方法：局部变量、返回值与职责 | [06 方法与作用域](deep_dives/06_method_scope/README.md) |
| [day03 分支](existing_course/day03_if_switch/)与菜单：非法输入、读取换行 | [07 Scanner 输入](deep_dives/07_scanner_input/README.md) |

从当天基础示例进入，只查当前问题的深化课，再做预测与独立练习；不需要把两套材料从头各读一遍。独立实现按练习内的验收清单验证；参考代码回归见根目录 [验证说明](../../scripts/README.md)。

## 推荐学习流程

每个概念都按“遇到什么问题 → 为什么需要 → 最小代码 → 先预测再运行 → 改一个条件 → 独立练习”学习；参考答案只用于练习后的比较。

1. 运行并解释 `existing_course/day01_*` 到 `day06_*`。
2. 不看答案完成成绩统计、计算器、循环菜单和方法拆分。
3. 用新的输入数据测试边界：空数组、除数为 0、非法菜单项。
4. 对照 `existing_course/mistakes.md` 记录自己的错误。
5. 完成一次代码复盘：命名、重复逻辑、输入校验。

## 算法与面试同步练

- 数组遍历、最大/最小值、前缀和概念。
- 双指针入门：有序数组两数之和。
- 面试：`==` 与 `equals` 的区别、基本类型与引用类型、`break` 与 `continue`、数组越界。

## 常见错误

- 把“示例能运行”当成“自己会写”。
- 在答案目录直接改参考代码，没有保留自己的实现过程。
- 使用整数除法计算平均值。
- 交互程序没有处理错误输入或退出条件。

## 完成标准

- [ ] 能不看示例独立写出 100 行以内的菜单程序。
- [ ] 能把成绩统计拆成多个方法并解释每个方法职责。
- [ ] 能完成并讲清有代表性的数组/循环练习，并用一例比较直接扫描与双指针。
- [ ] 能根据编译错误定位文件名、行号、符号和类型问题。
- [ ] 在根目录 [`真实学习进度.md`](../../真实学习进度.md) 记录完成证据，而不是只勾“读过”。

下一阶段：[Stage 02：Java 面向对象](../stage02_java_oop/README.md)
