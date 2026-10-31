# Java 课程目录、包路径与运行

本页说明课程目录、`package`、Sources Root 与编译命令的对应关系。先按 [环境搭建](环境搭建.md) 配置 JDK；下面的命令从仓库根目录开始。

现在的多层目录不是把一天拆成多个项目，而是让 Java 的文件路径与 `package` 对应。以 Stage 02 第一天为例：

```text
day01_class_object/                              # 当天 lesson，也是这个示例的源码根目录
└─ com/javaroadmap/stage02/day01classobject/    # package 对应的目录
   ├─ App.java                                  # 含 main 的运行入口
   └─ Student.java                              # 与 App 同包的依赖类
```

- 外层 `day01_class_object/` 表示一天的学习单元；在 IntelliJ IDEA 中，这一层是包含 `com/` 的 Sources Root，在命令行中也从这一层编译和运行。
- 内层 `com/javaroadmap/.../` 是包路径，对应文件开头的 `package com.javaroadmap...;`。包名加类名是完整类名（FQCN），例如 `com.javaroadmap.stage02.day01classobject.App`。
- 同一天相互依赖的类放在同一个 package 并一起编译；不同天使用不同 package，所以多个 lesson 都叫 `App`、`Student` 或 `Animal` 也不会冲突。
- 较完整的参考示例使用常见的 `src/main/java/com/...` 结构，此时 Sources Root 是 `src/main/java/`，规则仍然相同。

在 IntelliJ IDEA 中配置好 JDK 和正确的 Sources Root 后，直接点击 `main` 左侧绿色三角。命令行示例：

```powershell
Set-Location stages/stage02_java_oop/existing_course/day01_class_object
javac -encoding UTF-8 -d out com/javaroadmap/stage02/day01classobject/App.java com/javaroadmap/stage02/day01classobject/Student.java
java -cp out com.javaroadmap.stage02.day01classobject.App
```

`out/` 只是本地编译输出，不属于学习源码，也不会提交到仓库。

当前基础课程从 [Stage 01](../stages/stage01_java_basics/README.md) 进入；运行失败时看 [跨平台问题排查](跨平台问题排查.md)。

[返回首页](../README.md)
