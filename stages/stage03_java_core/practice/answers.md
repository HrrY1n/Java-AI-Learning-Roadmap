# 预测与修改练习：答案

**先完成 [predict_and_modify.md](predict_and_modify.md) 至少 5 题再打开本文件。**

## S03A1
```text
null
0
false
```
`get` 对不存在的键返回 `null`（不是异常）；`getOrDefault` 把"取不到"翻译成默认值 `0`；`containsKey` 只回答"在不在"。危险的是对 `get` 的返回值直接拆箱算术：`m.get("b") + 1` 会抛 `NullPointerException`——自动拆箱把 null 变成崩溃。防法就是后两行：取不到要有兜底，或先问在不在。

## S03A2
```text
[10, 30]
```
`remove(1)` 命中 **`remove(int index)` 重载**（精确匹配优先于装箱匹配），删除的是下标 1（元素 20）。想按值删要写 `remove(Integer.valueOf(1))`。这是重载 + 装箱的经典暗坑。

## S03A3
```text
main 继续
```
没有任何"经过"行。中间操作（peek/filter）只是登记流水线；没有终止操作整条链从未执行。peek 的输出出现在**有终止操作时、逐元素经过的时刻**。

## S03A4
```text
finally 执行了
1
```
finally 在方法真正返回前执行——即使 try 里已经写了 return。"必然清理"语义正是 try-with-resources 的前身。

## S03A5
```text
java
```
String 不可变：`toUpperCase()` 返回一个**新**字符串，原对象原封不动；返回值被丢弃了。要生效必须接收：`s = s.toUpperCase();`。

## S03A6
```text
[小明, 小刚]
```
`removeIf` 是"边遍历边删"的安全写法：删除逻辑由 List 自己在遍历协议内完成。如果换成 for-each 循环里直接 `names.remove(name)`，多数情况会抛 `ConcurrentModificationException`——for-each 底层是迭代器，`next()` 时发现集合被外部改过（modCount 变化）就立刻失败，**宁可报错也不静默漏删**。安全替代：`removeIf`、`Iterator.remove()`、或"先收集要删的、遍历结束后再删"。一个有趣的边界：恰好删除"倒数第二个"元素时，ArrayList 的 for-each 可能**不**抛异常（`hasNext` 用 `cursor != size` 判断，删完恰好相等）——那是侥幸不是保证，任何分支都不要依赖它。

## S03B1
仍是三条（三个 key），"小明"的值被新分数**覆盖**。旧值没有"去哪"，它被替换了。Map 的键唯一性 = 覆盖语义；需要"同 key 多值"要用 `Map<String, List<Integer>>`（以后会遇到）。

## S03B2
捕获 ArithmeticException 与捕获 RuntimeException 对这个程序**输出相同**（ArithmeticException 是 RuntimeException 的子类，都能接住）。除数非零时两者都正常不触发。放大捕获范围丢失的是：未来其它 RuntimeException（如你自己的 bug 空指针）也会被这条 catch 静默吃掉——排查线索被掩盖。

## S03B3
读出乱码（GBK 误读 UTF-8 字节），**不崩溃**——字符集不匹配是"翻译错误"不是"IO 错误"，对应深化课第 4 行 `用 GBK 读同一份字节` 的输出。教训：编码必须显式且两端一致；乱码出现时先查两端约定，不要反复重写文件。

## S03B4
输出列表每个元素多一个 `!`：`[小明!, 小红!, 张三!, 小刚!]`。map 的 lambda 输入类型 `String`、输出类型 `String`（泛型读法：`Function<String, String>`）；若改成 `n -> n.length()` 则输出变成 `[2, 2, 2, 2]`，流类型随之变为 `Stream<Integer>`——类型沿着流水线逐级变化。
