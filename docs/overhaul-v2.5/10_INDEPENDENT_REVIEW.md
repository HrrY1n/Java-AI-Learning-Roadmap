# 10 · 独立 QA 对抗审查（V2.5）

> 审查由职责分离的独立 QA 代理执行：只读审查 `git diff 3aa5463..9c91975`（V2.5 全部 6 提交），三工程在临时目录副本实跑、release=8 实验实跑、HTTP 分发器探针实测、Spring Boot 起服务 curl 探针、CI 实况取证（PR #14 run 43060784416）。全程零 Docker 启动、仓库工作区零改动。

## 一、审查确认通过的关键项

1. **分层真实性**：Controller 无业务 if、Service 是业务规则唯一所在地（id 生成/异常翻译/DTO↔领域）、DTO 与领域对象分离；main 源码零 `@Autowired` 字段注入（全构造器注入，grep 实证）。
2. **MyBatis"无数据库"声明属实**：mybatis-config.xml 确无 environments 段；测试只构建 SqlSessionFactory + 注册表断言，不 openSession 不触 DataSource。
3. **无虚假验证声明**：grep 全部新增正文/练习/pom，零"集成测试通过/已验证 MySQL"类语句；阻断声明贯穿课 7 与 07 文档。
4. **伪装检查**：registry 只增不减（113→120）；spec 无断言弱化；Java 侧全为新增。
5. **课程-网站一致性**：7 个 lesson JSON 的 bodyPath/codeDirectory 全部指向真实路径；registry/catalog/spec 三处计数一致（68）；主文件含 main 门禁满足。
6. **抽查数字**：14 项关键数字（三代统计/registry/manifest/E2E 数/容器状态）全部吻合。

## 二、发现的问题（QA 原始分级）与 R14 修复

| 级别 | 发现 | 证据 | R14 修复 |
| --- | --- | --- | --- |
| **P0** | **mvnw 以 100644 提交（无执行位）→ CI macOS `./mvnw: Permission denied` 三工程全灭**；非 Windows 学习者按课 1 跟做同样失败 | PR #14 run 43060784416 macos fail 日志；`git ls-files -s` 实证 | `git update-index --chmod=+x` ×3（`e705964` mode change 实证）→ CI macos verify-java **转绿**（run 43069269952 含 verify_stage06 三工程全过） |
| P1 | 课 2 实验 3 预测错误：`toList()/List.copyOf` 是**不可变列表**，`snapshot.clear()` 抛 UOE——正文预测"绿"实为红 | JDK 25 实测 | 正文改写为"两种不同的红"教学（UOE vs 视图清空连 store），防御性拷贝正解保留 |
| P1 | 课 1 release=8 预测错误："源码没用到 List.of/文本块能过"→实测 BUILD FAILURE（`java.net.http` 是 JDK 11+ API，正文提示清单恰好漏掉） | release=8 实测编译错 | 正文改为实测结论 + "release ≥ 源码最低 API 版本"的正确表述 |
| P1 | 课 3 `/api/students/abc` 预测"parseInt→500"实为 **405**（正则 `\d+` 不匹配，parseInt 不可达） | 分发器探针实测 | 正文按实测改写，并引出"粗粒度兜底 vs 精确语义"的框架价值 |
| P1 | **兜底 500 吞客户端错误**：坏 JSON/字段类型错/缺 body（`HttpMessageNotReadableException`）落入 Exception 兜底 → 500，违背课 5/6 自己的 400 语义表 | 实测截断 JSON → 500 | 新增显式分支 → 400；课 6 语义表补行 |
| P1 | **StudentService 依赖具体类** `InMemoryStudentRepository` 而非接口——与 02 文档"换存储上层零改动"承诺矛盾 | 源码 :22 | 构造器/字段改注 `StudentRepository` 接口；14 测试复跑全绿 |
| P1 | 08 文档两处"实测"声明与实际行为冲突（随上两项联动修正） | — | 已对齐修正后行为 |
| P2 | `StudentHttpServer` else 分支死代码；nextId 并发/复用边界"正文已声明"失实；课 7 XML 路径/课 3 REFERENCE 路径错；课 7 练习与预填代码重复；"-" 邮箱哨兵无解释；pom 注释 @Email vs @Pattern 实不符；09 日志措辞漂移 | 逐项 | 8 项全部修复（死代码删除、边界声明进正文与 javadoc、路径/措辞/练习改题） |
| P2 | ~11 个非 Stage06 精度修正混入 V2.5 提交（stage01/03/04/05 措辞收敛） | diff | 核实：这些是上一轮 V2.4 审计的收尾修正随分支携带，QA 核验"方向正确无破坏"；已在 10 文档披露 |

## 三、R14 后复验

- student-api **14/14**（注入接口后）、maven-lab **12/12**、mybatis-lab **3/3**。
- CI（`e705964` + `300feb1`）：verify-java macos **转绿**（含 verify_stage06 三工程）——P0 根治；web-core macos 在键盘容错修正后 **E2E 全绿**（见 12 文档）。

## 四、结论

QA 总评："V2.5 代码本体可信……但尚未到终态：修复 1 个 P0 + P1 组并让 CI 三系统转绿后，方可进入终态回归。"——R14 已修复全部 P0/P1/P2，CI 三系统对 `300feb1` 全绿，**进入终态回归与交付**。
