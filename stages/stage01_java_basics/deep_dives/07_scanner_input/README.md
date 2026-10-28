# 深化课 07：Scanner 与非法输入——崩溃循环的根源

对应示例：`com/javaroadmap/stage01/deepdives/scanner/ScannerGuardDemo.java`

**运行后你会看到什么**：按提示输入字母会得到"这不是整数"并重新询问，而不是崩溃。看完本文你应该能解释"输入 abc 后菜单为什么无限报错"，并掌握两个防御模式。

## 场景

菜单程序 `loop.java`（你的练习答案）要求处理非法输入。现象通常是：输入字母 → 一串红色异常 → 菜单再次出现 → 再输入还是异常。**崩溃且反复崩溃**，这个"反复"才是理解的关键。

## 必须理解

Scanner 按**记号（token）**读取：默认以空白分隔。`nextInt()` 的工作方式是"看下一个记号，是整数就消费并返回，不是就抛 `InputMismatchException`"。两个关键事实推出所有现象：

1. **抛异常时坏记号没有被消费**——它还留在输入里。
2. 循环菜单再次调用 `nextInt()`，看到的还是那个坏记号 → 再次抛异常 → 无限循环。

这就是"崩溃循环"的完整解释，不需要任何玄学。

**两种防御**：

- **事前询问**：`scanner.hasNextInt()` 只回答"下一个记号是不是整数"，**不消费**；确认后再 `nextInt()`。适合循环菜单。
- **事后捕获**：`try/catch (InputMismatchException e)` 接住异常后，必须用 `scanner.next()` **把坏记号消费掉**，否则下一轮照样抛。

**心智模型**：输入像一个传送带，Scanner 站在旁边。`nextInt` 是个挑剔的质检员——发现不合格的包裹就罢工（抛异常），但**不把包裹扔下传送带**。任何防御的核心动作都是"把坏包裹取下来"。

## 理解原理：防御代码的形态

示例中的 `readIntInRange` 是菜单程序的标准模式，值得逐块理解而不是背：

```java
while (true) {
    if (scanner.hasNextInt()) {          // 事前询问，不消费
        int value = scanner.nextInt();   // 此时必然成功
        if (范围合法) return value;       // 唯一出口
        否则提示范围错误                   // 注意：合法数字越界 ≠ 坏记号，无需消费
    } else {
        scanner.next();                  // 消费坏记号——防御的核心一步
    }
}
```

try/catch 版本把 `InputMismatchException` 当作流程控制，能catch到但语义更绕；**它还顺手引出了 Stage 03 异常体系的正题**：异常用于"意外"，可预期的输入错误用条件判断更清晰。

**Observe（先预测再运行）**：运行程序选 1，输入 `abc`——hasNextInt 返回什么？选 2，输入 `a b`——两行输出分别是什么、为什么坏记号能被打印出来？

## 动手：修改一个条件

1. 把 `readIntInRange` 里 `scanner.next()` 那行删掉再运行并输入字母：发生什么？——亲手复现"崩溃循环"，确认你对根源的解释。
2. 把菜单程序的输入校验接上：给 `GuessNumber`（mini_project）加"非数字输入不崩溃"，这是阶段验收清单里的真实条目。

## 常见错误

- `nextInt()` 后接 `nextLine()` 读不到内容：`nextInt` 只消费了数字，**行尾的换行符还在传送带上**，被 `nextLine` 当成"空行"读走。标准处理：在 nextInt 后补一句 `scanner.nextLine()` 清掉行尾。这是 Scanner 最著名的坑。
- `catch (Exception e)` 一把抓：会掩盖真正的 bug（空指针等）；只捕获你明确知道如何处理的类型。
- 关闭 Scanner：一个程序只建一个 `Scanner(System.in)`，关闭时它连着 `System.in` 也被关了；传参复用而不是反复 new。

## 独立练习

在 `my_practices/` 改造计算器练习：`SimpleCalculator` 读入"数字 运算符 数字"，要求 ① 非数字输入不崩溃并重新询问；② 除数为 0 给提示而不是输出 Infinity；③ 运算符不是 +-*/ 时提示并重来。自检命令（从你的源码根运行）：

```text
echo "6 / 3"     | java -cp out 你的FQCN     → 结果：2.0
echo "6 / 0"     | java -cp out 你的FQCN     → 除数不能为 0（程序不崩溃）
echo "abc + 3"   | java -cp out 你的FQCN     → 重新询问（程序不崩溃）
```

## 与后面学习的联系

- `try/catch` 的完整规则（受检/非受检、自定义异常、资源关闭）在 Stage 03 [异常设计深化课](../../../stage03_java_core/deep_dives/03_exception_design/README.md) 展开；今天你只需要"只捕获可恢复的、知道如何处理的异常"这一条直觉。
- 交互程序自动化测试的思路（重定向输入 + 检查输出）就是 `scripts/fixtures/` 的工作方式——你现在可以读懂那些 fixture 文件了。
