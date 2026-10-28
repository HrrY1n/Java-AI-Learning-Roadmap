# Stage 03：Java 核心能力

状态：**已有完整示例，练习未完成**　优先级：**P0-J**

## 为什么要学

集合、泛型、异常、IO、Lambda 和 Stream 是企业 Java 代码的日常语言。本阶段把学生管理从数组升级为集合与文件持久化，同时训练 Repository/Service 分工。

## 前置知识

- 完成 Stage 02 的 OOP 综合练习。
- 能定义类、接口、构造器和业务方法。

## 必须掌握（P0）

- `List`、`Map`、`Set` 的选择与基本复杂度。
- 泛型集合与 `Result<T>`。
- checked/unchecked 异常、自定义业务异常、可靠的错误处理。
- UTF-8 文本 IO、路径与资源关闭。
- Lambda、Stream 的 `filter` / `map` / `collect` / 聚合。
- Repository 与 Service 的职责。

## 了解即可（P1）

- `Optional`、不可变集合、NIO 的更多能力。
- Stream 性能与副作用风险。

## 暂时不用深入（P2）

- 响应式流、复杂序列化框架、分布式文件系统。

## 当前目录与运行方式

`existing_course/examples/legacy_fundamentals/` 下每个 `day*` 目录都是一个独立 lesson 的源码根目录；其内部 `com/javaroadmap/...` 与 Java 文件的 package 一一对应。第五天的 `App` 和 `Student` 属于同一个 package，需要一起编译：

```powershell
Set-Location existing_course/examples/legacy_fundamentals/collections_generics/day05_student_management_list
javac -encoding UTF-8 -d out com/javaroadmap/stage03/collections/day05studentmanagement/App.java com/javaroadmap/stage03/collections/day05studentmanagement/Student.java
java -cp out com.javaroadmap.stage03.collections.day05studentmanagement.App
```

IntelliJ IDEA 中将具体的 `day*` 目录作为 Sources Root 后运行包内 `main`；`existing_course/src/main/java/` 下的完整学生系统以 `src/main/java` 为 Sources Root。不同 lesson 的 `App` 或 `Student` 由不同 package 隔离，不会在整体构建时互相冲突。

## 现有内容怎么用

- `existing_course/src/`：内存/文件 Repository、Service、`Result<T>`、业务异常与 Stream 的完整参考示例（回归由 `scripts/` 保护，扩展练习先复制到 my_practices）。
- [`deep_dives/`](deep_dives/01_choose_collection/README.md)：6 个核心深化课（集合选择、泛型、异常设计、UTF-8 与 IO、Lambda/Stream、Repository 演进），含方案取舍与可运行对照实验。
- `existing_course/exercises/`：结构化扩展练习（删除/改分/筛选/持久化，含错误输入与分级提示）。
- [`practice/`](practice/predict_and_modify.md)：预测与修改练习集，答案独立成档（[answers.md](practice/answers.md)）。
- [`my_practices/`](my_practices/README.md)：你的独立练习区（先复制参考实现再扩展）。
- `existing_course/examples/legacy_fundamentals/`：集合、异常/IO、Lambda/Stream 的早期最小示例。
- `existing_course/answers/`：文件持久化参考答案，完成练习后再看。

`existing_course/` 中的 `summary.md`、`mistakes.md` 等是保留的原课程记录，其中旧目录名和“下一阶段”文字不作为当前路线入口；阶段顺序始终以根目录 [学习执行计划](../../学习执行计划.md) 和 [统一学习路线](../../统一学习路线.md) 为准。

## 推荐学习流程

每个概念都按“数据/失败场景 → 选择理由与心智模型 → 最小代码 → 观察边界 → 改一个条件 → 独立实现 → 在学生系统中复用”学习。

1. 先完成集合最小练习，能说出 List/Map/Set 的选择理由。
2. 不看参考答案实现删除、修改分数和 email 持久化。
3. 为非法 id、重复 id、损坏文件行设计测试输入。
4. 用 Stream 和普通循环分别实现筛选，比较可读性。
5. Code Review Repository/Service：哪些异常该在何处转换？

## 算法与面试同步练

- 哈希表、链表、栈、队列、二叉树 BFS/DFS 入门。
- 二分、双指针、滑动窗口的基础模板。
- 面试：ArrayList/LinkedList、HashMap/HashSet、泛型擦除、异常体系、IO 与 NIO、Stream 惰性求值。

题目属于根目录执行计划的算法并行线，不要求仓库提前创建题单或追踪系统；完成代表问题时保留自己的代码和复杂度解释即可。

## 常见错误

- 只会调用集合 API，不理解适用场景和复杂度。
- 空 `catch`、用 `null` 隐藏错误、文件格式不校验。
- 直接改参考实现而没有自己的 TODO 版本。
- 为了“一行 Stream”牺牲可读性。

## 完成标准

- [ ] 独立完成阶段四个练习并为边界情况写验证步骤。
- [ ] 能解释 HashMap 的使用场景和基本原理。
- [ ] 能将对象可靠写入文件并处理损坏输入。
- [ ] 能解释 `Result<T>`、业务异常、Repository/Service 的职责。
- [ ] 完成并记录与本阶段相关的哈希、栈/队列代表题；树与 BFS/DFS 按算法并行线继续推进。

上一阶段：[Stage 02](../stage02_java_oop/README.md)　后续阶段见根目录 [统一学习路线.md](../../统一学习路线.md)。
