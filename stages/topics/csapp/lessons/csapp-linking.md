# 链接、符号与 Java 类加载类比

## 1. Scenario：从一个具体问题出发
Java 报 `ClassNotFoundException` 或依赖冲突，你想知道这和 C 链接器有什么关系。

## 2. Why：为什么这个问题值得系统理解
链接器解决符号引用；JVM 类加载器解析类引用。相似点是“名字到实现”，不同点是阶段和错误表现。

## 3. Concept：核心概念
C 链接器在编译后合并目标文件、解析符号并重定位地址；Java 类加载发生在 JVM 运行时，可以按需加载、验证和链接类。JAR 是 Java 的打包格式，不是 ELF 目标文件。

## 4. Mental Model：把机制装进一张图
`编译产物 + 依赖 -> 符号解析 -> 可执行/运行时模块`。C 常在构建期链接；Java 常在运行时按需加载。

## 5. Minimal Code：最小示例
```text
javac -cp lib/a.jar App.java
java -cp .:lib/a.jar App
```
`-cp` 表达运行时类路径，不等于 C 的静态链接。

## 6. Observe：先预测，再运行
故意删除依赖运行，观察 `NoClassDefFoundError` 或 `ClassNotFoundException`。

## 7. Modify：只改一个有意义的条件
把依赖放回类路径但保留两个不同版本，观察优先加载和冲突提示。

## 8. Exercise：独立完成
画出 C 静态链接、动态链接和 Java 类加载的时序图，并说明各自错误阶段。

## 9. Real Usage：联系 Java 与工程实践
理解 Maven 依赖冲突、`classpath`、模块化和 JNI 库加载时，需要分清编译期链接和运行时解析。

## 来源与出处
《CSAPP, 3rd Global Edition》Chapter 7（PDF 第 706-758 页）。
