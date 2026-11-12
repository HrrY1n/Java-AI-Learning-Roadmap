# 任务 8 复现场景：依赖冲突的制造与解决

> 目的：亲手复现"Maven 依赖仲裁"与"运行时 NoSuchMethodError"——构建能过 ≠ 运行正确。
> 在 maven-lab 工程上操作（完成后按提示还原）。

## 第 1 步：制造两个来源的同一库

在 maven-lab/pom.xml 的 dependencies 里**临时**加入两个都依赖 `commons-compress` 的库（版本不同）：

```xml
<!-- 来源 A：直接声明 commons-compress 1.26.0 -->
<dependency>
  <groupId>org.apache.commons</groupId>
  <artifactId>commons-compress</artifactId>
  <version>1.26.0</version>
</dependency>
<!-- 来源 B：maven-wrapper-plugin 生态里带 1.26.1（本工程构建时已见其下载记录） -->
```

## 第 2 步：看仲裁结果

```bash
mvn dependency:tree -Dverbose | grep commons-compress
```

`-Dverbose` 会显示被仲裁掉的版本（`omitted for conflict with ...`）——确认只有 1.26.0 生效（Maven"最近优先"：直接声明的路径最短）。

## 第 3 步：观察运行时风险

1.26.0 与 1.26.1 的 API 在 `ZipArchiveOutputStream` 上有签名差异（1.26.0 里部分重载被移除）。把调用 1.26.1 特有重载的代码编译进 classpath 后（用 1.26.1 编译、1.26.0 运行），`java -jar` 时才会爆 `NoSuchMethodError`——**构建期没有任何报错**。这就是依赖冲突的经典形态。

## 第 4 步：解决

方案 A（推荐）：来源 A 删除，依赖统一由 B 传递（写明理由：单一来源）。
方案 B：保留 A，并在来源 B 的依赖上加 `<exclusions>` 排除其传递的 commons-compress。

## 第 5 步：还原

`git checkout -- pom.xml`（本练习的所有改动都不应提交）。

## 验收

- 任务 8 完成 = 你能指着 `dependency:tree -Dverbose` 的输出说出：哪条路径胜出、为什么（最近优先）、另一条去了哪。
