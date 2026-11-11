# Maven 工程基础：从"一堆文件"到"有生命的工程"

> 对应工程：`stages/stage06_backend_foundations/maven-lab/`（本课全部命令都在该目录执行）
> 前置：Stage 01–05（尤其 Stage05 的连续项目与"契约升级"说明）

## 1. 为什么 Stage 05 之前不需要 Maven，现在需要了

Stage01–05 我们用 `javac` + `java` 直接编译运行，所有的"依赖"只有一个 JDK。这条路在两个文件互相调用时尚可，但一个真实后端项目会有 50–200 个第三方库（JSON、数据库驱动、Web 框架、日志……），手动下载 jar、手动拼 classpath、手动传给同事，很快就会失控。Maven 解决的正是三件事：

1. **标准化结构**：所有人的源码都在 `src/main/java`，测试在 `src/test/java`，产物在 `target/`——工具与人都不用再猜。
2. **声明式依赖**：你在 `pom.xml` 里"声明"需要什么库与版本，Maven 负责从中央仓库下载并放进 classpath。
3. **标准生命周期**：`compile → test → package` 这些阶段所有人含义一致，CI 服务器也因此能自动化。

**心智模型**：pom.xml 是工程的"身份证 + 采购清单"，`src/` 是原料，`target/` 是车间产出（可随时删除重建，从不提交进 Git）。

## 2. 读懂本工程的 pom.xml

打开 `maven-lab/pom.xml` 对照本节：

- **坐标三元组** `groupId:artifactId:version`（`com.javaroadmap:stage06-maven-lab:0.1.0`）——Maven 世界里定位一个构件的唯一地址。别人的项目要引用你的库，写的正是这三个值。
- **properties** 里的 `maven.compiler.release=21`：编译产物按 Java 21 字节码生成——这是它能在任何 JDK 21+ 上运行的原因（本仓库用 JDK 25 构建验证）。
- **dependencies** 里的 `junit-jupiter`，`scope=test`：只在测试编译与运行时可用，不会进入最终 jar。依赖同样有坐标，Maven 按"本地仓库 → 远端仓库"的顺序查找。
- **本地仓库**：`~/.m2/repository`。第一次 `mvn test` 会联网下载JUnit 相关 jar 到这里，之后完全离线可用——这就是为什么第二次构建明显变快。

## 3. 生命周期：compile、test、package 不是三条命令，是一条流水线上的站牌

```text
validate → compile → test → package → (verify → install → deploy)
```

Maven 的生命周期是**有序阶段链**：执行某个阶段，它之前的所有阶段自动先行。所以：

- `mvn compile`：只把 `src/main/java` 编译到 `target/classes`；
- `mvn test`：先 compile，再把 `src/test/java` 编译到 `target/test-classes`，然后运行所有测试；
- `mvn package`：先 test，再把产物打成 `target/stage06-maven-lab-0.1.0.jar`。

**Observe（先预测再运行）**：在 `maven-lab/` 里依次执行下面命令并对照预测——

```bash
./mvnw compile                 # 预测：哪些目录会被创建？
./mvnw test                    # 预测：输出里 Tests run 是多少？为什么比上次快？
./mvnw package                 # 预测：target/ 下会出现什么文件？
```

（Windows 上没有 `./mvnw` 时用 `mvnw.cmd test`，或直接 `mvn test`。）

## 4. Maven Wrapper：为什么仓库里提交了 mvnw 而不是让你装 Maven

`./mvnw` 是 Maven 官方 Wrapper 脚本。第一次运行时它读取 `.mvn/wrapper/maven-wrapper.properties` 里的 `distributionUrl`，把指定版本的 Maven 下载到 `~/.m2/wrapper`，之后的每次运行都用这个固定版本。价值：

- 所有协作者与 CI 用**同一个 Maven 版本**，"我机器上能跑"消失；
- 新学习者 clone 仓库后**不需要预装 Maven**（只要有 JDK）；
- 版本升级 = 改一行 properties，全仓库生效。

本仓库的 Wrapper 固定 Maven 3.9.9，来源是 Maven Central 官方仓库。

## 5. 动手：修改一个条件

1. 把 pom.xml 的 `<version>0.1.0</version>` 改成 `0.2.0`，再 `./mvnw package`——预测 jar 文件名怎么变。
2. 把 `maven.compiler.release` 改成 `8` 再 `./mvnw test`——预测会成功还是失败？改回 21。（提示：源码里用了 `List.of`、文本块吗？没有的话能过，但这正好说明 release 的含义：它决定产物兼容哪个 Java 版本，而不是你现在用什么 JDK。）
3. 删除整个 `target/` 目录再 `./mvnw test`——预测会发生什么？（答案：一切照常。target 是纯产物，这也是它从不进 Git 的原因。）

## 6. 独立练习

**任务**：给 pom.xml 添加 `maven-jar-plugin` 配置，把 `Main-Class`（可先用 `com.javaroadmap.stage06.lab.student.Student` 建一个简单的 `main`）写进 manifest，然后 `./mvnw package`，并用 `java -jar target/stage06-maven-lab-0.2.0.jar` 运行成功。
完成条件：`java -jar` 输出你的 main 方法打印内容。排查线索：构建失败时 Maven 会打印第一条 `[ERROR]`——先读它，90% 的构建失败答案就在第一行错误里。

## 7. 常见依赖冲突与排查（先建立概念，课 5 会实战）

当 A 库依赖 X-1.0、B 库依赖 X-2.0 时，Maven 默认取"路径最近"的那个——这就是依赖仲裁。排查武器只有两条命令：

- `mvn dependency:tree`：打印整棵依赖树，冲突一目了然；
- `<exclusions>`：在某个依赖里显式排除它带进来的坏版本。

构建失败排查的通用顺序：读第一条 `[ERROR]` → 定位是编译错（看文件：行）还是测试错（看 surefire 报告 `target/surefire-reports/`）还是依赖错（`dependency:tree`）。本课的"排查构建失败"练习会反复用到这个顺序。

## 8. 与后面课程的联系

课 2 会在同一个工程里为 `StudentRepository` 建立真实 JUnit 测试；课 3 用纯 JDK 在这个工程里长出一个 HTTP 服务；课 4 的 `student-api` 工程会展示同一个 pom 结构在加上 `spring-boot-starter-parent` 之后如何变成后端应用——你会在那里见到 `dependencyManagement` 现实工作的样子。
