# 04 · 教学体系架构审查（R2 代理审查整合）

> 来源：教学体系架构审查代理对 catalog.json 全量关系图 + 24 门课正文/代码全文 + 演进项目源码逐行比对的只读审查（先读 V2.3 全部审计文档去重）。本文件为整合后的正式结论与实施清单。

## 一、学习路径连贯性结论

1. **prereq 声明与课程内容零失配**（Stage01–05 逐条核对 stages.json 与课程实际内容）。
2. **概念断层仅两处轻度前向依赖**：`s02-entity-service` 正文/代码用 try/catch 而异常在 Stage03 才正式教（V2.3 只修了 ArrayList 同类问题，catch 遗漏）；`s03-lambda` 独立练习指向 Stage04 的线程池。→ 本轮各补一句说明。
3. **Stage01 的 deep01–07 编号不代表配对关系**（实际语义配对 day03↔deep07、day04↔deep05、day05↔deep03、day06↔deep04+deep06、day07↔deep02），且 V2.3 03 文档"一一配对"表述不准确 → 本轮修正导航说明与文档表述。
4. **专题入口时机失真**：algo 5 门（graph/hash-table/heap-topk/binary-tree/greedy）stageLinks 只挂 '01' 但实际依赖 Stage03 集合；git 19 门全挂 '08' 但前 4 门是 Stage01 就要用的工具课 → 本轮修数据。
5. **stageLinks 死数据（精确表述）**：5 个专题级 + 91 个小节级 stageLinks 经内容构建校验（build.mjs validateCatalog）后在 web/src **零渲染**（grep 仅命中类型定义）；`relatedLessonIds` 结构上无法挂专题小节。现状下学习者主要靠侧栏常驻的双分组往返主线与专题，但**专题课自身不声明其内容对应的主线学习时点**——本轮实现的是"专题课 → 主线 Stage"的反向通道（TopicView 课头"建议学习时点"chips）；主线课正文内嵌专题延伸链接留作后续增强（侧栏双分组已提供基础通道，非阻断）。

## 二、连续项目演进评估

**Stage05 内部组织良好**（六阶段 README + 课程真实回指 + verify 6 程序链路完整）。三个跨阶段断点与最小修复：

| 断点 | 证据 | 修复（本轮实施） |
| --- | --- | --- |
| 演进是"重演"而非"续写"：Stage03 接口 3 方法 → Stage05 6 方法、Student 3→5 字段，而 s05-jdbc-dao 正文断言"保留**同一个**接口无缝替换" | 两包源码逐行比对 | s05-jdbc-dao 加"契约升级说明"段 + stage05 README 两行 |
| Service 层在 Stage05 消失且未声明 | `stage05/student/` 无 Service 类；EvolutionDemo 业务流程在 main | 类注释一句声明 + Stage06 归位路标 |
| Stage04 与连续项目零绑定 | 5 门课"项目迁移"全部指向通用场景，无一处提学生仓库 | s04 两门课"项目迁移"加一句绑定 + s04-exercises.md 加"选做任务：并发学生仓库" |

**明确不做**（避免为连贯而连贯）：不为 Stage04 新增第 4 门 Web 练习（与既有练习价值重复、契约成本高）；不合并 Stage03/05 源码（违反独立包+纯 javac 门禁）；不把教学载体与项目 A 预研合流（有意设计）；不换 12 门已验收练习的题面域。

## 三、Stage06+ 路线（方向评估，不开发）

**工具链断层诚实化是第一决策点**：本机实测无独立 mvn/gradle、无 `~/.m2`（IDEA 捆绑 mvn 3 可免安装）；Spring Boot 首次构建必须联网（starter-web 约 100MB+）。**可完全离线**：JUnit 5 console-standalone 单 JAR（代理以 `javac -cp jar` 实测跑通）与纯 JDK `com.sun.net.httpserver`（实测零依赖可运行）——Stage06 前 3 课可守住"纯 javac"传统，断层从 Spring 起步课一次性声明。

**测试顺序**：推荐"先 JUnit（给连续项目补测试，动机真实、测既有代码）→ 再 Spring → 框架测试收尾"的混合序（利大于弊，理由见代理报告 3.3）。

**Stage06 推荐清单（7 门 + 1 选做）**：

| # | 课程 | 前置 | 联网 |
| --- | --- | --- | --- |
| 1 | maven-basics（单模块工程/依赖/生命周期） | Stage05 | 首次是 |
| 2 | junit-basics（JUnit 5 + 测试替身，给连续项目补测试） | 1 或纯 javac 路径 | 可离线 |
| 3 | http-server-basics（纯 JDK HTTP 端点，Spring MVC 去魔法） | s03 全部 | 否 |
| 4 | spring-boot-start（@Service/@Autowired = "构造器接接口"的框架形态） | 1–3 | 是 |
| 5 | rest-crud（StudentEvolutionDemo CRUD → HTTP 接口） | 4 | 是 |
| 6 | validation-exception（Bean Validation + @ControllerAdvice） | 5 | 是 |
| 7 | mybatis-integration（延续 s05"SQL 可见"主线） | 5 + s05 | 是 |
| 选做 | logging-transactional（SLF4J + @Transactional 对应 s05 事务模板） | 4–5 | 是 |

**推迟**：认证/会话→07（与 Redis 合流）、Docker/CI/Testcontainers→08、加固/观测→09。**不引入（06）**：Spring Data JPA（隐藏 SQL 与 s05 主线冲突）、Lombok（遮蔽生成代码）、微服务/消息队列（项目 A 单体优先）、Thymeleaf（REST 项目）、Testcontainers（依赖 Docker）。

**前置依赖**：建议先落第一节+第二节的连接件修复（合计约一天），否则 Stage06 的"项目迁移"钩子仍无处可挂。

## 四、薄弱点清单（与 V2.3 修复去重后的 Top-10）

| # | 位置 | 问题 | 本轮处置 |
| --- | --- | --- | --- |
| 1 | TopicView/App/build.mjs:912 | stageLinks 死数据 | **本轮修**（数据+渲染） |
| 2 | topics.json algo 5 门 | stageLinks 失真 | **本轮修** |
| 3 | topics.json git 19 门 | 前 4 门缺 '01' | **本轮修** |
| 4 | s05-jdbc-dao + stage05 README | 契约升级无解释 | **本轮修** |
| 5 | stage04 课/练习 | 与连续项目零绑定 | **本轮修** |
| 6 | stage05/student | Service 缺席未声明 | **本轮修**（一句声明） |
| 7 | s03 java-advanced 7 门 | 0 预测 0 练习"读而不练" | **DEFER**（下轮补 3–5 道低成本预测题） |
| 8 | s02-entity-service | catch 前向未说明 | **本轮修**（一句） |
| 9 | Stage01 deep 编号导航 | 编号≠配对 + 03 文档表述不准 | **本轮修**（导航说明+文档修正） |
| 10 | Stage06 prereq | 工具链断层未前置声明 | 已写入第三节路线（建设时落地） |
