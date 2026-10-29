# Stage 03 预测与修改练习集

用法：先写预测再运行；答案集中在 [answers.md](answers.md)，做完至少 5 题再看。

## A. 预测题

### A1 HashMap 的 null 返回
```java
Map<String, Integer> m = new HashMap<String, Integer>();
m.put("a", 1);
System.out.println(m.get("b"));
System.out.println(m.get("b") + 1);
```
预测：第一行打印什么？第二行会发生什么？参考：[深化课 01](../deep_dives/01_choose_collection/README.md)

### A2 List.remove 的重载陷阱
```java
List<Integer> list = new ArrayList<Integer>();
list.add(10); list.add(20); list.add(30);
list.remove(1);
System.out.println(list);
```
预测输出（remove(1) 删的是"值 1"还是"下标 1"？）。

### A3 Stream 惰性
```java
List<String> names = new ArrayList<String>();
names.add("小明");
names.stream()
     .peek(n -> System.out.println("经过 " + n))
     .filter(n -> n.length() > 5);
System.out.println("main 继续");
```
预测输出顺序：有没有"经过"行？为什么？

### A4 finally 与 return
```java
static int test() {
    try {
        return 1;
    } finally {
        System.out.println("finally 执行了");
    }
}
// main：System.out.println(test());
```
预测完整输出与顺序。

### A5 String 的不可变
```java
String s = "java";
s.toUpperCase();
System.out.println(s);
```
预测输出；为什么不是 "JAVA"？（Stage 02 String 话题的收尾。）

## B. 修改题

### B1 day02hashmap 覆盖语义
在 `legacy_fundamentals/collections_generics/day02_hashmap/` 里对同一 key 再 `put` 一次不同分数。
预测：遍历输出几条？旧值去哪了？运行验证。

### B2 day01exception 捕获范围
在 `exceptions_io/day01_exception/` 里把 `catch (ArithmeticException e)` 改成 `catch (RuntimeException e)`。
预测：输出有变化吗？再把除数改为非零，两种写法行为差异是什么？思考：捕获范围放大换来了什么、丢了什么（参考 [异常设计深化课](../deep_dives/03_exception_design/README.md)）。

### B3 FileStudentRepository 编码
把 `FileStudentRepository` 的读取编码临时改为 GBK（写入保持 UTF-8），先手工用 UTF-8 运行一次程序生成数据文件，再运行第二次。
预测：读出的学生名是什么形态？程序崩溃吗？这个实验对应 [UTF-8 深化课](../deep_dives/04_utf8_io/README.md) 的哪一行？

### B4 day03streamcollect 链式加工
在 `lambda_stream/day03_stream_collect/` 的流水线中间插入 `.map(n -> n + "!")`。
预测输出列表内容；再说明这行 map 的输入/输出类型各是什么（泛型读法练习）。

---

完成后回到 [结构化练习](../existing_course/exercises/collection_exception_io_exercises.md) 完成四个扩展练习。
