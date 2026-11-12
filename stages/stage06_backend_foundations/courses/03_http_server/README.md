# 原生 Java HTTP 服务：拆开看框架到底替你做了什么

> 对应工程：`stages/stage06_backend_foundations/maven-lab/`
> 代码：`src/main/java/com/javaroadmap/stage06/lab/http/StudentHttpServer.java`（纯 JDK `com.sun.net.httpserver`，零第三方依赖）

## 1. 为什么要手写一遍再学框架

课 5 你会用 Spring MVC 十几行注解写出同样的 REST 接口。如果直接学注解，你记住的是"咒语"；先手写一遍，你才知道每个注解背后**原本是一段什么代码**——学习框架就变成"知道它封装了什么"，而不是"祈祷它有效"。

**一个 HTTP 交互的完整解剖**（本课的全部内容就是这张图）：

```text
请求：  方法(GET/POST/PUT/DELETE) + 路径(/api/students/1) + 请求头 + 请求体
响应：  状态码(200/201/404/500) + 响应头(Content-Type) + 响应体(JSON)
服务器要做的三件事：① 按"方法+路径"分发到处理代码 ② 解析输入/序列化输出 ③ 把异常变成合理的状态码
```

## 2. 读懂分发器：Spring @GetMapping 的"素颜形态"

打开 `StudentHttpServer.java`，重点看 `handleStudents`：

- `server.createContext("/api/students", this::handleStudents)`——**路由注册**：一条 context 绑定一个路径前缀。`@RequestMapping("/api/students")` 注解的本质就是这一行。
- `exchange.getRequestURI().getPath()` + 正则 `/api/students/\d+`——**路径参数解析**。`@PathVariable int id` 的本质是这段字符串抠取 + 类型转换。
- `Optional.ofNullable(repository.findById(id))` + 404 分支——**"查不到"不是异常而是状态码**：404 表达"资源不存在"，500 表达"服务器自己出错了"。语义混用是 REST 最常见的新手错误。
- 兜底分支：`/api/students` 前缀下没有分支接住的请求（不支持的方法、或路径形态不匹配）→ **405 + Allow 头**；完全未知路径 → 由 JDK 默认 handler 返回 404。课 3 的 selftest 只测了 GET——405 分支留给你在练习里验证。
- `try/catch/finally` + `exchange.close()`——**异常兜底**：任何处理异常都变 500，且绝不吞掉（响应体带上异常类名，服务器日志记完整堆栈）。Spring 的 `@RestControllerAdvice` 就是把这段兜底集中到一处。

## 3. JSON：手写一遍才知道 Jackson 挡了多少

`toJson(Student)` 手工拼 JSON 字符串，`escape` 处理引号与反斜杠转义。姓名里带引号的学生会让手写拼接立刻现出原形——这正是课 5 中 Jackson `@RequestBody`/`@ResponseBody` 自动序列化的价值。请求方向的 JSON **解析**更繁琐（课 5 之前不做完整解析器，selftest 只走 GET）。

## 4. 预测运行：--selftest 的三条记录

```bash
./mvnw compile exec:java -Dexec.mainClass=com.javaroadmap.stage06.lab.http.StudentHttpServer -Dexec.args="--selftest"
```

（Windows Git Bash 下同样可用；`exec:java` 是 Maven 的 exec 插件目标，也可以 `./mvnw package` 后 `java -cp target/classes ...` 运行。）

预测以下三条输出再对照：

```text
GET /api/students   → 200 [{"id":1,...},{"id":2,...}]
GET /api/students/1 → 200 {...}
GET /api/students/999 → 404 {"error":"学生不存在","id":999}
```

**修改一个条件**：把 999 那次请求改成 `/api/students/abc`——预测会发生什么？实测 **405**（不是你直觉里的 400 或 500）：路径参数正则 `\d+` 不匹配 `abc`，`parseInt` 根本没执行，GET 分支接不住它，请求落进分发兜底。这说明手写分发器把"路径参数格式错"与"方法不支持"混在同一个兜底里——语义上 `abc` 应该是 400。课 5/6 的框架映射（`MethodArgumentTypeMismatchException → 400`）正是对这类粗粒度兜底的精细化。

## 5. 独立练习：给服务加 DELETE /api/students/{id}

**任务**：在分发器里增加 DELETE 分支——存在则删除并返回 204（无响应体），不存在返回 404。
完成条件：`--selftest` 的 report 里新增一行 `DELETE /api/students/1 → 204`，且再 GET /1 得到 404。
提示阶梯：L1 看 GET 分支怎么写 respond（204 时 `sendResponseHeaders(status, -1)` 表示无体）；L2 repository.deleteById 已有 false 返回值可复用；L3 selftest 里删除后再 GET /api/students/1 断言 404；L4 若 405 兜底吃掉了你的 DELETE，检查分支顺序——DELETE 分支必须放在两个 GET 分支之后、405 兜底之前。
**参考实现**：`practice/answers/REFERENCE_DELETE.md` 给出分发行与 selftest 行的参考写法（先自己写完再对照）。

## 6. 常见误区清单

- 状态码语义混用：找不到资源给 500、参数错误给 404——课 6 会给出完整的语义映射表。
- 忘记 `exchange.close()`：连接泄漏（本例在 finally 里）。
- JSON 拼接不做转义：用户名字里带 `"` 直接产生非法 JSON。
- 把业务逻辑写进分发器：分发器只路由，业务在 Service——课 5 的分层正是从这里自然长出来的。

## 7. 与后面课程的联系

课 4 起，你把同样的接口交给 Spring Boot：路由表变注解、JSON 拼接变 Jackson、异常兜底变 `@RestControllerAdvice`。到课 5 结束时，请回到本文件再读一遍 `handleStudents`——那时你会真正明白"框架封装了什么"这句话的分量。
