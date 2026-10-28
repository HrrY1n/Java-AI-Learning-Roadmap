# 深化课 03：异常体系——什么错误用异常，什么错误不用

对应示例：`com/javaroadmap/stage03/deepdives/exceptiondesign/ExceptionDesignDemo.java`
配套对照参考：`stages/stage03_java_core/existing_course/src/main/java/com/javaroadmap/stage03/common/Result.java` 与同目录树下的 `exception/BusinessException.java`

**运行后你会看到什么**：4 行输出，覆盖三种错误表达方式。看完本文你应该能为任何一个"失败场景"选择正确的表达方式并说明理由。

## 场景

day01 学了 try/catch 语法。但写 `StudentService` 时会陷入选择困难："学生不存在"该抛异常、返回 null、还是返回 `Result.fail`？选错不是风格问题：滥用异常会把正常流程变成控制流，滥用 null 会把失败静默传播到很远的地方才炸。

## 必须理解

Java 的错误表达有三种，判据是**调用方能不能处理、以及"失败"是不是这个操作的正常部分**：

| 表达方式 | 适用场景 | 例子 |
| --- | --- | --- |
| 返回值（`Result<T>`、`boolean`、null+文档） | 失败是**常规分支**，调用方理应处理 | 按 id 查学生没查到 |
| 受检异常（`extends Exception`） | 可预期、调用方**必须表态**才能编译通过 | 文件不存在、日期格式错 |
| 非受检异常（`extends RuntimeException`） | 编程错误或现场**无法处理** | 除零、空指针、`IllegalArgument` |

**心智模型**：把程序想象成邮局。返回值是"正常投递，但可能有退件单"；受检异常是"必须签收的挂号退件"；非受检异常是"房子塌了"——没人能在邮局柜台处理房子塌了，让它炸到该处理的人面前。

**两条硬纪律**：

1. **catch 只捕你能（有方案）处理的异常**。空 catch 块是代码里的黑洞——错误消失了，问题还在。
2. **转换异常类型时保留原因**：`new ParseException(msg, 0)` 应带 cause（示例简化了；生产写法 `new XxxException(msg, e)`），否则底层堆栈丢失，排错断线索。

## 理解原理：checked 与 unchecked 的机制差异

编译器对 `throws ParseException` 的方法**强制**调用方二选一：catch 或继续 throws 声明下去。这就是"必须表态"的实现机制。`RuntimeException` 及其子类不检查——于是它们能一路炸到 main，带完整堆栈终止程序。

`BusinessException extends RuntimeException`（src 里的参考实现）的选择理由：**业务规则失败在分层间传播时，让每层都写 throws 会淹没签名**；Service 捕获它转成 `Result.fail`，是"在正确的层表态"。读 `StudentService.addStudent` 的 try/catch 对照本课三分法。

**Observe（先预测再运行）**：预测 4 行输出。然后回答：如果 `findStudent(99)` 的调用方忘了判 null，错误会在哪一行、以什么形式暴露？

## 动手：修改一个条件

1. 把 `findStudent` 改为返回 `Result` 风格（写个两行的 `Result<String>` 内部类，success+data / fail+message）：main 的分支怎么变？对比两种 API 哪个让"忘记处理失败"更难发生。
2. 把示例 4 的 try/catch 整段删掉直接调 `divide(10, 0)`：程序在哪终止？堆栈里第一个你自己的类是哪一行？——这就是"让编程错误炸出来"的默认形态。

## 常见错误

- `catch (Exception e) {}`：吞掉一切，包括你没预料到的 bug。
- 用异常做流程控制（循环里 try/catch 当 break 用）：性能与可读性双输。
- 捕获后只 `e.printStackTrace()` 就继续跑：状态可能已不完整，后续行为不可预测。

## 独立练习

在 `my_practices/` 给 `StudentService`（复制 src 版或自写精简版）设计失败表达：`addStudent` 重复 id → `Result.fail`；`parseScore(String)` 非数字 → 受检异常；内部把 `score` 除以 `count` 求"人均加分数"（count 可能为 0）→ 交给非受检异常暴露。每种选择写一行理由注释。自检：三种路径各自触发一次，观察三种不同的暴露形式。

## 与后面学习的联系

- Stage 06 的 `@ControllerAdvice` 全局异常处理，就是把"炸到顶层后统一表态"框架化——今天的三分法决定每类异常"炸到哪层"。
- Stage 05 数据库事务回滚通常由 RuntimeException 触发：异常分类在那时有了真金白银的后果。
