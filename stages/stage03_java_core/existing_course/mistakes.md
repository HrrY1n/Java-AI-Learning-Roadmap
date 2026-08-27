# Stage03 常见错误

## 泛型类型不匹配

`List<Student>` 只能放 `Student` 对象，不能放字符串。

## 修改集合时下标越界

使用 `list.get(index)` 前要确认 `index` 在合法范围内。

## 忽略 null

根据 id 查找学生时，如果找不到可能返回 `null`。本阶段更推荐抛出业务异常或返回失败 `Result`。

## 文件路径理解错误

相对路径基于你运行 `java` 命令时所在的目录。本阶段的独立示例应从对应的课程源码根目录（包含 `com/` 的那一层）运行。

## 中文乱码

编译时建议使用：

```powershell
javac -encoding UTF-8 ...
```

读写文件时也显式使用 `StandardCharsets.UTF_8`。

## 捕获异常后什么都不做

不要写空的 `catch`。至少要输出错误信息，真实项目中还要记录日志。

