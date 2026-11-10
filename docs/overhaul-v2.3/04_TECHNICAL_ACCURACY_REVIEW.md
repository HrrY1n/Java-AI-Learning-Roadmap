# 04 · 技术准确性深度审查（V2.3）

> 方法：六维审计代理逐条核对正文声明与 JLS / 官方 API / MySQL 8.0 官方语义；**全部 61 门主线课与 29 门算法课 Java 代码在 JDK 25.0.3 实测编译运行**；Git 专题 14 门在真实 Git 2.5x 沙箱跟做；并发/预测题由 `prediction-semantics` 与 `exercise-java` 测试在真 JVM 上强制复现。以下按领域汇总"查了什么、发现了什么、修了什么、剩什么"。

## 一、Java 语言基础

**核对依据**：JLS §3.10.5（字符串字面量）、§4.12.5（数组默认值）、§5.2（常量窄化）、§5.6.2（二进制数值提升）、§15.7/§15.17（求值顺序与除法）、§16（明确赋值）、§17.4.5（happens-before）。
**实测底账**：day02 的 0.1+0.2、`(int)'A'`、13!/int 绕回 `1932053504`、`Math.addExact` 消息、B1 修改版五行输出全部实跑核对；day01 `1+2+"3"+4`=334、JLS §16 definite-assignment 错误按新 Modify 指令复现。
**本轮修复的准确性错误**：
1. `deep02:50` "(int) sum * 1.0 / count 换数据就会出错"——错误结论（int 时 `(int)` 恒为空操作），已改写为精确表述（int 无害 / double 时截断）。
2. `s02-string-common-api` 字面量 `==`"可能为 true"——与 JLS §3.10.5 方向不符（同类字面量**保证**同一池对象），已改写并保留"工程上仍只用 equals"的实践建议。
3. `day01 App.java:10` 与 `day07 App.java:7` 两处 Modify 注释承诺的实验不存在——改为指向真实可复现的操作。
4. `answers.md` B1 对比数值笔误（3→13）——已发布答案错误，实测修正。
**剩余**：无已知错误。

## 二、面向对象

**核对依据**：JLS §6.6.2（跨包 protected）、§8.1.1（顶层类）、§8.8.9（默认构造器）、§12.4/§12.5（类与实例初始化）。
**实测底账**：`s02-static-lifecycle` 四文件多包 protected 实验逐字复现（"gradeNote 是 protected 访问控制"/"internalTag 不是公共的"）；`s02-object-construction` 的 §12.5 五步顺序、`this(...)` 首行限制全部核对。
**本轮修复**：补"字段不参与多态"（字段按静态类型解析）——新增可运行 `FieldShadowDemo` 并入回归；polymorphism-basics 的 Robot 反例冲突消除；3 处 relatedLessonIds 断链。
**剩余**：Java 9 private 接口方法未提（属可选进阶，记入遗留）。

## 三、核心 API

**核对依据**：`ArrayList.remove` 重载、`Integer` 缓存 -128..127、HashMap 树化阈值 8/64 与退化 6、CME 与 `Iterator.remove`、异常分类与 cause 链、`try-with-resources` 逆序关闭、Stream 惰性求值。
**实测底账**：day01_arraylist 漏删/`remove(int)` vs `remove(Object)`、IntegerCache 输出实跑吻合；s03-hashmap 树化表述准确；utf8-io 9 字节/GBK 乱码形态/JDK17 GBK vs JDK18+ UTF-8 默认值差异准确。
**本轮修复**：hashmap 课补 Map 版 CME 边界；hashset 补去重机制；lambda 补 effectively final 与捕获语义（含"为什么这样设计"）；excellent-stats 参考答案改 `IntStream.range` 兑现自身 Javadoc；email-csv 答案补 email 非空校验。
**剩余**：泛型 CCE 未在示例中真实触发（注释级说明，记为低优先）。

## 四、并发（JMM）

**核对依据**：JLS §17.4.5 happens-before 全表（volatile 写→读、monitor unlock→lock、`Thread.start()`、`Thread.join()`、程序顺序）。
**实测底账**：丢更新实验两次实跑 12.4 万/12.9 万与文档区间吻合；三门练习参考答案 12 用例确定性输出全部复现（新契约含实际线程名集合排序输出，仍 100% 确定）。
**本轮修复**：`Thread.start()` HB 与程序顺序规则显式成文；jstack 排障对照写入概念卡；`shutdownNow` 与 `Future.cancel/超时 get` 补路标；练习契约升级为**真结构不变量**（实际累加线程排序清单 / `pool-` 前缀判定），串行伪装实现不再能逐字通过。
**剩余**：ABA 与 `AtomicStampedReference` 已在 s04-concurrent-tools 有表述，无需扩展。

## 五、MySQL 8.0 / InnoDB / JDBC

**核对依据**：MySQL 8.0 官方语义——CHECK 8.0.16 分界（错误码 3819）、1062/23000、1452、`REPEATABLE READ` MVCC 快照读 vs Next-Key Lock 当前读、唯一索引多 NULL、`EXPLAIN` 统计估算、Connector/J `useServerPrepStmts` 默认行为。
**实测底账**：今日在隔离容器（MySQL 8.0.46，3307）重跑 `verify_mysql.sh` 全 6 程序通过——CRUD 一致性、1062 拦截、3819 CHECK、批量事务回滚（回滚后 id=20 为 null）全部真实复现。
**本轮修复**：UNIQUE 多 NULL 语义成文；`EXPLAIN` 计划波动声明 + `ANALYZE TABLE` 作用解释；"先发 ? 模板给数据库解析编译"改为结构分离表述并注明驱动侧/服务端预编译差异（防注入结论两种模式均成立）。
**剩余**：MySQL 版本矩阵中 5.7 的行为差异只在 CHECK 一处展开（设计如此：课程锚定 8.0）。

## 六、Git

**核对依据**：真实 Git 2.5x 行为（Git Bash）。
**实测底账**：14/19 门在临时仓库逐步跟做验证（amend、reset 三模式、reflog 救援、rerere、子模块 protocol.file、冲突标记、bisect 自动定位等）；本轮 6 门薄课扩写的全部输出来自真实沙箱（日志 `.audit-work/v23/git-sandbox-*.log`）。
**本轮修复**：`init.defaultBranch` 依赖成文（含克隆空仓库默认 master 的实测行为）；`git commit --allow-empty` 分叉步骤；hunk 合并规则（≤6 行间隔并 hunk，实测复现并修正原课不严谨断言）；rebase-interactive 计数矛盾。
**剩余**：bookReference 的 PDF 页码区间未对照原书核验（V1.4 已有页码核对测试约束，保持信任）。

## 七、总体结论

审计共发现**已发布内容中 3 处确定性技术错误**（deep02 优先级结论、String `==` 方向、git 步骤不可复现）+ 2 处已发布答案错误（B1 数值、calculator 文案不齐）+ 若干"承诺的实验不存在"类注释失真——**全部在 R1/R2 修复并经真 JDK/真 Git/真 MySQL 复验**。未发现为丰富内容而编造、无法解释的细节。
