# V2.5 课 7 的数据库集成状态与接入路线

> 更新：2026-11-11（V2.5 轮 R10）· 本文件是课 7"MyBatis 数据访问"的配套状态文档与真库接入手册。

## 一、当前状态（如实声明）

| 验证等级 | 状态 | 说明 |
| --- | --- | --- |
| 编译验证 | ✅ 通过 | `mybatis-lab` 模块 `./mvnw test`：3/3 测试通过（含 Maven 编译） |
| 解析与绑定验证 | ✅ 通过 | `StudentMapperBindingTest`：SqlSessionFactory 构建、7 条语句注册、`#{}` 注入防护静态检查——**全程无需数据库** |
| **真实 MySQL 集成验证** | ⛔ **阻断** | 开发环境 Docker 引擎未运行、`jrl-mysql-v22` 容器不可访问（见 docs/consolidation/08 纪律：不擅自启动 Docker Desktop） |

**含义**：课 7 正文与 Mapper 代码可信（编译 + 解析 + 绑定三层已验证），但"运行后应看到"级别的断言（真实查询/插入/事务回滚）**未经真库实证**。不冒充已通过。

## 二、解除阻断的操作清单（所有者授权启动 Docker Desktop 后可复现）

1. 启动 Docker Desktop（或确认已在运行）。
2. 恢复隔离测试库（二选一）：
   - 若容器仍在：`docker start jrl-mysql-v22`（历史容器，3307 端口）；
   - 若已不存在：`docker run -d --name jrl-mysql-v25 -p 3307:3306 -e MYSQL_ROOT_PASSWORD=<本机口令> -e MYSQL_DATABASE=javaroadmap_lab_test mysql:8.0`（密码不入仓库）。
3. 建表：用 Stage 05 的 `stages/stage05_mysql_db/sql/01_constraints.sql`（`students` 表已含唯一学号约束）。
4. 配置：`mybatis-lab` 的 `mybatis-config.xml` 增加 environments 段（JDBC 指向 3307），或 `student-api` 增加 `application-mysql.properties`。
5. 新增集成测试：`@SpringBootTest + @ActiveProfiles("mysql")` **复用 `StudentApiControllerTest` 的同一套契约**（课 5 分层的最终收益），外加 MyBatis 版批量事务回滚断言。
6. 运行后把结果回填到本文件第三节表格。

## 三、真库运行后的验证登记表（待填）

| 场景 | 预期 | 实测 |
| --- | --- | --- |
| findById(1) | 200 返回 S001 | （待填） |
| insert + useGeneratedKeys 回填 id | 返回自增 id | （待填） |
| findByStudentNo("S001") | 命中 | （待填） |
| 唯一学号冲突 | MySQL 1062 → DuplicateKeyException → 409 | （待填） |
| 批量插入中一条违规 | 事务回滚，全批不存在 | （待填） |
| `#{}` 参数绑定 | Preparing/Parameters 日志显示占位符 | （待填） |

## 四、给学习者的说明（与课 7 口径一致）

学习路径分两条，且都真实可用：
1. **零依赖路径**（默认）：`student-api` 内存版 + `mybatis-lab` 的解析/绑定验证——不需要任何数据库，全部可本地复现。
2. **真库路径**（可选）：按本文件第二节操作，同一套接口与契约测试在真实 MySQL 上复跑。两条路径通过 profile/实现类切换——这正是分层架构的回报。
