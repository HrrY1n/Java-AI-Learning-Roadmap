# String 不可变性、常量池与内容比较

> 对应示例：`com/javaroadmap/stage02/commonapi/day01string/App.java`

## 1. 为什么 `String` 被设计成不可变对象？

`String` 对象一旦创建，内部字符内容就永远不可更改（在 Java 8 内部是 `private final char[]`、Java 9+ 为了省内存改成 `private final byte[]` + 编码标志位，且没有提供任何修改内部数组的方法）。任何看似“修改”的方法（`toUpperCase()`、`substring()`、`replace()`）都是在**构造并返回一个全新的 `String` 对象**。

不可变带来了三个工程收益：
1. **允许常量池安全复用**：如果 `s1` 能被修改，复用同一份 `"Java"` 时就会把所有人的 `"Java"` 一起改坏；
2. **缓存哈希值**：`HashMap` 最常用 `String` 做 key，`String` 只需在首次算一次 `hashCode()` 后缓存下来；
3. **天然线程安全且安全性高**：文件路径、网络连接、密码验证传参途中不会被恶意方悄悄改内容。

## 2. 字符串常量池与 `==` vs `equals`

```text
String s1 = "Java";   ──┐
String s2 = "Java";   ──┴──▶ [ 字符串常量池: "Java" ]   (同一对象，s1 == s2 为 true)

String a = new String("Java");  ──▶ [ 堆新对象 #1: "Java" ]
String b = new String("Java");  ──▶ [ 堆新对象 #2: "Java" ]   (a == b 为 false，a.equals(b) 为 true)
```

**工程铁律**：永远用 `a.equals(b)`（防空写法 `"常量".equals(var)` 或 `Objects.equals(a, b)`）比较字符串内容；绝对不要因为 `"Java" == "Java"` 碰巧输出 `true` 就用 `==` 比较外部传入的字符串（数据库、控制台、网络读进来的串都是运行时新建的对象，用 `==` 必错）。

## 3. 常见 API 与空值防护

- **忽略返回值是最常见新手 bug**：写 `s.toUpperCase();` 后忘了接收返回值 `s = s.toUpperCase();`，`s` 纹丝不动（见预测题 `S03A5`）。
- **频繁循环拼接问题**：既然每次拼接都新建一个 `String`，在循环里写 `str += i` 会制造大量临时废弃对象；下节的 `StringBuilder` 通过内部可变字符缓冲区专门解决这个问题。
- **防 NPE**：若 `input` 可能为 `null`，用 `"admin".equals(input)` 而不是 `input.equals("admin")`。

## 学习验收与自我检核

- **需要掌握什么**：说清 `String` 不可变的原理与三个好处；解释字符串常量池与 `new String` 的差异；用 `equals` 比较内容、用 `s = s.xxx()` 接住修改结果。
- **如何证明理解**：① 能直接判断 `s1 == s2` 与 `a == b` 的布尔值并说明理由；② 不会再写出忘接返回值或用 `==` 比较输入字符串的 bug；③ 能独立完成邮箱前缀截取与规范化小写任务。
- **什么情况属于尚未掌握**：背出“`==` 比地址、`equals` 比内容”，但写项目校验用户名时还是手顺写 `userInput == "admin"`；或在循环里用 `+` 拼接千次文本不知为何变慢。
- **针对错误如何复习**：忽略返回值回看预测题 `S03A5`；引用比较模型回到 `s02-reference-state`。
