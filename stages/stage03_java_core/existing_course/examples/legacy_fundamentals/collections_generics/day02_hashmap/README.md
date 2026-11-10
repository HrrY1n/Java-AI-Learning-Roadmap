# HashMap：哈希桶结构、冲突演进与安全取数

> 对应示例：`collections_generics/day02_hashmap/App.java`

## 1. 为什么 HashMap 能做到平均 $O(1)$ 查找？

ArrayList 按值查找需要逐个扫描（$O(n)$），而 HashMap 把 key 通过 `key.hashCode()` 加上扰动计算映射到内部**哈希桶数组**的下标位置——不扫描、直接定位桶。

### 哈希碰撞与 JDK 8 的树化演进

不同 key 可能算到同一个桶下标（**哈希碰撞**）：
- **JDK 7 及以前**：桶里是单向链表（新元素头插法）；多线程并发扩容时容易出现链表成环死循环。
- **JDK 8 起**：采用**尾插法**；当单个桶的链表长度 **>= 8** **且**整个哈希表数组容量 **>= 64** 时，该桶自动转为**红黑树**（把极端最坏查找从 $O(n)$ 拉回到 $O(\log n)$；若容量不到 64 则先做扩容来打散碰撞）。节点降回 6 以下时退化回链表。

## 2. 四条工程必知边界

1. **`null` 键与 `null` 值**：`HashMap` 允许 **1 个 `null` 键**和任意个 `null` 值（而后面的并发集合 `ConcurrentHashMap` 则**彻底禁止 `null` 键和 `null` 值**，否则并发下分不清“键不存在”还是“映射的值是 null”）。
2. **`get` 找不到返回 `null`（不会报错）**：若值是 `Integer`，直接 `int score = scores.get("李雷");` 或 `scores.get("李雷") + 1` 会触发**自动拆箱 `NullPointerException`**（见预测题 `S03A1`）。防法：用 `scores.getOrDefault("李雷", 0)` 或先 `containsKey` 检查。
3. **键必须正确重写 `equals` 和 `hashCode` 且尽量不可变**：修改了已放入 `HashMap` 的 key 字段值导致 `hashCode` 变化，该条目就会留在旧桶里再也 `get` 不到（见 `s03-equals-hashcode`）。
4. **遍历三方式选择**：只要值用 `values()`；既要键又要值用 **`entrySet()`**（一次拿到键值，避免 `keySet()` 里每次再调用 `get(key)` 二次哈希查找）。
5. **迭代中改结构必踩 CME**：与 List 一样，`entrySet()`/`keySet()` 迭代中直接 `put`/`remove` 会抛 `ConcurrentModificationException`；要么用 `Iterator.remove()`（Map 的 entrySet 迭代器支持），要么收集到后再统一修改（见 ArrayList 课的 CME 对照表）。

## 学习验收与自我检核

- **需要掌握什么**：说明 HashMap 平均 $O(1)$ 定位与冲突拉链/树化机制；区分 `get` 返回 `null` 与 `getOrDefault`；会用 `entrySet()` 高效遍历。
- **如何证明理解**：① 能直接指出为什么 `scores.get("不存在") + 1` 在运行时崩溃而 `println(scores.get("不存在"))` 不崩溃；② 知道 `keySet()+get` 相比 `entrySet()` 多了一轮查找。
- **什么情况属于尚未掌握**：把 `HashMap` 的迭代顺序当成插入顺序（需要保留插入顺序要用 `LinkedHashMap`），或在不知情下用可变对象做 Map 的键。
- **针对错误如何复习**：`hashCode` 契约与可变 key 丢失实验去 `s03-equals-hashcode`；集合选型决策对照深化课 `s03-choose-collection`。
