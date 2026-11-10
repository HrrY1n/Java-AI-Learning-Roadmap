# 11 · 独立评审与修复报告（V2.2）

> 评审由独立的 `general-purpose` 评审代理在职责分离下执行（只读检查 `ea1898a..f6a822c` 全部 11 个提交 + 自跑 `verify_mysql.sh`、`verifyPractice`、`javac` 多包测试、`check_links.py`、57/61 课结构脚本核查与 `npm test`）。全部已发现问题均已在本轮最终提交 `fca64d2` 中完成修复并复验通过。

## 一、独立评审确认通过的关键项

1. **P0 干净检出与资源防漏**：`registry.json`（113 IDs）完整在提交内；`v1.4_screenshots` 与 `overhaul-v2.1.rar` 零污染；347 条链接全部可达。
2. **Stage 04 并发非确定性处理**：3 门练习依靠独立槽位+`join`、互斥终值与 `List<Future<Long>>` 做到确定性输出，参考实现经 `verifyPractice` **12/12 PASS**，骨架零答案泄漏。
3. **Stage 01–04 深度修复**：实测验证 `day07_static_visibility` 跨包 `SubStudent` 取消注释后精确触发 `protected access` 与 `not public` 报错；`FileStudentRepository` 保留 `cause` 不再被业务异常吞并；`LessonPage` 的 `splitIndex` 对全部课程切分无号序或 H2 ID 碰撞。
4. **Stage 05 MySQL 实跑与安全**：全源码无密码硬编码；在 3307 MySQL 8.0.46 容器实跑 `verify_mysql.sh` 全部 6 入口全过且测试表可干净清理；MySQL 8.0.16 `CHECK`、`REPEATABLE READ` MVCC 与 `EXPLAIN` 讲解准确。
5. **P2 诊断与 P6 专题与数据安全**：`diagnostic_solutions.md` 未进公开文档只走主动解锁；`ostep-locks-atomics`/`net-reliable-tcp`/`csapp-exceptional-control-flow` 保持 `building` 且三实验可运行通过；`learning-store.ts` 零改动；`public-progress.md` 保持 `未开始`。

## 二、评审发现问题清单与最终修复处置

| 级别 | 发现问题 | 定位与证据 | 修复措施与复验结果（提交 `fca64d2`） |
| --- | --- | --- | --- |
| **P1** | `saveBatchAtomically()` 把所有 `SQLException` 一律吞并转抛 `IllegalArgumentException("批量写入触发数据库约束...")` | `JdbcStudentRepository.java:147-154`（若遇断连/死锁/表缺失会误报为业务学号冲突，违背不伪装异常原则） | **已修复**：抽出 `translateConstraintOrSystemError()`，仅 `SQLIntegrityConstraintViolationException`(1062) 与错误码 `3819` 转为 `IllegalArgumentException`（并区分主键 `PRIMARY` 与唯一学号冲突）；其余底层 `SQLException` 保留原 cause 抛出 `IllegalStateException` |
| **P2-1** | `saveBatchAtomically()` 写死 `INSERT INTO`，与内存/文件版支持批内同 `id` 覆盖更新的语义不一致 | `JdbcStudentRepository.java:138` vs `InMemoryStudentRepository.java:53` | **已修复**：抽出 `upsertOnConnection()` 并在单条 `save` 与批处理内统一复用，实现与内存/文件版一致的“同 `id` 覆盖、异 `id` 抢学号拦截”契约 |
| **P2-2** | 单条 `save()` 非事务下 `SELECT`+`INSERT` 竞态撞主键 `1062` 时误报“学号可能已被占用” | `JdbcStudentRepository.java:72` | **已修复**：在 `translateConstraintOrSystemError` 中通过判断 `PRIMARY` 关键字清晰区分主键 `id` 冲突与 `uk_evo_student_no` 学号唯一约束冲突 |
| **P2-3** | 右侧「本节脉络」TOC 按钮显示原始 Markdown 反引号 | `web/src/slug-heading.ts:30` | **已修复**：展示字段 `text` 剥除行内反引号 `raw.replace(/`/g, "")`（保留精确 `slugifyHeading` ID），并补入 `slug-heading.test.ts` 断言锁定 |
| **P2-4** | `LessonPage` 多包文件固定显示 `同包依赖类`，且 Stage 05 本地运行命令缺 MySQL 驱动 JAR 占位提示 | `web/src/App.tsx:1369,1384-1389` | **已修复**：按 `file.packageName === lesson.packageName` 动态标为「同包依赖类」/「跨包依赖类」；Stage 05 运行命令自动附上 `-cp "out:/path/to/mysql-connector-j-8.4.0.jar"` 与配置指引 |
| **P2-5** | 三处小不一致：`s05_lab_tasks.md` 写了不存在的 `assertConsistent`；`day02_visibility_volatile` 注释含旧 `(println...)`；残留遗留 `gen_stage04_lessons.py` | `s05_lab_tasks.md:24`、`day02_visibility_volatile/App.java:16-17`、`web/scripts/gen_stage04_lessons.py` | **已修复**：文档改为 `sumAllQuota(Connection)`；`App.java` 注释改为显式引导临时加 `println` 观察对比；`git rm` 删除过时生成脚本 |

**最终结论**：评审全部 P1 与 P2 发现均已实际代码修复并在干净检出下重跑全套回归通过，当前**无遗留 P0/P1 缺陷**。
