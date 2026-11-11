# REST API 实战：把学生管理系统变成真正的 HTTP 服务

> 对应工程：`stages/stage06_backend_foundations/student-api/`
> 契约测试：`src/test/java/com/javaroadmap/stage06/api/web/StudentApiControllerTest.java`（14 条契约中的 7 条，全部走真实 HTTP）

## 1. 一步一步把接口长出来（含每一步的契约）

本课实现学生资源的完整 REST 契约。每条接口先给"HTTP 事实"，再给代码位置：

| 操作 | 方法 + 路径 | 成功 | 失败 | 代码位置 |
| --- | --- | --- | --- | --- |
| 创建 | POST /api/students | **201** + `Location: /api/students/{id}` | 400 校验失败 / **409** 学号冲突 | `StudentApiController.create` |
| 列表 | GET /api/students | 200 数组 | — | `list` |
| 单查 | GET /api/students/{id} | 200 | **404** | `get` |
| 修改 | PUT /api/students/{id} | 200 | 404 / 400 | `update` |
| 删除 | DELETE /api/students/{id} | **204**（无体） | 404 | `delete` |

**为什么是这些状态码**（REST 的语义表，不是随便挑的）：201 = 新资源已创建（用 Location 告诉客户端它在哪里）；204 = 成功且无内容可返回；404 = 请求的资源不存在；409 = 与资源的当前状态冲突（唯一学号正是典型）；400 = 请求本身不合法。全部错的地方一样常见：创建后给 200、删除后给 200 + body、404 与 500 混用——契约测试会在这些地方当场拦住你。

## 2. DTO 与业务对象：为什么"多写两个类"是赚的

- `StudentCreateDto`（record + 校验注解）：HTTP 入口形状。POST 用它，PUT 用 `StudentUpdateDto`（只有 score/email）——**学号与姓名注册后不可变**这条业务规则直接体现在了"改操作根本没有这两个字段"上，比任何注释都有约束力。
- `StudentResponse`（record + 静态工厂 `from(Student)`）：HTTP 出口形状。领域对象以后加内部字段，API 消费者不受冲击。
- 业务对象 `Student`：构造器与 `setScore` 自带校验——**领域规则在领域对象里**，Controller 与 Service 都不用重复 if。

方向箭头要记牢：DTO →（Service 翻译）→ Student →（Response.from）→ 响应体。Controller 不 new Student，Service 不认识 HttpServletRequest。

## 3. id 生成策略：一个被忽视的真实设计点

内存版 `nextId()` = 现有最大 id + 1（`StudentService.create`）。这个策略在单机内存下正确，但课 7 换 MySQL 后会变成 `AUTO_INCREMENT`——**生成主键的责任从 Service 移交给数据库**。这正是"分层后每层可替换"的具体例子：接口 `save(Student)` 不变，变的是 id 从哪来。课程不回避这个差异：内存版返回的 id 是 Service 分配的，MySQL 版返回的 id 是插入后数据库回填的。

## 4. 契约测试：用真 HTTP 断言，而不是 mock 假象

`StudentApiControllerTest` 用 `@SpringBootTest(webEnvironment = RANDOM_PORT)` 启动**真实应用**（内嵌 Tomcat 起随机端口），`TestRestTemplate` 发真请求。7 条测试覆盖：201+Location、列表/单查/404 统一错误体、400+fieldErrors 三字段明细、409、PUT 修改与 404、DELETE 204+后续 404、路径参数类型错→400。

两个必须知道的测试纪律（都写在代码注释里）：

- `@BeforeEach` 重置共享单例仓库——Spring Bean 状态**跨测试存活**，不重置的话 id 断言会随机失败（我们在开发中真实踩到：expected /api/students/1 but was /api/students/3）；
- 断言错误**响应体的形状**（error/message/fieldErrors 键名）而不只状态码——消费者写一次错误处理逻辑的承诺靠它兑现。

## 5. 预测运行（起服务后逐条预测）

```bash
./mvnw spring-boot:run
```

```text
GET  /api/students           → 初始是空数组 [] 还是 404？
POST /api/students           → 201；Location 路径里 id 是多少？
POST 同学号不同名            → 409，error 字段值？
GET  /api/students/abc       → 400 还是 500？（路径参数类型不匹配的映射在 ApiExceptionHandler）
DELETE /api/students/1       → 204；再 GET → 404
```

（自动化版本：`./mvnw test` 里 `StudentApiControllerTest` 逐条断言以上全部答案。）

## 6. 独立练习：新增"按学号精确查询"接口

**任务**：`GET /api/students/by-no/{studentNo}` 返回单个学生（200），不存在返回 404。
完成条件：在 `StudentApiControllerTest` 新增 2 条测试（命中 200 / 未命中 404 + 统一错误体），`./mvnw test` 全绿。
提示阶梯：L1 Controller 加方法 + Service 加 `findByStudentNo`（遍历或查 Map）；L2 记住异常类型化：抛 `StudentNotFoundException`（复用，消息用学号）而不是返回 null；L3 契约测试先写一个"不存在的学号"，看 404 错误体形状是否与你其他接口一致。

## 7. 常见误区与排查

- Controller 里 `if (id <= 0) return 400...`：分层破坏。用 `@Min`/`@PathVariable` 校验与异常映射解决。
- 创建成功返回 200：REST 惯例 201 + Location。
- 错误响应各接口一个形状：消费者没法写统一处理——`ApiError` record + `@RestControllerAdvice` 集中产出。
- 在 Controller/Service 里 `System.out.println` 排查：用 SLF4J（`log.error` 见 `ApiExceptionHandler` 的 500 分支——**根因进日志，细节不进响应体**）。

## 8. 与后面课程的联系

课 6 把校验失败（400）与异常映射讲透；课 7 把 `InMemoryStudentRepository` 的背后换成 MyBatis+MySQL，Controller/Service/DTO/契约测试**一行不改**——分层收益的最终检验。
