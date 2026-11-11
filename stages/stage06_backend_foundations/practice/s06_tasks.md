# Stage 06 独立工程任务（V2.5）

> 与课 1–7 配套的独立编程任务。与 Web 判题练习（L1–L4 + stdout 比对）不同，Maven/JUnit/Spring
> 任务在**你自己的工程副本**里完成——验证方式是"真实构建与测试"，不是输出比对。
> 每个任务都有：任务背景 → 任务内容 → 完成条件（可自检）→ L1–L4 提示。
> ⚠️ 先自己完整尝试，再对照 answers/ 里的参考实现。参考实现可独立复现，但直接复制不算完成。

## 任务 1：从零创建一个 Maven 工程（课 1）

**背景**：不 copy 本仓库的 maven-lab——从空目录开始搭一个能构建的 Maven 工程，Maven 才是你的。
**任务**：在 `my_practices/` 下新建 `s06-demo/`：pom.xml（坐标自定）+ `src/main/java/com/javaroadmap/s06demo/App.java`（main 打印一行自我介绍）。
**完成条件**：`mvn compile`（或 mvnw）零错误；`mvn package` 产出 jar；`mvn clean` 后 target 消失。
- **L1 理解问题**：Maven 按约定找 `src/main/java`——目录放错位置，坐标写错 groupId，构建立刻失败。
- **L2 相关知识**：课 1 第 2 节 pom.xml 三要素（坐标/release/UTF-8）；jar 名 = artifactId-version。
- **L3 结构思路**：先 `mvn compile` 让目录骨架跑通，再加 main。
- **L4 调试线索**：读第一条 `[ERROR]`；"找不到或无法加载主类"多半是 package 声明与目录不一致。

## 任务 2：给 StudentService 写"先红后绿"的测试（课 2）

**背景**：把 student-api 的 `StudentService` 契约用你自己的测试钉死。
**任务**：在 student-api 的 `src/test/java` 下新建你自己的测试类（不要改已有两个测试类），至少覆盖：顺序 id 分配、学号冲突 409 异常、update 缺失 id 异常、score 边界 0/100/150。
**完成条件**：`./mvnw test` 全绿，且其中至少一条测试**先经历一次红**（写完测试先跑，若直接绿，故意改错实现验证测试能抓到，再改回）。
- **L1**：先列 Service 的行为清单，一条行为一条测试。
- **L2**：参考 `StudentServiceTest` 的结构（@BeforeEach + assertThrows）。
- **L3**：边界值用 @ParameterizedTest（JUnit 5 参数化，查官方文档 10 分钟）。
- **L4**：测试红了先读 surefire 报告 `target/surefire-reports/`，再读断言消息。

## 任务 3：修复一个依赖注入错误（课 4）

**背景**：给出一段"字段注入 + 忘记 @Component"的坏代码（见 answers/task3-broken.md），目标是把它修复为可启动、可测试的分层写法。
**任务**：复现 answers/task3-broken.md 的代码结构 → 启动失败（NoSuchBeanDefinition）→ 用构造器注入 + 正确注解修复 → 测试全绿。
**完成条件**：`./mvnw test` 全绿；构造器签名里能看到全部依赖（无字段注入）。
- **L1**：启动报错读第一行 `NoSuchBeanDefinitionException: ... requires a bean`。
- **L2**：课 4 第 2 节构造器注入三步。
- **L3**：注入的必须是"容器里存在的 Bean"——检查注解是否打在实现类上。
- **L4**：`new StudentApiController(null)` 这种写法是字段注入的信号。

## 任务 4：新增 GET /api/students/by-no/{studentNo}（课 5）

**任务**：按课 5 独立练习的规格实现按学号查询，含 404 统一错误体契约。
**完成条件**：新增 2 条契约测试（200 命中 / 404 + error 字段），`./mvnw test` 全绿；用 curl 实测一次。
- **L1**：Controller 加方法、Service 加查询、异常复用 StudentNotFoundException（消息换成学号）。
- **L2**：404 错误体形状必须与 `ApiError` 一致（error/message 字段）。
- **L3**：Repository 层加 `findByStudentNo`？——不必：遍历 InMemory 即可；但想清楚为什么允许 Service 遍历而 Controller 不允许。
- **L4**：curl 的 URL 里学号要 URL 编码吗？——S001 是安全字符，想一想如果学号是 `S+01` 会怎样。

## 任务 5：为新接口补参数校验（课 6）

**任务**：给任务 4 的接口加"学号格式校验"（S 开头 + 数字），非法格式 → 400 + fieldErrors。
**完成条件**：新增 1 条契约测试断言 400 + `fieldErrors.studentNo` 存在；curl 实测。
- **L1**：校验注解打在哪个层？（入口 DTO——本任务没有 body，想路径参数怎么校验。）
- **L2**：路径参数校验要在类上加 `@Validated` + 方法参数加 `@Pattern`，异常类型与 body 校验不同（ConstraintViolationException）。
- **L3**：ApiExceptionHandler 需要新增一个 @ExceptionHandler 分支——映射到 400。
- **L4**：如果没加分支，这个异常会走到哪个兜底？（500——这正是"吞根因/状态码错"的现场。）

## 任务 6：修复错误状态码（课 5/6）

**任务**：把 `answers/task6-broken.md` 描述的坏 Controller（创建返回 200、缺失返回 500、学号冲突返回 500）修复为契约正确的版本；契约测试已给出（answers/task6-tests.md），**不得修改测试**。
**完成条件**：answers/task6-tests.md 的全部断言通过（用它替换/并入你的测试类后 `./mvnw test` 全绿）。
- **L1**：三条失败的断言分别期望什么状态码？
- **L2**：回看课 5 状态码表与课 6 映射表。
- **L3**：哪些该走异常映射（409/404），哪些该改返回值（201）。
- **L4**：禁止改测试——"改测试让实现过关"是测试体系最恶劣的破坏。

## 任务 7：给批量导入加事务（课 7 概念 + 内存版实践）

**任务**：给 student-api 新增 `POST /api/students/batch`（接收数组，整批成功 → 201 + Location 数组；任何一条失败 → 409 且全批不存在）。
**完成条件**：契约测试覆盖"全批成功"与"一条失败整批不存在"两场景，全绿；思考并注释：内存版的回滚与 MySQL 版的回滚分别靠什么实现。
- **L1**：Repository 已有 saveBatchAtomically（快照回滚）。
- **L2**：Service 里翻译"整批结果"：成功返回 Response 列表，冲突抛 DuplicateStudentNoException。
- **L3**：Controller 返回 201 时 Location 应该指向哪里？（批资源没有单独 URI——返回响应体数组 + 200/201 二选一并注释理由。）
- **L4**：思考题——MySQL 版若用 `@Transactional`，回滚靠的是数据库；内存版靠什么？（快照。）

## 任务 8：定位一次真实构建失败（课 1）

**任务**：按 answers/task8-broken.md 制造一个依赖冲突场景（两个库依赖不同版本的同一构件），复现构建警告 → 用 `mvn dependency:tree` 定位 → 用 `<exclusions>` 解决。
**完成条件**：dependency:tree 输出截图/文本里能指认冲突路径；修复后 tree 中只剩目标版本。
- **L1**：冲突的表象是"运行时 NoSuchMethodError"，不是构建失败。
- **L2**：`mvn dependency:tree -Dverbose` 显示被仲裁掉的版本。
- **L3**：exclusions 加在"带进来"的那个依赖上。
- **L4**：仲裁规则"最近优先"——路径长度决定胜负，先看树再动手。

## 自检与诚实声明

- 完成每个任务后，在 `my_practices/` 自己的进度文件里记录：日期、任务号、红→绿证据（命令输出）。
- 自动化部分（任务 2/4/5/6/7 的测试）用 `./mvnw test` 验证；任务 1/8 的验证是构建输出本身。
- 参考答案在 `answers/`——它们是**复现材料**，不是抄写目标。
