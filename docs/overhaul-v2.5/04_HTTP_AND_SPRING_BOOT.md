# 04 · HTTP 与 Spring Boot 实施记录

## 一、原生 HTTP（课 3）证据

`StudentHttpServer`（纯 JDK `com.sun.net.httpserver`）：
- 路由分发（GET 列表/GET 单个/405 兜底/404 兜底）、路径参数正则抠取、
- 状态码语义（200/404/405/500 + 课 3 练习扩展 204）、JSON 手写拼接（escape 转义）、
- `--selftest`：随机端口起服务 → JDK HttpClient 打自己的三个端点 → 输出可断言文本 → 退出（进入回归的形态）。

教学定位：每一段手写代码都标注了对应 Spring 注解（分发→@GetMapping、路径参数→@PathVariable、异常兜底→@RestControllerAdvice），课 4 对照表完成"封装了什么"的闭环。

## 二、Spring Boot（课 4-6）证据

| 项 | 结果 |
| --- | --- |
| 版本组合 | Spring Boot 3.5.6 + JDK 25 构建（`java.version=21`，学习者 JDK 21+ 可复现） |
| 启动测试 | `@SpringBootTest(RANDOM_PORT)`：Tomcat started on port 56434 + Started StudentApiControllerTest（真实上下文装配） |
| Service 单测 | 7 条（不启动 Spring：`new StudentService(new InMemoryStudentRepository())`） |
| HTTP 契约 | 7 条走真 HTTP（TestRestTemplate）：201+Location/列表/单查/404 错误体/400 三字段 fieldErrors/409/PUT/DELETE 204/路径参数 400 |
| 全量 | **Tests run: 14, Failures: 0, Errors: 0, BUILD SUCCESS** |

## 三、开发中踩到的真实问题（与修复）

1. **跨包类型缺导入**（Service 测试引用 web 包 DTO/Service）→ 补 import；
2. **`HttpEntity<>` 菱形推断失败**（`json(Object body)`）→ 参数收紧为 `Map<String, Object>`；
3. **缺 `java.util.List` 导入**（`List.class`）；
4. **单例 Bean 状态跨测试泄漏**：`expected /api/students/1 but was /api/students/3` → InMemory 仓库加 `clear()`（javadoc 声明仅供测试）+ 契约测试 `@BeforeEach` 重置。

每一条都是"编译器/测试当场抓 → 立即修复 → 测试转绿"的真实轨迹，没有一条靠放宽断言解决。

## 四、手写 → Spring 的能力映射表（课 3 ↔ 课 4-6）

| 手写（课 3） | Spring（课 4-6） |
| --- | --- |
| `createContext` + if-else 分发 | `@RestController` + `@GetMapping/@PostMapping/...` |
| 正则抠路径参数 + parseInt | `@PathVariable int id`（转换失败→400 映射） |
| `toJson` 手写拼接 + escape | Jackson 自动序列化（record） |
| catch-all → 500 | `@RestControllerAdvice` 按类型映射 + 日志纪律 |
| 手工状态码 | 201/204/404/409/400 语义化返回 |
