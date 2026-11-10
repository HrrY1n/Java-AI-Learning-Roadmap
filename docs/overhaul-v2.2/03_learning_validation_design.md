# 03 · 独立学习验证机制设计（V2.2-P2）

> 目标：让验证不止于“平台能构建、示例代码跑得通”，而是真实考核学习者的**概念理解、故障 Debug、代码迁移**，并在核心课程建立四要素自我检核闭环——同时严格区分“题目与标准解析经过自动化测试验证”与“学习者个人真实掌握”。

## 一、机制结构与交付位置

| 模块 | 内容 | 站内访问与答案隔离方式 | 自动化保障 |
| --- | --- | --- | --- |
| 理解诊断 U1–U6 | 为什么 `byte c = a + b` 失败而 `10 + 20` 合法；跨包 `protected` 边界；引用值传递；`IntegerCache` + `hashCode`；`volatile` 非原子性与 `get()` 锁；`finally return` 吞异常与非守护池线程 | 收录于 `stages/practice/diagnostic_and_transfer.md`，经 `web/content/documents.json` (`diagnostic-and-transfer`) 可在网站搜索与直达阅读 | `web/scripts/diagnostic-semantics.test.mjs` 使用 locale 固定英文的 JDK 25 对所有带标记片段真跑编译报错与运行时输出验证 |
| Debug 排错 D1–D5 | `void` 误写构造器；正向 `for` 删除连续元素漏删；内部数组引用逃逸；多 `catch` 顺序 unreachable；局部变量做 `synchronized` 锁对象 | 同上 | 同上（D1/D4 实测触发精确 `javac` 报错，D2/D3 实测复现故障结果） |
| 代码迁移 T1–T4 | `ScoreBandAnalyzer`（防 `0`/`NaN`/非数字）、`LibraryCopy`（封装/不可变字段算 `hashCode`）、`ConfigLineParser`（按首个 `=` 拆/带行号报错）、`ParallelSumChecker`（固定线程池 + `Future` + `try-finally` + `long`） | 仅提供清晰行为契约，不预先给出完整源码骨架或代写答案 | 由学习者独立新建类用正常+边界+非法三类输入验收 |
| 参考解析与评判要点 | 全部 15 题的机制剖析与红线判据 | 置于 `stages/practice/answers/diagnostic_solutions.md`，注册为 Stage 04 `referenceDocuments`，网站点击自动显示 `· 主动解锁` 按钮并计入 `referenceViews`；**绝不进入 `catalog.documents`** | `diagnostic-semantics.test.mjs` 强断言解析文件不在公开文档中且必须走懒加载 |
| 四要素实践闭环 | 明确 ①需要掌握什么 ②通过什么行为证明理解 ③什么情况属于尚未掌握 ④针对错误如何复习 | 嵌入 Stage 01–05 全部 14 门带 `bodyPath` 连续讲义的课程末尾小节 | `diagnostic-semantics.test.mjs` 强断言 14 门讲义四要素齐全 |

## 二、为什么这不等同于“替学习者证明学会”？

- `diagnostic-semantics.test.mjs` 验证的是**教学材料本身的物理真实性**（比如 U1 真的会让 `javac` 报错、D4 真的报错 `already been caught`、U4 真的打印 `true|false|false`），杜绝教师/作者写出错误或过时题目；
- 真实学习者必须不看 `diagnostic_solutions.md` 自己作答并写迁移代码运行验证；点击参考解析会留下 `referenceViews` 本地证据记录；任何情况下系统或 AI 都不会将用户未验证项自动勾为“已掌握”。
