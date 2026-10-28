# 深化课 06：Repository 演进——接口这一步买到了什么

对应示例：`com/javaroadmap/stage03/deepdives/repoevolution/RepositoryEvolutionDemo.java`
配套对照参考：`stages/stage03_java_core/existing_course/src/main/java/com/javaroadmap/stage03/student/`（接口 + 内存/文件双实现的完整版）

**运行后你会看到什么**：两行统计输出——同一套业务代码分别跑在"真仓库"和"空仓库"上。看完本文你应该能解释 `StudentRepository` 接口存在的理由，并重述"数组 → List → 接口"每一步解决什么问题。

## 场景

Stage 01 的成绩统计用数组；Stage 02 换成 `ArrayList`；Stage 03 突然出现接口和两个实现类。如果只当它"更高级"，Spring 的 `@Mapper`、`@Service` 就永远只是咒语。本课把每一步的**动机**摆出来：每一步都在解决上一步的具体痛点，不是为模式而模式。

## 必须理解：三级演进各买到了什么

| 阶段 | 存储写在哪 | 解决了什么 | 遗留问题 |
| --- | --- | --- | --- |
| 1. 数组 | Service/main 内部 | 能跑 | 长度固定、增删要自己搬元素 |
| 2. `ArrayList` | 还是 Service 内部 | 增删自动、容量自动 | 换成文件存储 = 重写 Service；离开内存数据全丢 |
| 3. 接口 + 实现 | 实现类里 | **存储可替换、业务零改动**；可插入假实现做测试 | （Stage 05 用数据库实现继续替换） |

第 3 级的关键动作只有两个：把"存、查、列"三个动作**提炼成接口**；Service 通过**构造器接收**接口（组合，见 Stage 02 [继承与组合](../../../stage02_java_oop/deep_dives/04_inheritance_composition/README.md)）。此后"数据放哪"成为可插拔零件：内存版适合演示与测试，文件版适合单机练习，Stage 05 的 MySQL 版适合真实项目——`StudentService` 一个字不改。

**心智模型**：接口是"电源插座规格"，实现是不同电厂。电器（Service）只认插座规格；换电厂（内存 → 文件 → MySQL），电器照常运转。

## 理解原理：假实现的价值

示例的 `AlwaysEmptyRepository` 是**测试替身**（test double）的雏形：它让"业务逻辑在数据为空时是否正确"可以被单独验证——`findNameById(2)` 返回 `(不存在)`、平均分返回 0，业务代码的边界行为一览无余。如果 Service 写死了 `new ArrayList<>()`，这些验证只能连着真实存储一起做，慢且互相干扰。**"依赖接口"的收益不只是换实现，更是可测试**——这是 src 完整版里 `StudentService(StudentRepository repository)` 构造器参数的真实意义。

**Observe（先预测再运行）**：预测两行输出（第二次 runWith 的人数、平均分各是多少）；再把 `AlwaysEmptyRepository` 的 `save` 改成抛 `UnsupportedOperationException`，验证你的预测：哪一行代码先崩？

## 动手：修改一个条件

1. 给 `StudentRepository` 接口加一个方法 `deleteById(int id)`：必须改几个文件？（接口 + 两个实现——体会"改约定"的传播成本，所以约定要稳定、抽象要在理解需求后提炼。）
2. 把 `ListStudentRepository` 的 `findAll()` 改成 `return students;`（直接把内部列表交出去）：在 runWith 里对返回列表做一次 `clear()`，再统计人数——内部状态被外部改掉了（呼应 Stage 02 [引用深化课](../../../stage02_java_oop/deep_dives/01_reference_state/README.md)）。这就是 src 版 `findAll()` 返回新列表的原因。

## 常见错误

- 接口方法越来越多（查询、排序、导出全塞进去）：Repository 只管"存取"；加工是 Service 的事。
- Service 里 `new XxxRepository()` 写死实现：白建了接口，替换与测试全部失效。
- 实现类之间互相调用或共享状态：每个实现应自洽，互不知晓。

## 独立练习

在 `my_practices/` 为你的"图书借还"（Stage 02 练习）补上这一级演进：提炼 `BookRepository` 接口，先只写内存实现；再写一个 `ShrinkingBookRepository`（每次 `findAll` 后库存自动减一）模拟故障源，验证 Service 对"数据消失"的表现。自检：两种实现切换时，`LibraryService` 文件零改动。

## 与后面学习的联系

- Stage 05：`StudentRepository` 换成 MySQL 实现（同一接口，SQL 在实现里），是本课的第三次替换。
- Stage 06：Spring 的 `@Autowired` 就是"构造器接收接口"的自动化版本；MyBatis 的 Mapper 接口连实现类都由框架生成——你现在已经知道框架在替你做哪一步。
