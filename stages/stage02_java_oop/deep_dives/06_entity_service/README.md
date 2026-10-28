# 深化课 06：Entity 与 Service 的职责边界——为什么 main 不该写业务

对应示例：`com/javaroadmap/stage02/deepdives/entityservice/EntityServiceDemo.java`
配套对照参考：`existing_course/src/main/java/com/javaroadmap/stage02/student/`（同一结构在完整示例中的样子）

**运行后你会看到什么**：4 行输出，其中第 3、4 行证明非法学生进不了系统、且失败如何呈现由入口层决定。看完本文你应该能把任意一段代码归类到"入口 / Entity / Service"，并说明理由。

## 场景

Stage 01 的程序把所有逻辑写在 main 里也能跑。Stage 02 的三个参考示例却拆成了 `Student` + `StudentService` + `StudentManagementApp`。如果不理解**为什么拆**，学到 Spring 时就会把 `Controller` 写成三百行——因为"反正能跑"。

## 必须理解

三层各自回答一个问题：

| 层 | 回答的问题 | 判断标准 |
| --- | --- | --- |
| Entity（Student） | 业务里**有什么东西**？它自身守什么规则？ | 换掉控制台、换掉数据库，这些类不变 |
| Service（StudentService） | 业务**能做什么事情**？ | 只依赖 Entity 与其他 Service，不认识 Scanner/System.out |
| 入口（App/main） | 这次**怎么用**这些事情？ | 组装、调用、展示；可以随时扔掉重写 |

**判断法一句话：把控制台界面换成网页，哪些代码原样保留？** 保留的都是业务（Entity/Service）；扔掉的（菜单循环、println）都是入口。

**心智模型**：Entity 是名词与它的天性行为（学生有分数、分数不能超 100）；Service 是动词（录取一个学生、统计优秀名单）；main 是"今天用这些名词动词办一件事"的临时脚本。

## 理解原理：为什么 Service 不该 println

示例里 `excellentNames()` 返回名单而不是直接打印。这不是洁癖：

1. **同一份业务答案有多种消费者**：控制台要打印，未来的 Web 接口要转 JSON，测试要断言——只有"返回数据"能同时服务三者。
2. **可测试**：返回值能被自动验证；`System.out` 只能靠人眼（或重定向，就是 `scripts/` 干的事）。
3. **职责单一**（呼应 Stage 01 [方法深化课](../../../stage01_java_basics/deep_dives/06_method_scope/README.md)）：显示方式变化不应迫使业务代码改动。

"分数 0~100" 放在 Entity（构造器校验）而不在 Service：因为**这是学生自身的天性行为**，无论谁来创建学生都该成立。而"优秀线 90 分"放 Entity 的 `isExcellent()` 或 Service 均可——判断标准是"这是单个学生的属性，还是一组学生的政策"，本例两种都讲得通，**能说出理由比站对位置更重要**。

**Observe（先预测再运行）**：预测 4 行输出；回答：为什么 `try/catch` 放在 main（入口层），而不是让 `StudentService.add` 吞掉异常返回 false？（提示：对比两种做法下，"调用方能否知道失败细节"与"Service 是否绑定了某种呈现方式"。）

## 动手：修改一个条件

1. 把"优秀线"从 90 改成 85：你改了几个文件？如果是 Service 层的政策，是否应该只动 Service？
2. 新增 `findByName(String name)`：它属于 Entity 还是 Service？为什么（提示：查"一个"还是查"一组"）？

## 常见错误

- Service 里出现 `Scanner`/`System.out.println`：它被入口绑死了，无法被 Web 或测试复用。
- Entity 变成纯数据袋（全 getter/setter 无规则）：回到"公开字段"时代，见 [封装深化课](../03_encapsulation_why/README.md)。
- 入口层写 `if (score >= 90)` 这类业务规则：规则应下沉，入口只组装展示。

## 独立练习

在 `my_practices/` 把"图书借还"按三层重写（先只写内存版）：`Book`（有 `borrowed` 状态与"不能重复借出"规则）、`LibraryService`（`borrow(title)`、`giveBack(title)`、`availableCount()`）、`LibraryApp`（菜单入口）。自检：重复借同一本书第二次必须失败且有提示；Service 中不得出现任何 `System.out` 以外的输出（允许返回 boolean/描述字符串，由入口打印）。

## 与后面学习的联系

- Stage 03 会把 `ArrayList` 替换成 `StudentRepository` 接口（内存/文件两个实现），Service 层一行不改——[Repository 演进深化课](../../../stage03_java_core/deep_dives/06_repository_evolution/README.md) 完整重走这条重构路。
- Stage 06 的 `Controller/Service/Mapper` 就是今天三层换上框架名字：Controller=入口，Service=业务，Mapper=存取。
