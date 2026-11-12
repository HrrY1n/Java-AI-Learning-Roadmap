# V2.5 CHECKPOINT（长任务恢复点）

> 更新：2026-11-12 · R0-R15 全部完成（PR #14 Draft，CI 6/6 绿）；后续 QA 复审修复记录见分支提交。

## 状态

- 分支：`codex/v2.5-backend-foundations`（自 origin/main `3aa5463`）
- 本地工具链：`.audit-work/tools/apache-maven-3.9.9`（官方 Central 发行包；下载与解压脚本见 `.audit-work/v25/setup-maven.sh`）
- Docker：引擎未运行 → MyBatis 真库集成 = **阻断记录**（compile-verify only）

## 进度（全部完成 · 终态 `9d91850`，PR #14 CI 六项全绿）

- [x] R0 基线 + R1 课程设计 + R2 maven-lab + R3/R4 课 1-3 + R5-R7 student-api/课 4-6 + R8 练习
- [x] R9 网站接入（68 lessons / registry 120 / E2E 72/72）
- [x] R10 MyBatis 模块（真库=阻断）+ R11 文档 00-09 + Draft PR #14
- [x] R13/R14 独立 QA（1 P0 + 6 P1 + 8 P2）全部修复（`e705964`，CI macos 转绿）
- [x] R12 CI 三系统全绿（run 43069270389）+ 干净检出终态回归全绿
- [x] R15 文档 10-13 + 最终验收（13_FINAL_ACCEPTANCE.md）
- [x] R14b/c QA 残余修复（`b63ae1c` + `9d91850`）→ CI 六项全绿（run 43073559045/59125）

## 关键决策

1. 三个 Maven 工程：`maven-lab`（课 1-3，纯 JDK+JUnit）+ `student-api`（课 4-7，Spring Boot）+ `mybatis-lab`（课 7，无数据库验证级）——避免"用 Spring 工程讲 Maven 入门"的认知负担；两者为演进关系并在正文声明。
2. Spring Boot 3.5.x + `maven.compiler.release=21`（学习者 JDK 21+ 可复现；本机 JDK 25 兼容）。
3. CI：verify.yml 增加mvnw 测试步骤 + .m2 缓存；npm test 不变（Spring 不进纯 JDK 沙箱）。
4. Stage06 练习走 `stages/.../practice/` 本地工程任务模式（Stage05 先例），Web verify-practice 判题器（纯 stdout 比对）不适用 Maven 任务——如实记录。
5. MyBatis：Mapper 代码 + 可编译验证 + 集成测试标注"需 MySQL 环境"（阻断）。

## 恢复命令备忘

- Maven 本地：`.audit-work/tools/apache-maven-3.9.9/bin/mvn -v`
- 工程测试：`cd stages/stage06_backend_foundations/<proj> && mvn -q test`（或 `./mvnw`）
