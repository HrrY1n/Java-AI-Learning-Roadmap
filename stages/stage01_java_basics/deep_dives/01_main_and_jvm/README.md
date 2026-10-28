# 深化课 01：`main` 方法与"从源码到输出"到底发生了什么

对应示例：`com/javaroadmap/stage01/deepdives/jvmstart/MainAnatomyDemo.java`（本目录即源码根）

**运行后你会看到什么**：两行输出——`main 被调用了，args 长度 = 0`；带参数运行时还会逐个打印参数。看完本文你应该能不看示例说出 `javac` 和 `java` 各自做了什么、`main` 签名每个词为什么必须存在。

## 场景：为什么值得搞清楚这个

你已经会点 IDE 的绿色三角，也照抄过 `javac ... / java ...` 两条命令。但当出现"编译成功却运行失败""找不到主类"时，能不能自己定位，取决于你脑中有没有这条链路：

```text
App.java --javac--> App.class（字节码） --java--> JVM 加载 --> 调用 main --> 打印输出
   你写的             平台无关            你输入的命令负责：告诉 JVM 去哪找、找哪个类
```

大多数初学者报错都发生在链条的第二、三段——**编译和运行是两个独立阶段，各自都可能失败，失败原因完全不同**。

## 必须理解

`public static void main(String[] args)` 不是一个整体，是四个要求叠在一起：

| 成分 | 作用 | 缺了会怎样 |
| --- | --- | --- |
| `public` | JVM 要从外部调用它 | 运行时报"main 方法不适用" |
| `static` | 调用时没有任何对象存在，方法必须属于类 | 同上 |
| `void` | 程序入口不需要返回值 | 写 `int` 会直接不匹配签名 |
| `String[] args` | 命令行参数容器 | 参数写成 `String args`（少 `[]`）即不匹配 |

**心智模型**：JVM 像"只认识固定门铃的访客"——它只会按 `public static void main(String[])` 这个门铃。你写别的签名，编译能通过（语法没错），但按不响。

`args` 是字符串数组：`java MainAnatomyDemo hello 42` 中 JVM 把 `hello`、`42` 放进数组，**注意 42 也是字符串**，需要数字要自己转换。无参数时它是长度为 0 的数组，不是 null。

## 理解原理：三个阶段各自由谁负责

1. **编译阶段（javac）**：检查语法和类型，把源码翻译成字节码。此时**不运行任何逻辑**——除零、数组越界、死循环它一概不管，所以"编译通过"只等于"语法合格"。
2. **类加载（java 启动时）**：JVM 按 `-cp` 给出的位置，用**完整类名**逐级找目录（`com.javaroadmap...` → `com/javaroadmap/...`），把 `.class` 读进内存。找不到就是 `ClassNotFoundException`（见 [排查手册第 4 条](../../../../docs/跨平台问题排查.md)）。
3. **执行阶段**：JVM 调用 main，程序逐行执行，`System.out.println` 把字符交给"标准输出流"，显示在终端上。

**Observe（先预测再运行）**：

```text
javac -encoding UTF-8 -d out com/javaroadmap/stage01/deepdives/jvmstart/MainAnatomyDemo.java
java -cp out com.javaroadmap.stage01.deepdives.jvmstart.MainAnatomyDemo
java -cp out com.javaroadmap.stage01.deepdives.jvmstart.MainAnatomyDemo hello 42
```

预测：第 2、3 条命令分别打印几行？`42` 会以什么类型出现？再运行验证。

## 动手：修改一个条件

1. 把 `String[] args` 改名为 `String[] anything`——运行不受影响。**参数名是给你看的，类型才是给 JVM 看的**。
2. 删掉 `static` 再运行——把报错信息与 [排查手册第 5 条](../../../../docs/跨平台问题排查.md) 对照，确认你能从报错读出"签名不匹配"。
3. （拓展）运行 `javap -cp out com.javaroadmap.stage01.deepdives.jvmstart.MainAnatomyDemo`，看 JVM 眼中的类长什么样——这是你第一次直接观察字节码。

## 常见错误

- 在 IntelliJ 里能跑、命令行跑不了：IDE 帮你拼了 `-cp` 和 FQCN，命令行必须自己写对。两者差异见 [环境搭建第四节](../../../../docs/环境搭建.md#四编译并运行一个课程程序)。
- 以为 `main` 里的代码"自动执行"：任何代码都要么在 main 调用链上执行，要么属于类/对象定义本身。
- 修改代码后直接运行：跳过了重新编译，跑的还是旧 `.class`（[排查手册第 6 条](../../../../docs/跨平台问题排查.md)）。

## 独立练习

写一个 `EchoUpper` 类（放在本目录包结构下、新建你自己的子包或放进 `my_practices/`）：main 打印所有命令行参数的大写形式；无参数时打印提示 `用法：java EchoUpper 单词1 单词2` 并正常结束（退出码 0）。要求：不使用超出 Stage 01 的语法（循环 + 字符串方法即可）。

完成后自检：`java -cp out 你的FQCN hello world` 输出 `HELLO WORLD`；无参数运行输出用法提示。

## 与后面学习的联系

- 数组遍历写法的边界问题在 [深化课 03](../03_array_memory/README.md) 展开。
- `String` 的方法（大写转换等）在 Stage 02 系统学习。
- Stage 04 会回到这里：JVM 内存区域、GC 都建立在"JVM 加载并执行字节码"这个模型上。
