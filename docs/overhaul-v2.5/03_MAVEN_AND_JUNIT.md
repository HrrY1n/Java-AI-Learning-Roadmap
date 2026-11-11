# 03 · Maven 与 JUnit 实施记录

## 一、Maven 安装与 Wrapper 决策

- 本机无系统 Maven；不改用户系统配置 → 下载**官方 Maven 3.9.9**（Maven Central 发行包，SHA-512 校验脚本 `.audit-work/v25/setup-maven.sh`）到 gitignored 的 `.audit-work/tools/` 供本地构建。
- 三个工程**提交 Maven Wrapper**（`mvnw`/`mvnw.cmd`/`.mvn/wrapper/maven-wrapper.properties`，`type=only-script` 不含二进制 jar）：学习者与 CI 首次运行自动从 Maven Central 下载 Maven 3.9.9——"可复现的安装"且零系统侵入。
- `distributionUrl=https://repo.maven.apache.org/maven2/.../apache-maven-3.9.9-bin.zip`（官方 Central 渠道）。

## 二、maven-lab 构建/测试证据（JDK 25 + release 21）

```text
./mvnw test → Tests run: 12, Failures: 0, Errors: 0（12 条覆盖正常/边界/异常/回滚/快照）
./mvnw compile exec:java ... --selftest →
  GET /api/students   → 200 [...]
  GET /api/students/1 → 200 {...}
  GET /api/students/999 → 404 {...}
```

开发中踩坑（真实失败案例）：`StringBuilder.add` 不存在（compile error）——修正为 `append` 后通过。

## 三、JUnit 测试清单（12 条映射表）

见课 2 §3 的"接口承诺 → 测试"表。要点：
- 生命周期：`@BeforeEach` 重建仓库（测试隔离是正确性问题）；
- 异常路径：`assertThrows` + **消息关键词断言**（"学号已存在"）+ 失败原子性（`findById(2)` 必须为 null）；
- 边界值：0/100 合法、-1/101 拒绝（构造器与 setScore 双保险）；
- 事务语义：批量冲突 → 快照回滚 → "新学生不存在 + 原数据 60 分不变"双断言。

## 四、CI 接入

- `scripts/verify_stage06.sh`：三个工程依序 `./mvnw -q test`，失败聚合报错退出 1；本地与 CI 同一脚本。
- `.github/workflows/verify.yml` 新增 "Run Stage06 backend Maven tests" 步骤（windows+macos 矩阵）+ `actions/cache` 缓存 `~/.m2/repository`（key 按 pom 指纹；首次完整下载，后续复用）。
- wrapper 在 CI 的行为：自动下载 Maven 3.9.9 → 无需 setup-maven/系统安装。

## 五、JUnit 之外的验证层次（诚实标注）

- mybatis-lab：3 条**无数据库**验证（SqlSessionFactory 解析 / 7 语句绑定 / `${}` 注入静态检查）——编译验证之上的第二级；真实 MySQL 执行验证阻断中（07 文档）。
- `MyBatisLabApp`（含 main）：满足"每课主文件含 main"的仓库门禁，同时是无 DB 的绑定演示入口。
