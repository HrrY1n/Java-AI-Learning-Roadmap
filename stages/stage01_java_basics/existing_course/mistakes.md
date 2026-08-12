# Stage01 常见错误

## 类名和文件名不一致

如果文件叫 `App.java`，里面的公开类必须是：

```java
public class App {
}
```

否则会编译失败。

## 忘记英文分号

Java 普通语句结尾通常需要英文分号：

```java
int age = 18;
```

中文分号 `；` 不可以。

## 字符串比较误用 `==`

比较字符串内容要用 `equals`：

```java
if ("admin".equals(username)) {
}
```

`==` 比较的不是字符串内容，后面项目中很容易踩坑。

## Scanner 输入类型不匹配

如果程序使用 `scanner.nextInt()`，用户却输入文字，会出现输入异常。初学阶段先按提示输入正确类型。

## 循环没有退出条件

`while (true)` 必须在某个条件下 `break`，否则程序会一直运行。

## 包名运行错误

新增示例有 `package`，运行时不能只写：

```powershell
java ScoreStatisticsApp
```

要写完整类名：

```powershell
java -cp out com.javaroadmap.stage01.console.ScoreStatisticsApp
```

