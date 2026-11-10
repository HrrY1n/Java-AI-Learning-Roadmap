# 06 · 真实学习路径端到端验证（V2.3 · 2026-11-11）

> 两条模拟学习者路径都实际操作了：**网站课程（生产 preview 构建）→ 示例代码 → 本地编译运行 → 练习入口 → 相关跳转**，不是只读目录。网页走查用 Playwright 脚本（`.audit-work/v23/journey.mjs`）在生产 preview（`vite preview`，非 dev server）上执行，逐页采集 console 错误 / pageerror / HTTP≥400 并截图（`.audit-work/v23/journey/*.png`）。

## 〇、先暴露验证环境自身的坑（与任务书 3.2 的警告直接相关）

第一次走查时页面显示的是**旧契约内容**。排查发现：4173 端口被基线验证阶段残留的旧 preview 进程占用（`--strictPort` 启动失败但 curl 仍探活成功），走查实际打在旧构建上。核验 PID/命令行后清除旧进程、重启 preview 重跑。**教训已固化**：本轮起所有"探活"必须同时核对响应内容指纹（如新契约行），端口探活通过不等于服务是新的。

## 一、场景 A：Java 初学者（Stage 01 起步）

**走查路径**：首页 → 知识地图 → day01 输出与变量 → day02 数据类型 → day03 条件分支 → day04 循环 → day05 数组 → day06 方法 → day07 基本类型 → 练习 scores/calculator/menu → deep02 深化课。

**结果**：24 页全部渲染，**0 console 错误、0 pageerror、0 HTTP≥400**；每课步骤卡、预测题入口、代码文件展示正常；day03 连续正文与"短路求值"预测 A8（本轮已重写为无数组依赖）直接可完成；day07 类型课正文与 JLS 边界实验齐全。

**本地命令验证**（按 `stages/stage01_java_basics/README.md` 第 50-53 行原文逐字执行）：

```text
javac -encoding UTF-8 -d out com/javaroadmap/stage01/day01outputvariable/App.java
java -Dstdout.encoding=UTF-8 -cp out com.javaroadmap.stage01.day01outputvariable.App
→ 姓名：小明 / 学校：青云大学 / 城市：济南 / 年龄：18 / 明年年龄：19 / 334
```

与课程预测步骤宣称的输出一致（`1 + 2 + "3" + 4` = `334` 是 A2 的对照点）✓。

**发现的初学者体验问题（按严重度）**：

| # | 问题 | 状态 |
| --- | --- | --- |
| A-1 | day01/day02 的练习（scores/calculator）需要 day05/day06 的数组与方法知识，页面练习入口可点但题面未提示"先学完哪几课" | **已修复（R1）**：练习↔课程双向关联补齐（scores.lessonIds 现含 day01/day02 等 9 课），学习者在练习页能看到关联课程图谱 |
| A-2 | day02 修改题要求对照 char 与 String，但示例无 String 输出可对照 | **已修复（R1）**：A8/题面机制在 R1 全量对齐；char 对照依赖预测 A7（char 与 int），可接受 |
| A-3 | for 三段时序 / `new int[n]` 默认值 / 方法声明语法此前只存在于代码注释 | **已修复（R2）**：deep05/deep03/deep06 新增机制小节 |
| A-4 | 知识地图页用"01 Java 基础"而非"Stage 01"字样 | 不改：品牌化命名一致且导航清晰 |

## 二、场景 B：有语法基础的学习者（Stage 03 集合/异常 → Stage 05 数据库）

**走查路径**：s03-arraylist → s03-exception → s03-file-read → s03-repository-evolution → 练习 s03-delete-student → s05-sql-basics → s05-relational-design → s05-transactions-acid → s05-indexes-explain → s05-jdbc-dao → 练习 s04-safe-counter（结构不变量）。

**结果**：全部渲染零错误。关键衔接点验证：
- `s03-file-read` 页面可跳 `s03-utf8-io`（R1 补的 relatedLessonIds）✓
- `s05-jdbc-dao` 页面显示 MySQL Connector/J `-cp` 驱动提示与 `db.local.properties` 配置指引 ✓（R1 补 UNIQUE 多 NULL/预编译差异说明后正文完整）
- `lab/s04-safe-counter` 显示新契约"实际累加线程（排序去重）：[counter-worker-…]"，`lab/s04-thread-pool-lab` 显示"执行线程名（排序去重）"，`lab/s03-email-csv` 显示新增"score 非数字"用例 ✓

**本地数据库实操（隔离 Docker MySQL 8.0.46，端口 3307，容器 `jrl-mysql-v22`）**：

```text
JRL_MYSQL_URL="jdbc:mysql://127.0.0.1:3307/javaroadmap_lab_test?..." \
JRL_MYSQL_USER=root JRL_MYSQL_PASSWORD=<测试口令> \
bash stages/stage05_mysql_db/scripts/verify_mysql.sh
→ == 全部 Stage 05 MySQL 课程与 6 阶段连续项目实测通过 ==
```

6 个程序全过：内存版/文件版/JDBC CRUD 一致、唯一约束拦截（1062 语义 → `IllegalArgumentException`）、批量写入事务回滚（回滚后 `id=20` 确认为 null）、`utf8mb4` 中文入库。凭据来自容器环境变量（`jrl_local_test_pw`，仅本地隔离测试库），零硬编码入仓。

**发现的问题**：走查未发现阻断性缺口；R1 已把场景 B 依赖的 4 处说明缺口（UNIQUE 多 NULL、EXPLAIN 估算声明、驱动预编译差异、8GB 资源成本）补进正文。

## 三、结论与保留事项

1. 两条路径在"读课 → 预测 → 本地运行 → 练习 → 迁移"全链路无阻断、无知识断档（R1/R2 修复后）。
2. 诚实声明：这是**模拟走查**（AI 扮演学习者视角 + 自动化验证），不能替代真人学习效果测试；效果断言仅限"链路完整、内容自洽、命令可跟做"。
3. 残留可改进（记入 `13_REMAINING_ISSUES.md`）：`#/practice` 预测中心与 `#/lab` 实验室的命名对初学者不够自明（页面内有指引，属打磨项）；day07 仍无结构化 Web 练习。
