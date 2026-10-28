# 深化课 04：UTF-8 与文件 IO——"字符"如何变成磁盘上的"字节"

对应示例：`com/javaroadmap/stage03/deepdives/utf8io/Utf8IoDemo.java`
配套对照参考：`existing_course/src/main/java/com/javaroadmap/stage03/student/FileStudentRepository.java`

**运行后你会看到什么**：6 行输出，其中第 4 行是故意用错编码表的"乱码现场"。看完本文你应该能解释乱码的产生机制、说清相对路径相对于谁，并理解 `try-with-resources` 解决什么问题。

## 场景

`FileStudentRepository` 每一行都写了 `StandardCharsets.UTF_8`。不写行不行？大多数时候行（JDK 18+ 默认 UTF-8），**但 Windows 上 JDK 17 默认还是 GBK**——同一个文件在一台电脑读写正常、另一台乱码。数据可靠性不能建立在"大多数时候"上。

## 必须理解

**文件里只有字节，没有字符。** 字符集（charset）是"字节 ↔ 字符"的翻译表：

```text
写入：'小' --UTF-8 表--> 3 个字节    读取：3 个字节 --UTF-8 表--> '小'
```

两个方向用**不同的表**，得到的就是乱码（示例第 4 行）或异常。乱码的字节**已经**是错误解读的结果——部分损坏无法自动恢复，所以纪律是：**同一份数据的整个生命周期（写、传、读）使用同一张表，并显式声明**。

**心智模型**：字符集不是"文件的属性"，是**读写两端共同的约定**。约定写进代码（`StandardCharsets.UTF_8`），而不是依赖机器默认值——这跟"接口约定"是同一种工程思想。

## 理解原理：相对路径相对谁、资源为什么必须关闭

**相对路径**：`Paths.get("utf8_demo.txt")` 解析的基准是**进程启动目录**（`java` 命令执行时所在的目录），不是源文件目录，也不是类文件目录。验证脚本把工作目录设为课程源码根，就是为了这个（`day02fileread` 读的就是相对路径）。文件写到哪、去哪读，用 `path.toAbsolutePath()` 打印确认，不要靠猜。

**try-with-resources**：`new BufferedReader(...)` 放进 `try (...)` 括号里，作用域结束（无论正常结束还是抛异常）自动调用 `close()`。传统写法的 `close()` 在异常路径上可能被跳过——文件句柄泄漏，程序开久了"打不开新文件"。凡是实现了 `AutoCloseable` 的资源（流、连接），一律用这个语法。

**Observe（先预测再运行）**：预测第 2 行"7 个字符"对应多少字节（提示：UTF-8 里 ASCII 字符 1 字节、常用汉字 3 字节）；预测第 4 行乱码的**形态**（问号？生僻汉字？还是直接抛异常）——乱码形态取决于两张表的差异，答案不唯一，重点是能解释。

## 动手：修改一个条件

1. 把写入改成 GBK、读取保持 UTF-8：运行后第 3 行输出什么？把这对"写入编码/读取编码"组合记录成你的乱码对照表。
2. 把 `Paths.get("utf8_demo.txt")` 改成 `Paths.get("data", "utf8_demo.txt")`（data 目录不存在）再运行：观察行为，对照 `FileStudentRepository.writeAll` 里的 `Files.createDirectories`——它就是为这个场景存在的。

## 常见错误

- 用默认字符集 `new String(bytes)`（不带 charset 参数）：机器相关，两台电脑结果可能不同。
- 读文件忘记处理 `IOException`：文件不存在是**可预期的常规失败**，按 [异常设计深化课](../03_exception_design/README.md) 应该有明确表达。
- 只在 Windows 上验证过文件程序：macOS 默认大小写敏感度、路径分隔符不同，用相对路径 + 显式 UTF-8 是跨平台底线。

## 独立练习

在 `my_practices/` 写 `NotesStore`：`addNote(String)` 追加一行到 `notes.txt`（UTF-8），`readAll()` 返回全部笔记，`clear()` 删除文件。自检：添加含中文与 emoji 的笔记各一条，删库重建后内容一致；连续运行两次程序，旧笔记仍在（追加而非覆盖，对照 `day04simplenote` 的 `StandardOpenOption.APPEND`）。

## 与后面学习的联系

- Stage 05 的 MySQL 建表同样要选字符集（utf8mb4）：今天"全程一张表"的原则原样迁移。
- Stage 06 的 `application.yml` 配置文件、日志文件编码问题，排查思路与本课相同：先确认两端约定，再查数据本身。
