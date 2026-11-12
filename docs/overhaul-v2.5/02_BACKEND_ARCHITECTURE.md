# 02 · Student Management API 架构（后端演进第 7 阶段）

## 一、契约映射：Stage05 → Stage06（逐项）

| Stage05（existing_course） | Stage06（student-api） | 差异与理由 |
| --- | --- | --- |
| `Student`（5 字段，构造器校验，toCsvLine/fromCsvLine） | `Student`（同 5 字段同校验；去 CSV 成员，加 setEmail） | CSV 属 Stage05 文件版；email 更新是 REST PUT 的真实需求 |
| `StudentRepository` 6 方法，findById→null | 同签名逐条一致 | **零契约变更**——分层演示的前提 |
| `InMemoryStudentRepository`（裸 IllegalArgumentException） | 同实现 + `DuplicateStudentNoException`（类型化）+ `clear()`（测试重置） | 类型化异常→409 映射；clear 仅供测试（javadoc 声明） |
| `JdbcStudentRepository`（Stage05 MySQL） | 暂不迁移；课 7 MyBatis 为下一存储实现 | 分层收益的检验：换存储上层零改动 |
| 快照回滚 saveBatchAtomically | 同语义（内存）；MySQL profile 真事务为后续 | 课 7 与 07 文档记录 |

## 二、最终架构（真实代码位置）

```text
HTTP Client
    ↓
StudentApiController        web/  @RestController——只做 HTTP↔Java 翻译
    ↓ @Valid DTO
StudentService              web/  @Service——业务规则唯一所在地（id 生成/异常翻译/DTO↔Student）
    ↓ 构造器注入
StudentRepository           student/ 接口（6 方法契约）
    ↓
InMemoryStudentRepository   student/ @Component——默认实现（零依赖路径）
    （MySQL 路径）           MyBatis Mapper + DataSource（profile 切换，真库集成=阻断记录）
```

分层为什么这样划（课 5 论证的浓缩）：
1. Controller 无 if：业务判断唯一归属 Service →"同一规则两处实现"的不一致被结构性排除；
2. Service 依赖接口：换存储/测试替身不动业务层（课 2 的毫秒级单测是证据）；
3. DTO 与领域对象分离：HTTP 形状变化与领域规则变化解耦（Create/Update/Response 三个 record 的字段差异即业务规则本身）。

## 三、REST 契约（14 条测试钉死）

| 契约 | 测试（StudentApiControllerTest） |
| --- | --- |
| POST → 201 + Location `/api/students/{id}` | createReturns201WithLocation |
| GET 列表/单查 200；缺失 404+`{error,message}` | getAndNotFound |
| 三字段校验失败 → 400 + fieldErrors（studentNo/score/email） | validationFailuresReturn400WithFieldErrors |
| 学号冲突 → 409 Conflict | duplicateStudentNoReturns409 |
| PUT 200（score+email；学号姓名不可变）/PUT 缺失 404 | updateAndMissing |
| DELETE 204 → 再 GET 404 | deleteReturns204Then404 |
| 路径参数类型错 → 400（禁 500） | badPathParameterReturns400 |

异常映射（ApiExceptionHandler）：Validation→400+fieldErrors；TypeMismatch→400；NotFound→404；Duplicate→409；IllegalArgument→400；兜底 Exception→500（**堆栈进日志、响应体无内部细节**——不吞根因纪律）。

## 四、运行路径（从零复现）

```bash
# 零依赖路径（默认，无需数据库/无需 Docker）
cd stages/stage06_backend_foundations/student-api
./mvnw spring-boot:run                      # 启动（JDK 21+；首次自动下载 Maven 3.9.9 与依赖）
curl http://127.0.0.1:8080/api/students     # []

# 测试（14 条：Service 单元 7 + HTTP 契约 7）
./mvnw test

# 打包运行
./mvnw package && java -jar target/student-api-0.1.0.jar
```

真实 MySQL 路径：见 07_DATABASE_INTEGRATION.md（当前阻断，接入手册已备）。
