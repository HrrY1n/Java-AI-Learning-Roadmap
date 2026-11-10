# 09 · V2.2 迭代日志

> 遵循 `AUDIT -> PLAN -> IMPLEMENT -> TEST -> REVIEW -> FIX -> REGRESSION` 闭环，本轮共执行 **9 轮有效迭代**（上限 16/12；本轮任务书上限 12 轮，实际 9 轮完成并停机收敛）。

## Round 1 · P0 身份核实与干净检出暴露三大阻断（提交 `9aaac20` / `e2b8dfc` / `233c24d` / `65ac38a`）
- **审计发现**：① `ea1898a` 为 V2.1 真实终态（11 提交，`6fc881f` 后纯文档提交）；② 干净检出上专题课在生产/新 dev 全页崩溃（`Unexpected value undefined for tree`——V2.1 KaTeX 动态 chunk 与 `react-markdown` dep 组合缺陷，主工作区此前因 `reuseExistingServer` 复用旧进程掩盖）；③ Pages smoke 计数陈旧（45 vs 55）；④ 默认 E2E `stage02.spec` 计数过期与 `v14-topics` 探针 `"旅行商"` 因正文搜索上线变为可命中。
- **修改**：`Markdown.tsx` 回归 KaTeX 静态 import（保留 fence 剔除优化），修改 `smoke/pages.spec.ts`、`e2e/stage02.spec.ts`、`e2e/v14-topics.spec.ts`，写出 `00_baseline_verification.md` 并启动隔离 MySQL 8.0.46 容器（端口 3307）。
- **验证**：干净检出默认 E2E 67/67、Pages smoke 10/10、Java 103/103。

## Round 2 · P3 Stage 04 实践闭环与并发工具课（提交 `a09d0c2`）
- **发现**：Stage 04 4 课尚无 Web 练习；且 S04B1 提到的 `AtomicInteger` 与线程池练习的 `Callable/Future` 尚无主线课承接。
- **修改**：编写 `s04-exercises.md`（L1–L4 提示）与 3 道结构化练习（`s04-thread-order`、`s04-safe-counter`、`s04-thread-pool-lab`）+ 3 个参考答案（通过独立槽位、互斥终值与 `List<Future<Long>>` 做到 100% 确定性输出）；新建 `s04-concurrent-tools`（`day05_concurrent_tools`）；更新 manifest 至 104 项、registry 至 103 个 ID。
- **验证**：`verifyPractice` 实跑 12/12 PASS；`verify_java.sh` 104/104；`npm test` 77/0。

## Round 3 · P1+P5 代表课教学深度审计、连续讲义升级与展示改造（提交 `daf62d4`）
- **审计发现**：8 类核心知识存在 JLS 不严密（`day02` 左结合、`day07` 常量窄化/整型提升、`s02-constructor-this` 5 步与 `void` 陷阱、`s02-static-lifecycle` 单包伪多包与 `protected` §6.6.2 遗漏、`deep03` 引用逃逸缺反例、`deep01` Stage04 深浅拷贝空头承诺、`s03-arraylist` 漏删与包装类断档、`FileStudentRepository` 丢 cause 被吞、`s03-exception` 返回 0 反模式、`s04-thread-basics` `RUNNABLE` 竞态、`day02_visibility` 虚假 `println` 错位），且 foundation 7 步模板造成“为了排版而拆段”。
- **修改**：改进 `App.tsx` `LessonPage` 按步骤职责智能切分 + `extractH2Sections` 接入右侧脉络；修补上述全部代码与 JSON 缺陷，并为 9 门代表基础课补齐 `bodyPath` 连续深入讲义（含四要素验收闭环）；在 `verify_java` 抓出 `day07_static_visibility` 新增跨包子类使计数变 `3` 并修复 `search.spec.ts` 探针词。
- **验证**：`verify_java.sh` 104/104；`npm test` 77/0；`search.spec` 3/3。

## Round 4 · P2 独立学习验证机制（提交 `82a4094`）
- **修改**：编写 `stages/practice/diagnostic_and_transfer.md`（U1–U6 理解诊断、D1–D5 Debug 排错、T1–T4 迁移任务）挂入 `documents.json`；解析 `answers/diagnostic_solutions.md` 挂 Stage 04 `referenceDocuments`（主动解锁隔离）；编写 `web/scripts/diagnostic-semantics.test.mjs` 接入 `npm test`（locale 固定英文 javac 真跑报错与输出核验 + 四要素闭环强校验）。
- **验证**：首次实跑暴露中文 Windows JDK 报错汉字编码，加 `-J-Duser.language=en -J-Duser.country=US` 跨平台固定后 `npm test` 79/0 通过。

## Round 5 · P4 Stage 05 MySQL 课程与连续项目设计及 SQL 实测
- **修改**：编写 `.gitignore`（忽略 `db.local.properties` / `*.jar`）、`db.local.properties.example`、5 份可重复 SQL 脚本与 `day01..05` 教学 Java/README；设计并编写 6 阶段连续项目 `StudentEvolutionDemo`。
- **实测抓虫（两次真实缺陷）**：① 重跑 `01_constraints.sql` 被 `02` 的外键拦截 → 补 `DROP TABLE IF EXISTS lab_enrollments`；② `day04` 里 `ANALYZE TABLE` 返回结果集不能调 `executeUpdate()` 改用 `stmt.execute()`；③ `JdbcStudentRepository.save()` 原用 `ON DUPLICATE KEY UPDATE` 遇唯一学号冲突时误覆写他人记录 → 改为按主键判存后再 `UPDATE`/`INSERT`；④ PowerShell 5.1 无 BOM 报语法错且 `-D` 参数被拆 → `verify_mysql.ps1` 加 UTF-8 BOM 并引号化 `-D`。

## Round 6 · P4 Stage 05 全量接线与编译守卫（提交 `4e54dd2`）
- **修改**：接入 5 门正式课、`predictions/stage05.json`（S05A1–A3 / S05B1–B2）、调整 `stages.json` 04/05 先修解耦并把 `s03-repository-evolution` 链向 `s05-jdbc-dao`、`stage05-compile.test.mjs`（保证无 DB 环境原生 `javac` 100% 编译）、`public-roadmap.md`/`public-progress.md`（保持状态“未开始”）、`--update-registry` 登记 10 新 ID（共 113）。
- **首次检查暴露**：5 个 `DbEnv.java` 包私有触发生成器 `javaIdentity` 校验报错 → 改为 `public final class DbEnv`。
- **验证**：MySQL 8.0.46 实跑全 6 程序+回滚通过；`npm test` 80/0 + vitest 41/41；`verify_java` 104/104。

## Round 7 · P6 三大专题优先深化升级（提交 `69e877a`）
- **修改**：重写 `ostep-locks-atomics`（CAS 自旋锁 `SpinLock`）、`net-reliable-tcp`（升级 `code` 课，RDT 状态机/累计 ACK/去重/`rwnd`/业务幂等边界）、`csapp-exceptional-control-flow`（升级 `code` 课，ECF 四类对照 + `ProcessBuilder` 并发读流 + 超时 `destroyForcibly` + 非零退出码对照，彻底与 OSTEP 去重）；维持专题级 `building` 不变；接入 `verify_manifest.tsv` 与 `topic-content.test.mjs` 行为守卫。
- **验证**：`verify_java.sh` **107/107**；`npm test` 80/0。

## Round 8 · P5 真实截图/E2E 验证与干净检出 CRLF 适配（提交 `c989512` / `f6a822c`）
- **修改**：编写 `web/e2e/v22-lessons.spec.ts` 并拍取 `s05-sql-basics` 桌面/手机真实截图人工审视；在 `/tmp/jrl-v22-clean` 干净检出跑完整验证，暴露 `diagnostic-semantics.test.mjs` 对 CRLF 签出未归一化的缺陷并立即修复。
- **验证**：干净检出默认 E2E **69/69**、Pages smoke **10/10**、Java **107/107**、`npm test` 80/0。

## Round 9 · 独立评审与缺陷清零收尾（提交 `fca64d2` + 文档交付）
- **独立评审发现**：无 P0；**1 项 P1**（`JdbcStudentRepository.saveBatchAtomically()` 把所有 `SQLException` 吞并成 `IllegalArgumentException`）与 **5 项 P2**（批处理与内存/文件版同 id 覆盖语义差异、脉络 TOC 显示原始反引号、多包依赖徽标固定“同包依赖类”及 Stage 05 运行命令缺驱动提示、`s05_lab_tasks.md` 助手名与骨架一致化、`day02_visibility_volatile` 注释对齐及删遗留 `gen_stage04_lessons.py`）。
- **修复与最终回归**：全部修复并提交 `fca64d2`；干净检出最终复跑全绿（见 `10_regression_report.md`）；产出 `01`–`13` 全部交付文档。
