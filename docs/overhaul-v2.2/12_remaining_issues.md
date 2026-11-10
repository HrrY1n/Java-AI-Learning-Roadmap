# 12 · V2.2 未解决问题与已知限制

> 诚实披露：凡本轮有意识选择保留现状、受外部运行环境限定或留待后续迭代的事项，均如实列明原因与后续建议，不以已完工冒充。

## 一、有意留作后续迭代的事项

1. **其余未升级为 `bodyPath` 的传统 7 步 foundation 课**：
   - 本轮优先对覆盖 8 大核心知识领域且缺深化课兜底的 **14 门代表性基础课**（Stage01 `day03`/`day07`、Stage02 `s02-static-lifecycle`/`s02-string-common-api`、Stage03 `s03-arraylist`/`s03-hashmap`、Stage04 3 门、Stage05 全 5 门）完成了长讲义连续化改造与四要素闭环；Stage01 `day01`/`02`/`04`/`05`/`06`、Stage02 `s02-class-basics`/`constructor-this`/`encapsulation-basics`/`inheritance-basics`/`polymorphism-basics`/`interface-abstract`（均有深化课 `deep01`–`deep06` 或 `s02-*` 配套承接）、Stage03 其余外围基础课仍沿用 7 步导读+深化课联动模式，留待后续视学习反馈再逐步收拢。
2. **Stage 05 Web 交互式在线判题练习（`web/content/exercises/stage05/`）**：
   - 目前网站的 `verify-practice.mjs` 运行器采用**无第三方依赖 JAR、无数据库进程**的纯 JDK 沙箱比对；如果强行做进在线实验室，要么只能测字符串模拟（会失真），要么要求没有 MySQL 的学习者在 `npm run test` 阶段直接失败。
   - 本轮采用诚实且可落地的折中：**3 个纯 JDK 预测题（`S05A1–A3`）+ 2 个修改题（`S05B1–B2`）接入网站预测中心**，真实 JDBC/事务/EXPLAIN 实操任务与 TODO 骨架（`ScholarshipTransferLab.java`）置于 `stages/stage05_mysql_db/practice/`，由 `verify_mysql.sh`/`.ps1` 连本地隔离测试库验收。待后续引入嵌入式或 Docker Compose CI 测试流后再决定是否扩展 `verify-practice.mjs` 支持数据库练习。
3. **Stage 04 剩余进阶主题（`Condition`、`CountDownLatch`、`CompletableFuture`）与 Stage 06+**：
   - Stage 04 已通过 `s04-concurrent-tools` 覆盖最急需的 `AtomicInteger`、`Callable/Future`、`ConcurrentHashMap` 并完成 3 个核心并发练习；其余并发协调器按按需原则留待 Stage 06 Spring Boot 异步实战时引入。Stage 06–14 仍保留为 `planned`（Stage 06 为下一轮建设起点）。
4. **CS:APP / OSTEP / Network 其余 40 节 `building` 专题深化**：
   - 本轮集中深化了与后端关系最密切的 3 节高优先级专题并加入实跑实验（`ostep-locks-atomics`、`net-reliable-tcp`、`csapp-exceptional-control-flow`），其余 40 节维持既定 `building` 状态，不追求批量凑字数。
5. **前端代码进一步工程拆分（`App.tsx` 与 `styles.css` 文件拆分）**：
   - 经 V2.1 与本轮评估，本轮优先解决了真正的痛点——`LessonPage` 内容信息架构、`catalog` 元数据/正文分离、KaTeX 崩溃根治与多包/驱动提示修复；`App.tsx`（~3000 行）按页面拆分属于低风险纯重构工作，可留待后续单独小 PR 完成。

## 二、外部环境与已知限制

1. **跨操作系统 GitHub Actions Runner 验证**：本机为 Windows 10 + Git Bash + JDK 25，本轮因禁止自行推送远端而未在 GitHub Actions `macos-latest` 与 `ubuntu-latest` 实际跑 CI 队列；`verify_java.sh` / `verify_mysql.sh` 的 macOS bash 兼容已按 bash 3.2 与路径分离原则编写并在 Windows Git Bash 实测。
2. **本地残留测试容器与驱动缓存**：本地保留了供演示使用的 Docker 容器 `jrl-mysql-v22`（端口 `3307`，已执行 `00_cleanup.sql` 清空测试表）与 gitignored 的 `.audit-work/lib/mysql-connector-j-8.4.0.jar`，不影响仓库任何跟踪文件与用户原有 3306 MySQL 服务。
3. **独立非公开用户文件**：`docs/javaroadmap_lab/v1.4_screenshots/`（5 张截图）与 `docs/overhaul-v2.1.rar` 均按原样保持未跟踪状态，未被提交或删除。
