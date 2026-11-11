# JUnit 自动化测试：让 StudentRepository 的每一条承诺都可复现

> 对应工程：`stages/stage06_backend_foundations/maven-lab/`
> 被测对象：`src/main/java/com/javaroadmap/stage06/lab/student/`（Stage 05 契约的演练场副本）
> 测试代码：`src/test/java/com/javaroadmap/stage06/lab/student/InMemoryStudentRepositoryTest.java`

## 1. 为什么"手动跑一遍没问题"不算验证

Stage05 以来你验证过很多次 StudentRepository——开个 main、跑一下、看看输出。这种验证有三个致命伤：每次要人工执行、只覆盖你想得到的那条路径、改了代码后没人提醒你旧功能坏了。JUnit 把验证变成**代码**：一次编写，每次构建自动运行，任何一条承诺被破坏都会当场报错。

**心智模型**：一条 `@Test` = 一句可执行的承诺。"save 之后 findById 一定查得到"、"批内冲突必须整批回滚"——这些接口 javadoc 里写过的行为，现在每一条都有对应的测试代码钉死。

## 2. 读懂测试类的三个结构要素

打开 `InMemoryStudentRepositoryTest.java` 对照：

- **`@BeforeEach` + 生命周期**：每个 `@Test` 执行前都会重新 `setUp()`。这不是效率问题而是**正确性**问题——测试之间共享状态会让结果取决于运行顺序（flaky 的头号来源）。
- **`@DisplayName`**：用业务语言描述这条承诺。测试失败时你看到的是这句话而不是方法名。
- **断言三件套**：`assertEquals`（值相等）、`assertTrue/assertFalse`（条件）、`assertThrows`（异常路径）。**异常也是契约**：`saveBatchAtomically` 冲突时必须抛 `IllegalArgumentException` 且必须回滚——两条都要测。

## 3. 逐条对照：接口承诺 → 测试

| 接口承诺（javadoc） | 测试方法 | 验证的路径 |
| --- | --- | --- |
| save 后能查到 | `saveThenFindById` | 正常路径 |
| 查不到返回 null | `findByIdMissingReturnsNull` | 缺失路径 + 判空契约 |
| 同 id 覆盖 | `saveSameIdOverwrites` | 覆盖语义 + 数量断言 |
| 学号冲突抛异常且不留脏数据 | `duplicateStudentNoRejected` | **异常路径 + 失败原子性**（findById(2) 必须是 null） |
| updateScore 缺失返回 false | `updateScoreMissingReturnsFalse` | 返回值契约 |
| findAll 是快照副本 | `findAllIsSnapshot` | 防御性拷贝承诺 |
| 批量冲突整批回滚 | `batchRollbackOnConflict` | **事务语义**：回滚后 findById(2) null + 原数据 60 分不变 |
| 分数 0/100 合法、-1/101 拒绝 | `scoreBoundaries` | **边界值**（0 与 100 是合法边界，不是随便挑的数字） |

**预测运行**：先跑 `./mvnw test`，对照 `Tests run: 12, Failures: 0`。然后阅读 `batchRollbackOnConflict`：先预测"批内第二条抛异常后，id=2 的学生存在吗？id=1 的分数是 60 还是 80？"再读实现里的快照回滚三行代码。

## 4. 修改一个条件：亲手制造三种测试失败

1. 把 `batchRollbackOnConflict` 里的 `assertTrue(e.getMessage().contains("学号已存在"))` 改成 `assertTrue(e.getMessage().contains("冲突"))`——测试红了：**消息也是契约**。改回去。
2. 把 `@BeforeEach` 的 `repository = new InMemoryStudentRepository();` 注释掉——预测会发生什么？（NPE：这是生命周期存在的意义。）改回去。
3. 给 `InMemoryStudentRepository.findAll` 换成 `return store.values().stream().toList();`——测试还绿吗？（`toList()` 也是快照，绿；换成 `List.copyOf(store.values())` 呢？也是快照。）再试试直接 `return (List) store.values();`——红：**防御性拷贝不是风格，是承诺**。

## 5. 独立练习：给 Student 补上"邮箱更新"测试（含异常路径）

**任务**：`Student` 类有 `setScore`（校验 0~100）——请先给 `Student` 增加 `setEmail(String)`（规则：空白回落 "-"，其余 trim 保存），然后在测试类新增至少 3 条测试：合法更新、null 回落、以及你自选的一条边界。
完成条件：`./mvnw test` 全绿，且你新增的每条测试**先在故意写错的实现上跑红过一次**（方法：把 setEmail 写成不回落 "-"，看哪条测试红——这就是"测试确实在测东西"的证据）。
提示阶梯：L1 先想清楚 setEmail 的三条规则；L2 参考 setScore 的校验写法；L3 测试方法命名用"行为_条件_预期"结构；L4 若断言失败先看 surefire 报告 `target/surefire-reports/`。

## 6. 测试的边界：通过 ≠ 正确

12 条全绿只能证明：**你想到过的承诺**没有被破坏。它不能证明业务规则本身是对的，也不能覆盖你没想到的输入组合。所以工程实践是三层组合：单元测试（本课，毫秒级、海量）+ 集成测试（课 5 的 @SpringBootTest 起真实 HTTP）+ 人工抽查。跳过任何一层都会付代价。

## 7. 与后面课程的联系

课 3 的 HTTP 服务会消费同一个 `StudentRepository`——它的行为已经被本课的测试钉死，所以课 3 只需要测试 HTTP 层自己的逻辑。课 5 的 `@SpringBootTest` 会再起一层"真实 HTTP 契约测试"，三层测试金字塔（Service 单元 → 接口契约 → 端到端）从这里开始成形。
