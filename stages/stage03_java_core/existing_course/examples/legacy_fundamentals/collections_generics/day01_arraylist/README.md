# ArrayList、包装类装拆箱与安全删除

> 对应示例：`collections_generics/day01_arraylist/App.java`

## 1. 为什么要用 `List<E>` 和包装类？

数组的长度在创建时就锁死了，而业务名单（学生、订单、评论）需要动态增删。`ArrayList` 底层依然是一段连续数组，只是帮你封装了**自动扩容（默认容量 10，不够时按约 1.5 倍搬家）**与插入/删除搬移逻辑，推荐声明为接口类型 `List<String> list = new ArrayList<>();`。

Java 泛型擦除后只能放对象引用，放不进 `int`/`double` 等基本类型——因此有了对应的**包装类**：`int → Integer`、`long → Long`、`double → Double`、`boolean → Boolean`。

## 2. 包装类的三个高频陷阱

### 陷阱一：自动装拆箱的隐式空指针（`NullPointerException`）

```java
Integer boxed = null;
int n = boxed; // 编译时自动变成 boxed.intValue()，运行时立刻 NullPointerException！
```

当 `Map.get("不存在的键")` 返回 `null` 时直接写 `map.get("k") + 1` 就会踩中这个坑（见预测题 `S03A1`）。

### 陷阱二：`IntegerCache`（`-128 ~ 127`）导致的 `==` 错觉

Java 为了复用高频小整数，在 `Integer.valueOf(i)` 时默认缓存 `-128 ~ 127` 之间的对象（JLS §5.1.7）。因此：
- `Integer a = 100, b = 100; a == b` 为 **`true`**（同一缓存对象）；
- `Integer x = 200, y = 200; x == y` 为 **`false`**（超出缓存各自 `new` 新对象）。

**铁律**：比较两个包装类对象是否数值相等，永远用 `x.equals(y)` 或 `Objects.equals(x, y)`，绝不用 `==`！

### 陷阱三：`List<Integer>.remove` 的重载碰撞

`List<Integer>` 同时拥有两个方法：`remove(int index)`（按位置删）与 `remove(Object o)`（按值删）。写 `list.remove(1)` 时，编译器按精确匹配优先选中 `remove(int)`，删掉下标 1 的元素！想按值删 `1` 必须写成 `list.remove(Integer.valueOf(1))`（见预测题 `S03A2`）。

## 3. 边遍历边删除的陷阱与正解

| 写法 | 结果与危险 |
| --- | --- |
| `for (String s : list) list.remove(s);` | **通常抛 `ConcurrentModificationException`**（`fail-fast` 检测），哪怕删倒数第二个碰巧不抛也属于未保证行为（见 `S03A6`） |
| 正向 `for (int i = 0; i < list.size(); i++)` 删了不回退 `i--` | 元素左移导致紧跟其后的匹配元素**被静默跳过漏删** |
| `list.removeIf(x -> ...)`（JDK 8+） | **最推荐**：简洁、一次遍历完成且不漏删 |
| `Iterator.remove()` 或倒序 `for (int i = size - 1; i >= 0; i--)` | 安全：倒序删除不影响前面尚未访问元素的下标 |

## 学习验收与自我检核

- **需要掌握什么**：面向 `List` 接口编程；避开 `remove(int)` 重载坑；理解自动装拆箱的 NPE 源头与 `IntegerCache`；掌握安全删除写法（`removeIf` / `Iterator.remove()` / 倒序）。
- **如何证明理解**：① 不用运行就能指出 `for(i=0...)` 正向删连续 `"X"` 漏掉哪一个；② 能解释为什么 `Integer 100 == 100` 为 true 而 `200 == 200` 为 false；③ 能独立写出不含漏删与 CME 的按条件批量移除代码。
- **什么情况属于尚未掌握**：以为“只要不用 for-each，普通 for 循环里随便 `remove(i)` 就一定安全”；或把 `Integer` 当成 `int` 用 `==` 判等。
- **针对错误如何复习**：重载与 CME 回看预测题 `S03A2` 与 `S03A6`；引用比较模型回看 `s02-reference-state`。
