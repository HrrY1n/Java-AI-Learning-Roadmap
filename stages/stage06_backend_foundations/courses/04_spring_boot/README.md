# Spring Boot 入门：从手写分发器到注解驱动的分层应用

> 对应工程：`stages/stage06_backend_foundations/student-api/`
> 前置：课 3（手写过 HTTP 分发器）、Stage03–05（接口、异常、Repository 演进）

## 1. Spring 与 Spring Boot 的关系，一句话讲清

- **Spring（Framework）** 提供核心能力：**IoC 容器**（帮你创建和装配对象）与 Spring MVC（Web 层封装）。
- **Spring Boot** 在 Spring 之上加了"约定 + 自动装配 + 内嵌服务器"：让一个 Web 应用**一条命令就能启动**，而不需要手写几十行 XML 或配置。

一个可核验的对照：课 3 的 `StudentHttpServer` 要自己 `HttpServer.create`、自己分发、自己拼 JSON；本课的 `StudentApiApplication` 核心只有 `SpringApplication.run(...)` 一行——它之内自动完成了内嵌 Tomcat 启动、路由注册、JSON 编解码、异常映射。

## 2. IoC 与依赖注入：从"new"到"要"

课 3 里 `new StudentHttpServer(new InMemoryStudentRepository())`——**谁用谁自己 new**，两层代码焊死。Spring 的做法是反转这个控制权（IoC，Inversion of Control）：

1. 你给类打标记：`@Component`/`@Service`（"请把我注册成一个 Bean"）；
2. Spring 启动时扫描（`@ComponentScan`，`@SpringBootApplication` 自带），创建这些对象放进容器（`ApplicationContext`）；
3. 谁需要协作对象，**只声明构造器参数**：`public StudentService(StudentRepository repository)`——Spring 装配时自动把 Bean 递进来。注意注入的是**接口**而非实现：这正是课 7 能把 Repository 背后换成 MyBatis 而上层代码不动的前提。

这就是**构造器注入**。为什么坚持构造器注入而不是字段 `@Autowired`：依赖在编译期可见（看构造器签名就知道要什么）、不可变（final）、不依赖 Spring 也能 new（student-api 的 `StudentServiceTest` 沿用课 2 的可测试性论证，`new StudentService(new InMemoryStudentRepository())` 毫秒级跑完——**这就是分层 + 构造器注入换来的可测试性**）。

## 3. 自动配置：为什么一行配置不写就有 Tomcat

`@SpringBootApplication` 里的 `@EnableAutoConfiguration` 按 **classpath 里有什么**决定装配什么：项目里有 `spring-boot-starter-web`（带内嵌 Tomcat），Spring Boot 就自动配置 Tomcat + Spring MVC + Jackson JSON 编解码；没有数据库驱动，就不装配数据源。**这不是魔法，是条件化的 @Bean 配置**（`@ConditionalOnClass` 等）——代价与收益都要明白：你获得了零配置启动，也让"classpath 决定行为"成为排查问题时的第一 suspects。

## 4. 分层结构：Controller → Service → Repository

本工程的包结构就是分层的物理表现：

```text
web/     StudentApiController(@RestController) + DTO(record) + ApiExceptionHandler + ApiError
student/ Student(业务对象) + StudentRepository(接口) + InMemoryStudentRepository(@Component)
```

各层职责（课 5 用真实代码展开论证）：

- **Controller** 只做 HTTP ↔ Java 翻译：收 `@RequestBody` DTO、调 Service、返回 DTO/状态码。里面没有 if 业务判断。
- **Service** 是业务规则唯一所在地：id 生成策略、"学号与姓名注册后不可变"、把 Repository 的 null/异常翻译成业务异常（`StudentNotFoundException`）。
- **Repository** 只谈存取，签名与 Stage 05 契约逐条一致（6 方法）。
- **DTO 与业务对象分离**：`StudentCreateDto`（record + Bean Validation 注解）进、`StudentResponse`（record）出，中间是 `Student`。为什么值得多写两个类：HTTP 形状变化不再冲击领域对象，反之亦然；且 DTO 上的校验注解与领域内校验（Student 构造器）各管一段入口。

## 5. 启动流程与运行环境

`./mvnw spring-boot:run`（或 `./mvnw package` 后 `java -jar target/student-api-0.1.0.jar`）。启动日志里值得读的三行：

- `Tomcat started on port 8080`——内嵌服务器就绪（`application.properties` 里的 `server.port=8080`）；
- `Started StudentApiApplication in X seconds`——容器装配完成；
- 若加了数据库依赖但没配数据源，启动会**直接失败**——Spring Boot 的 fail-fast 是特性不是缺陷（本工程默认零依赖内存版，就是为了这条初学路径）。

**配置文件与运行环境**：`application.properties` 是默认值，`application-{profile}.properties` 是某环境的覆盖值，启动时 `--spring.profiles.active=mysql` 选择。本工程预留了这一机制给课 7 的 MySQL 版本——默认 profile 永远是零依赖内存版。

## 6. 预测运行

```bash
./mvnw spring-boot:run    # 窗口 1：启动（保持运行）
```

窗口 2（curl 或浏览器）：

```bash
curl http://127.0.0.1:8080/api/students          # 预测：初始状态返回什么？
curl -i -X POST http://127.0.0.1:8080/api/students -H "Content-Type: application/json" \
  -d '{"studentNo":"S101","name":"测试生","score":80,"email":"-"}'
# 预测：状态码？响应头里 Location 是什么？
```

（Windows PowerShell 下 curl 转义麻烦，推荐直接用课 5 的契约测试或 IDEA HTTP Client；本仓库的自动化验证由 `StudentApiControllerTest` 承担。）

## 7. 修改一个条件 + 常见误区

1. 把 `server.port=8080` 改成 `8081` 再启动——预测 curl 地址怎么变。改回。
2. 删掉 `StudentApiController` 构造器参数，改成字段 `@Autowired private StudentService service;`——测试还绿吗？（绿，Spring 两种都支持。）但这让 `new StudentApiController(...)` 变得不可能——可测试性损失见课 2 的论证。
3. 常见误区：把业务判断写进 Controller（一个 if 都不该有）；在 Service 里拼 HTTP 状态码（状态码语义属于异常映射层）；以为"加了注解就有 Bean"——注解只在被扫描到的包内生效。

## 8. 与后面课程的联系

课 5 逐条实现学生 REST API 并用真实 HTTP 契约测试钉死行为；课 6 集中处理参数校验与异常映射；课 7 把 Repository 的背后从内存换成 MyBatis + MySQL。本课建立的分层骨架，之后每一课都只动其中一层。
