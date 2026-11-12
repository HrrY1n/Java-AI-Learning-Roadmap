# 参数校验与异常处理：把"错误"变成 API 的一等公民

> 对应工程：`stages/stage06_backend_foundations/student-api/`
> 代码：`StudentCreateDto/StudentUpdateDto`（校验注解）、`ApiExceptionHandler`（异常→状态码映射）、`ApiError`（统一错误体）
> 契约测试：`validationFailuresReturn400WithFieldErrors`、`badPathParameterReturns400`

## 1. 校验发生在哪一层？答案是"入口层 + 领域层"双保险

同一个"分数必须在 0~100"规则在两处出现，这不是重复而是纵深防御（Stage 05 数据库约束课讲过同一思想）：

1. **入口层（DTO 注解）**：`@Min(0) @Max(100)` 在请求进入业务之前拦截，失败 → **400 + fieldErrors**，逐字段说明哪里错、为什么。客户端能一次修好所有字段。
2. **领域层（Student 构造器/setScore）**：即使有人绕过 HTTP 直接调用 Service（比如将来的定时任务），业务对象仍然拒绝非法状态。**领域是最后的守门员。**

只做第 1 层：其他调用路径（未来内部 API）绕过校验，脏数据入库。只做第 2 层：HTTP 客户端拿到的是 400 还是 500 全看异常映射写得细不细，且一次只能暴露一个字段错误。

## 2. Bean Validation 的运行机制（不是魔法）

`@Valid @RequestBody StudentCreateDto dto` 触发的完整链条：

```text
Jackson 反序列化 JSON → @Valid 触发 Hibernate Validator 校验注解
→ 失败：抛 MethodArgumentNotValidException（携带每个字段的 message）
→ @RestControllerAdvice 捕获 → 400 + ApiError{message, fieldErrors}
→ 成功：Controller 方法体执行，参数已是"合法 DTO"
```

注意注解写的是 `Integer score` 而非 `int`：`null` 表示"未提供"（create 时回落 0 由 Service 处理），`@Min/@Max` 对 null 不触发校验——**null 与越界是两个不同的错误**，语义要分清。邮箱正则末尾的 `|^-$` 放行占位符 `-`：领域约定"邮箱可以为空但用 `-` 表示"（`Student` 构造器回落规则），校验层必须认识这个业务哨兵值。

## 3. 异常→状态码映射表（本 API 的完整语义表）

| 异常 | 状态码 | 理由 |
| --- | --- | --- |
| `MethodArgumentNotValidException`（DTO 校验失败） | 400 + fieldErrors | 请求本身不合法 |
| `MethodArgumentTypeMismatchException`（路径 id 不是数字） | 400 | 同上，入口问题 |
| `HttpMessageNotReadableException`（JSON 语法错/字段类型错/缺 body） | 400 | 同上，入口问题（Spring 默认语义，经显式分支声明防 500 兜底吞掉） |
| `StudentNotFoundException` | 404 | 资源不存在 |
| `DuplicateStudentNoException` | 409 | 与资源当前状态冲突（唯一学号） |
| `IllegalArgumentException`（领域对象校验，绕过注解的路径） | 400 | 兜底业务校验 |
| 其他一切 `Exception` | 500 + **完整堆栈进日志**，响应体只给通用提示 | 不泄露内部细节，不吞根因 |

**演进点（与 Stage 05 对比）**：Stage 05 的内存仓库抛裸 `IllegalArgumentException("学号已存在：…")`；本阶段把它**类型化**为 `DuplicateStudentNoException`——映射逻辑从"解析消息字符串"变成"按异常类型分发"。类型化业务异常是分层应用的标准做法。

## 4. 统一错误体：消费者的效率来自形状稳定

所有非 2xx 响应都是：

```json
{"status":400, "error":"Bad Request", "message":"请求参数校验失败",
 "fieldErrors":{"studentNo":"学号不能为空","score":"分数不能大于 100","email":"邮箱格式不正确"}}
```

前端/脚本只需写一次"读 status → 读 fieldErrors"的逻辑。`fieldErrors` 只在 400 校验失败出现——比"永远塞一个空字段"诚实。

## 5. 真实错误案例复现（起服务后逐条打）

```bash
# ① 校验失败：一次暴露三个字段（先预测 fieldErrors 有哪几个键）
curl -i -X POST .../api/students -H "Content-Type: application/json" \
  -d '{"studentNo":"","name":"小明","score":150,"email":"not-an-email"}'      # → 400

# ② 类型化业务异常：唯一学号冲突——同一学号 POST 两次，第一次 201、第二次 409
curl -i -X POST .../api/students -H "Content-Type: application/json" \
  -d '{"studentNo":"S001","name":"小明","score":70,"email":"-"}'              # → 201（首次创建成功）
curl -i -X POST .../api/students -H "Content-Type: application/json" \
  -d '{"studentNo":"S001","name":"冒名者","score":70,"email":"-"}'            # → 409（学号已被占用）

# ③ 路径参数类型错：400（不是 500！）
curl -i .../api/students/abc                                                  # → 400

# ④ 未知异常路径：500 + 日志有完整堆栈、响应体无内部细节
```

自动化版本全部在 `StudentApiControllerTest`（400/409/404/204 每条都有断言）。

## 6. 修改一个条件：亲手制造"吞根因"

把 `ApiExceptionHandler.handleUnexpected` 里的 `log.error("未处理的异常", e);` 注释掉，再造一个 500——响应照样 500，**但服务器日志里根因消失**。这就是"吞掉根因"的事故现场：线上只能看到"服务器内部错误"，排障无从下手。恢复该行。这个练习的价值：500 分支"记日志 + 给通用提示"两个动作缺一不可。

## 7. 独立练习：给 ApiError 增加 timestamp 字段

**任务**：`ApiError` 增加 `timestamp: String`（ISO-8601，`Instant.now().toString()`），同步修改 `of` 工厂与受影响的测试断言（形状断言加 timestamp 非空校验）。
完成条件：任一 400/404 响应体含非空 timestamp，`./mvnw test` 全绿。
提示阶梯：L1 record 加字段 + 工厂里赋值；L2 注意 `of` 有几个调用点；L3 契约测试里断言 `assertNotNull(body.get("timestamp"))`；L4 想 10 秒钟：timestamp 放服务器本地时间还是 UTC？（答案在测试里写死你的选择并说明理由。）

## 8. 与后面课程的联系

课 7 接入 MyBatis/MySQL 后会出现新的异常家族：`DataAccessException`（SQL 错误）、约束冲突（`DuplicateKeyException`——注意它与内存版 `DuplicateStudentNoException` 的语义对应）、连接失败。异常映射表会新增行，但**结构不变**：这正是把映射集中在一处的回报。
