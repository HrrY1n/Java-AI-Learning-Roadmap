# 07 · Stage 05 数据库实践体验（V2.3）

> 原则：不为把练习塞进网页而编造假数据库执行结果。Stage 05 的在线部分是**课程 + 预测/修改题**；真实 SQL/JDBC 实操走**本地隔离实验路径**，并与网站课程入口自然衔接。

## 一、本轮实测（2026-11-11，Windows 10 + Git Bash + Docker 29.8.2）

| 项 | 结果 |
| --- | --- |
| 隔离容器 `jrl-mysql-v22`（MySQL 8.0.46，`0.0.0.0:3307->3306`） | 从停止态 `docker start` ~8s 就绪 |
| `verify_mysql.sh`（环境变量注入 URL/用户/口令/JAR） | **6/6 程序全过**：内存→文件→JDBC CRUD 一致、1062 拦截转业务异常、3819 CHECK、批量事务回滚（回滚后 id=20=null）、utf8mb4 中文 |
| 凭据安全 | 口令只存在于容器环境变量与进程环境变量，零硬编码；`.gitignore` 含 `db.local.properties`/`*.jar` |
| 纯 JDK 无库路径 | `stage05-compile.test.mjs` 保证全部源码无 DB 也能 `javac` 编译（本轮 npm test 持续通过） |

## 二、跨平台与低配设备（本轮补强）

- **双脚本**：`verify_mysql.sh`（macOS/Linux/Git Bash，bash 3.2 兼容 + cygpath 分支）/ `verify_mysql.ps1`（PowerShell 5.1，UTF-8 BOM + `-D` 参数引号化——V2.2 修过）。
- **8GB 设备成本提示（R1 新增）**：`stage05_mysql_db/README.md` 明确容器常驻约 400–600 MB 内存、Docker Desktop + IDE 同跑吃紧，给出"先纯 javac 编译 + String 模拟、容器实验集中安排、用完 `docker stop`"的低配策略。
- **资源要求透明**：任务书要求的"明确提示资源要求"落在 README 第 31 行区域，与验证脚本用法（环境变量三件套 + JAR 路径）并排。

## 三、网站与本地的衔接（R1 后的完整链路）

1. 课程页（`s05-sql-basics`…`s05-jdbc-dao`）→ 正文含本地实验路径指引（db.local.properties.example、verify 脚本、Docker 隔离）；
2. `s05-jdbc-dao` 运行命令自动附 `-cp "out:/path/to/mysql-connector-j-8.4.0.jar"` 占位提示（V2.2 P2-4 修复，本轮走查确认在线可见）；
3. 预测中心 S05A1–A3 / S05B1–B2 覆盖概念判定；B2 的参考跳转（EXPLAIN 实验）本轮补齐 referencePaths 并登记懒加载；
4. TODO 骨架 `ScholarshipTransferLab.java` + L1–L4 提示置于 `stages/stage05_mysql_db/practice/`，由 `verify_mysql` 同套环境变量验收。

## 四、为什么不建在线 SQL 判题（诚实决策，维持 V2.2 结论并复核）

`verify-practice.mjs` 运行器是"无第三方 JAR、无数据库进程"的纯 JDK 沙箱。要在网页里真实判 SQL：要么引入浏览器端假 MySQL（失真、违反"不伪造执行结果"），要么要求所有学习者装 Docker 否则 `npm test` 失败——都不可接受。本轮以**本地实验路径 + 明确提示**替代，并用今日实跑（6/6）证明该路径在 8GB 可承受的隔离容器方案下完整可用。若未来引入嵌入式 MySQL 或 CI 化的 Docker Compose 测试流，再评估扩展在线判题。

## 五、剩余事项

- `verify_mysql.ps1` 在本轮未重复实跑（V2.2 已验证 + 本轮脚本未改动；Windows 主路径 `.sh` 在 Git Bash 实跑通过）。
- 容器用后未停（保留供后续轮次复验），`00_cleanup.sql` 幂等可随时清空。
