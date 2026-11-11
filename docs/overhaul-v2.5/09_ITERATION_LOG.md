# 09 · V2.5 迭代日志

> 闭环：PLAN → IMPLEMENT → TEST → REVIEW → REGRESSION → REASSESS。实际执行 **6 轮**（上限 16；核心闭环质量标准达成后收敛，符合任务书"早于 16 轮达标可结束"）。

## R0 · 基线与决策（提交 `89504cb` 前半）
- 核验 origin/main=`3aa5463`；创建分支 `codex/v2.5-backend-foundations`；遗留分支 `codex/v24-audit-fixes` 与 main 同 tip 零独有提交（未触碰）。
- 环境实测：无系统 Maven → 官方 Central 下载 3.9.9（SHA-512 校验）；Docker 引擎未运行 → MyBatis 真库 = 阻断记录。
- 决策：两工程演进结构（maven-lab/student-api）+ Wrapper 自举 + release=21 + 练习走工程任务模式（00_BASELINE/CHECKPOINT）。

## R2–R4 · maven-lab（课 1–3 代码）
- pom（坐标/release=21/JUnit 5.11.3/surefire 3.5.2）+ Stage05 契约副本（Student/Repository/InMemory 逐签名一致）。
- 12 条 JUnit（三类路径全覆盖）；`StudentHttpServer`（路由/状态码/JSON 转义/selftest）。
- **失败案例**：`StringBuilder.add` 编译错（笔误）→ 修正；首跑 wrapper 插件下载瞬时失败 → 重试成功（缓存后稳定）。
- 生成 wrapper（only-script，无二进制）；`./mvnw test` 12/12 + selftest 三状态码。✅

## R5–R7 · student-api（课 4–6 代码）
- Spring Boot 3.5.6 骨架 + 分层实现（Controller/Service/DTO×3/异常映射×6 分支/类型化业务异常）。
- **失败案例（全部由编译器与测试当场抓出，逐条修复）**：跨包类型缺导入 ×2（DTO/Service）、`HttpEntity<>` 菱形推断失败（参数收紧）、缺 `java.util.List` 导入、**单例 Bean 状态跨测试泄漏**（expected /1 but was /3 → 加 `clear()` + @BeforeEach 重置）。
- 终态：**Tests run: 14, Failures: 0**（Service 单测 7 + 真 HTTP 契约 7）。

## R8 · 练习体系
- practice/s06_tasks.md：8 个工程任务（能力矩阵 + 完成条件 + L1–L4）+ answers 复现场景（task3/6/8 broken + task6 验收测试"不得修改"+ REFERENCE_DELETE）。

## R9 · 网站接入（提交 `ed37c68`）
- 7 个 lesson JSON（稳定 ID s06-*）+ stages.json（published/lessonOrder/slug/prefix/prerequisites）+ public-roadmap/progress 状态行 + Stage06 README 导航图。
- `generate-content --update-registry`：registry 113→**120 known IDs**；catalog 61→**68 lessons**。
- **失败案例**：spec 计数 61 过期（core.spec/stage02.spec/pages.spec）→ 更新 68 后 **E2E 72/72**、npm test 80/80。

## R10 · MyBatis 模块（课 7 代码）
- 独立模块（mybatis + mysql-connector-j 依赖）+ Mapper 接口/XML/行对象 + `MyBatisLabApp`（main，无 DB 绑定演示）。
- **失败案例（无 DB 环境下的三层真实教训）**：① Mapper XML 缺 DOCTYPE → PersistenceException（解析失败）→ 补 DOCTYPE；② `openSession()` 无 environments 会抛错、调用 mapper 方法会触发连库 → 改用 `Configuration.hasStatement` 纯绑定验证；③ 语句双注册（全名+短名）与 `getBoundSql(null)` NPE → 断言按前缀过滤 + `${}` 检查改读 XML 原文。
- 终态：3/3 通过（解析/绑定/注入防护——**无数据库第二级验证**）；verify_stage06.sh 三工程全 PASS。

## R11–R12 · 文档与回归（进行中）
- 00–08 文档 + CHECKPOINT 已交付；推送分支 → Draft PR → CI（verify_stage06 三系统）→ 干净检出终态回归 → 独立 QA → 修复 → 10–13 文档。
