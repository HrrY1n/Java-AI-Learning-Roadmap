# 05 · Student Management API 实施记录（连续项目第 7 阶段）

## 一、从 StudentEvolutionDemo 到 Student Management API

Stage 05 演进项目（内存→文件→JDBC→约束→事务→演示）停在"服务层暂驻 main"。Stage 06 把它演进为分层 HTTP 应用：

| 演进点 | Stage 05 | Stage 06 student-api |
| --- | --- | --- |
| 入口 | main 里 `runCrudCycle(new XxxRepository())` | HTTP 端点（Controller） |
| Service | 无（有意裁剪，注释已声明） | `StudentService`（业务规则唯一所在地） |
| Repository | 6 方法契约 ×3 实现 | 同契约，InMemory 为默认 Bean（@Component） |
| 异常 | 裸 IllegalArgumentException | 类型化（NotFound/Duplicate）→ 状态码映射 |
| 数据库 | JDBC（真库已验） | 内存默认 + MyBatis/MySQL 路径（阻断记录） |

**契约声明**：Repository 接口签名零变更；Student 增 setEmail（PUT 更新真实需求）；删除 CSV 成员（文件版属 Stage05）。旧 Demo 的教学语义未被无解释地改变——课 5 正文与 02 文档均有映射表。

## 二、实现清单（真实文件）

| 文件 | 职责 |
| --- | --- |
| StudentApiApplication | 启动（@SpringBootApplication 三合成注解） |
| student/Student | 业务对象（构造器/setScore/setEmail 校验） |
| student/StudentRepository | 6 方法契约接口 |
| student/InMemoryStudentRepository | @Component 内存实现 + 类型化异常 + clear() |
| student/DuplicateStudentNoException / StudentNotFoundException | 类型化业务异常 |
| web/StudentCreateDto / StudentUpdateDto / StudentResponse / ApiError | HTTP 形状（record + Bean Validation） |
| web/StudentService | id 生成/DTO↔领域翻译/异常翻译 |
| web/StudentApiController | 五条端点（POST/GET 列表/GET 单查/PUT/DELETE） |
| web/ApiExceptionHandler | 异常→状态码集中映射（6 分支） |

## 三、运行与测试命令（可复现）

```bash
cd stages/stage06_backend_foundations/student-api
./mvnw test              # 14/14（Service 7 + HTTP 契约 7，含 Spring Boot 启动）
./mvnw spring-boot:run   # 启动后：GET /api/students → []，POST → 201 + Location
```

契约测试清单（7 条 HTTP）：见 02 文档第三节表。

## 四、有意的边界

- 无认证/无持久化/无日志框架配置（SLF4J 仅 500 分支）：Stage 06 范围 = 后端工程化基础闭环，认证与日志按既定路线留待后续 Stage（consolidation/04）。
- 内存版 id 生成（max+1）非并发安全：单线程语义下正确，并发版是 Stage04 任务 7 的实践主题（线程安全学生仓库）——边界在课程正文声明。
