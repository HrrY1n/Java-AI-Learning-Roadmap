# V2.5 CHECKPOINT（长任务恢复点）

> 更新：2026-11-11 · 中断后按本文件续作，不必重跑基线。

## 状态

- 分支：`codex/v2.5-backend-foundations`（自 origin/main `3aa5463`）
- 本地工具链：`.audit-work/tools/apache-maven-3.9.9`（官方 Central 发行包；下载与解压脚本见 `.audit-work/v25/setup-maven.sh`）
- Docker：引擎未运行 → MyBatis 真库集成 = **阻断记录**（compile-verify only）

## 进度

- [x] R0 基线核验 + 00_BASELINE.md
- [ ] R1 课程设计 01_STAGE06_CURRICULUM.md
- [ ] R2 maven-lab 工程（pom + wrapper + 学生域 + 构建通过）
- [ ] R3 JUnit 测试 + 课程 1-2
- [ ] R4 HttpServerDemo + 课程 3
- [ ] R5 student-api Spring Boot 骨架 + 课程 4
- [ ] R6 REST CRUD + 课程 5
- [ ] R7 Validation/异常 + 课程 6
- [ ] R8 练习体系（practice/ + L1-L4 + verify 脚本）
- [ ] R9 网站接入（stages.json published + lessons JSON + registry + E2E）
- [ ] R10 MyBatis 模块 + 课程 7
- [ ] R11 文档 02-08
- [ ] R12 全量回归 + 干净检出
- [ ] R13 独立 QA 审查 → R14 修复
- [ ] R15 Draft PR + 最终交付

## 关键决策

1. 两个 Maven 工程：`maven-lab`（课 1-3，纯 JDK+JUnit）+ `student-api`（课 4-7，Spring Boot）——避免"用 Spring 工程讲 Maven 入门"的认知负担；两者为演进关系并在正文声明。
2. Spring Boot 3.5.x + `maven.compiler.release=21`（学习者 JDK 21+ 可复现；本机 JDK 25 兼容）。
3. CI：verify.yml 增加mvnw 测试步骤 + .m2 缓存；npm test 不变（Spring 不进纯 JDK 沙箱）。
4. Stage06 练习走 `stages/.../practice/` 本地工程任务模式（Stage05 先例），Web verify-practice 判题器（纯 stdout 比对）不适用 Maven 任务——如实记录。
5. MyBatis：Mapper 代码 + 可编译验证 + 集成测试标注"需 MySQL 环境"（阻断）。

## 恢复命令备忘

- Maven 本地：`.audit-work/tools/apache-maven-3.9.9/bin/mvn -v`
- 工程测试：`cd stages/stage06_backend_foundations/<proj> && mvn -q test`（或 `./mvnw`）
