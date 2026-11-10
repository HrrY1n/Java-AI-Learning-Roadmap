# 独立学习验证集：理解诊断、Debug 排错与代码迁移（Stage 01–04）

> 用途：**平台与示例跑通不等于你已经学会**。本套验证题专门检验三件事——你能不能不用背定义就解释出机制（**理解诊断**）、能不能看着报错或故障代码精准说出病根（**Debug 测试**）、能不能脱离原题模板写出等价结构（**代码迁移**）。
>
> **诚实规则**：先自己手写判断或独立写出代码并运行验证，全部完成后再点击底部 [参考解析与评判要点](answers/diagnostic_solutions.md) 主动解锁核对。看懂解析不等于独立掌握。

---

## 一、理解诊断（不要照搬正文定义，用自己的话和执行轨迹回答）

### U1：为什么 `byte c = a + b;` 不通过而 `byte c = 10 + 20;` 却能过？（Stage 01 · `day07`）

```java
// diagnostic:compile-error:lossy conversion
public class U1Promote {
    public static void main(String[] args) {
        byte a = 10;
        byte b = 20;
        byte ok = 10 + 20;
        byte err = a + b;
    }
}
```

问题：`10 + 20` 和 `a + b` 的数学结果都是 `30`（完全装得进 `byte` 的 `-128 ~ 127`），为什么第 6 行编译通过、第 7 行却报错？这背后涉及 Java 编译器的哪两条规则？

### U2：为什么跨包子类用父类引用访问 `protected` 字段会编译失败？（Stage 02 · `s02-static-lifecycle`）

```java
// diagnostic:compile-error:protected access
package pkgb;
import pkga.Base;

public class Child extends Base {
    void inspect() {
        System.out.println(this.note);          // 第 1 处：编译通过
        Base other = new Base();
        System.out.println(other.note);         // 第 2 处：编译报错！
    }
}
```

（前提：`Base` 在 `pkga` 包中声明了 `protected String note = "x";`。）
问题：明明在 `Base` 的子类 `Child` 内部，为什么通过 `this.note` 合法而 `other.note` 被拒绝？如果把 `Child` 改成放回 `pkga` 同包里，结果会怎么变？

### U3：两个引用指向同一个对象时，为什么“改字段生效”而“给形参重赋新对象无效”？（Stage 02 · `s02-reference-state`）

```java
// diagnostic:runtime-output:99|小明
class Student {
    String name;
    int score;
    Student(String name, int score) { this.name = name; this.score = score; }
}

public class U3Alias {
    public static void main(String[] args) {
        Student a = new Student("小明", 80);
        change(a);
        System.out.println(a.score + "|" + a.name);
    }
    static void change(Student s) {
        s.score = 99;
        s = new Student("路人", 0);
    }
}
```

问题：不运行代码先画出内存与引用指向图，给出控制台精确输出，并说明为什么 Java 是“严格的值传递”而不是“引用传递”。

### U4：`IntegerCache` 与只写 `equals` 不写 `hashCode` 的后果（Stage 03 · `s03-arraylist` / `s03-equals-hashcode`）

```java
// diagnostic:runtime-output:true|false|false
import java.util.HashSet;
import java.util.Set;

public class U4BoxAndHash {
    static class Tag {
        final String code;
        Tag(String code) { this.code = code; }
        @Override public boolean equals(Object o) {
            return (o instanceof Tag) && code.equals(((Tag) o).code);
        }
    }
    public static void main(String[] args) {
        Integer x = 127, y = 127;
        Integer m = 128, n = 128;
        Set<Tag> set = new HashSet<>();
        set.add(new Tag("vip"));
        System.out.println((x == y) + "|" + (m == n) + "|" + set.contains(new Tag("vip")));
    }
}
```

问题：解释输出中 3 个布尔值各自出现的原因；并给出只看代码不用运行就能改对这两处隐患的方法。

### U5：为什么 `volatile` 保不住 `count++`，以及为什么 `get()` 也必须加锁？（Stage 04 · `s04-visibility-volatile` / `s04-synchronized-mutex`）

考虑一个多线程计数器：
```java
class VolatileCounter {
    volatile int count = 0;
    void inc() { count++; }
    int get() { return count; }
}
```
问题：① 分步骤拆解两个线程各自读到 `count = 10` 时，`inc()` 怎样在加了 `volatile` 的情况下依然只变成 `11` 而不是 `12`；② 如果改用 `synchronized void inc()` 但忘了给 `get()` 加 `synchronized`，在另一个工作线程边运行边读 `get()` 时会出现什么 JMM 风险？

### U6：`finally` 吞异常与线程池忘记 `shutdown`（Stage 03 `s03-exception` / Stage 04 `s04-thread-pool`）

```java
// diagnostic:runtime-output:0
public class U6FinallySwallow {
    static int run() {
        try {
            int x = 1 / 0;
            return x;
        } finally {
            return 0;
        }
    }
    public static void main(String[] args) {
        System.out.println(run());
    }
}
```

问题：① 为什么 `1 / 0` 明明抛了 `ArithmeticException`，调用方却拿到 `0` 而完全不知道发生过崩溃？② 如果业务提交 4 个任务到 `Executors.newFixedThreadPool(2)` 后直接走出 `main` 末尾而不调 `pool.shutdown()`，JVM 进程会立刻退出吗？为什么？

---

## 二、Debug 错误诊断（提供真实错误代码，独立定位根因与修复）

### D1：找不到构造器？其实是在构造器前误写了 `void`（Stage 02）

```java
// diagnostic:compile-error:cannot be applied to given types
public class D1VoidCtor {
    String name;
    public void D1VoidCtor(String name) {
        this.name = name;
    }
    public static void main(String[] args) {
        D1VoidCtor obj = new D1VoidCtor("小明");
    }
}
```
任务：解释为什么 `javac` 说“构造器 `D1VoidCtor()` 不能应用到给定类型 `(String)`”？怎么修？

### D2：为什么删了两个却漏掉一个？（Stage 03）

```java
// diagnostic:runtime-output:[A, X, B]
import java.util.ArrayList;
import java.util.List;

public class D2ForwardRemove {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>(List.of("A", "X", "X", "B"));
        for (int i = 0; i < list.size(); i++) {
            if ("X".equals(list.get(i))) {
                list.remove(i);
            }
        }
        System.out.println(list);
    }
}
```
任务：写出每一步循环变量 `i` 与 `list` 元素的精确位置变化，说明第二个 `"X"` 是如何跳过检查的，并写出三种等价正确的修复写法。

### D3：字段明明写着 `private`，为什么内部数组还是被外面改坏了？（Stage 02）

```java
// diagnostic:runtime-output:-999
public class D3Escape {
    private final int[] scores = {90, 80};
    public int[] getScores() { return scores; }
    public static void main(String[] args) {
        D3Escape team = new D3Escape();
        team.getScores()[0] = -999;
        System.out.println(team.getScores()[0]);
    }
}
```
任务：指出封装被穿透的原因（提示：不仅 getter 要改，如果构造器接收了外部数组参数也要改），给出修复代码。

### D4：多 `catch` 顺序报错（Stage 03）

```java
// diagnostic:compile-error:already been caught
public class D4CatchOrder {
    public static void main(String[] args) {
        try {
            int x = 1 / 0;
        } catch (Exception e) {
            System.out.println("兜底");
        } catch (ArithmeticException e) {
            System.out.println("除零");
        }
    }
}
```
任务：解释编译器为何报 `exception ArithmeticException has already been caught`，以及应如何调整继承层次顺序。

### D5：每个线程都 `synchronized` 了，为什么计数依然可能少？（Stage 04）

```java
public class D5WrongLock {
    private int count = 0;
    public void add() {
        Object gate = new Object();
        synchronized (gate) {
            count++;
        }
    }
}
```
任务：指出 `synchronized (gate)` 形同虚设的根本原因；并顺便判断：如果把方法改成一个普通 `synchronized void inc()` 加在实例上、另一个 `static synchronized void dec()` 加在类上，它们能互斥吗？

---

## 三、代码迁移任务（不照搬原题，只按输入输出契约独立实现）

> 验证要求：每个任务自己新建独立 `.java` 类，用**正常 + 边界 + 非法**三类输入实跑验收。

### T1：合法分数区间分析器 `ScoreBandAnalyzer`（迁移 Stage 01 数组/分支/溢出与 Stage 03 异常边界）
- **需求**：编写方法 `analyze(String[] rawInputs)`，输入是一组字符串分数（可能含 `"85"`、`"100"`、`"0"`、`"-5"`、`"101"`、`"abc"`、空数组 `{}`）。
- **要求**：
  1. 有效分数（`0 <= s <= 100` 的整数）统计总数、总和（`long`）与保留 1 位小数均分；
  2. 非法条目（非数字或不在 `0~100`）不能让程序崩溃，也不得悄悄当成 `0` 计入均分，而是收集进非法列表；
  3. 有效数为 0（如空数组或全非法）时，均分不得因 `0.0 / 0.0` 输出 `NaN`，而是明确输出 `暂无有效分数`。

### T2：图书馆副本与去重 `LibraryCopy`（迁移 Stage 02 构造器/封装/不可变/equals-hashCode）
- **需求**：设计 `LibraryCopy` 类，字段：`private final String isbn`（构造校验非 null 非空，否则抛 `IllegalArgumentException`）、`private final int copyNo`（必须 > 0）、`private boolean borrowed`（不提供 `setBorrowed`，只提供 `borrow()` 与 `returnBook()` 返回 `boolean` 表示操作是否成功：已被借出再借返回 `false`）。
- **要求**：重写 `equals` 和 `hashCode`（依据不可变字段 `isbn` 与 `copyNo`），验证“借出状态改变后，放入 `HashSet<LibraryCopy>` 依然能用同一副本精确 `contains` 找回”。

### T3：配置文件行解析器 `ConfigLineParser`（迁移 Stage 03 Map/String/Exception）
- **需求**：接收多行字符串（模拟配置文本）：跳过空行和 `#` 开头的注释行；其余行按**第一个 `=`** 拆分成 `key` 与 `value`（`value` 本身允许含 `=`，如数据库连接串 `url=jdbc:mysql://...?useSSL=false`），两侧 `trim()` 后存入保持插入顺序的 `LinkedHashMap<String, String>`；若缺失 `=` 或 `key` 为空，抛出含**当前行号与原文**的 `IllegalArgumentException`。

### T4：线程池分段并行求平方和 `ParallelSumChecker`（迁移 Stage 04 线程池/Future/try-finally/long 防溢出）
- **需求**：实现 `long sumSquares(int n, int workers)`：把 `1..n` 均分给 `workers` 个任务（`Callable<Long>`）提交到显式创建的 `ThreadPoolExecutor`（core=max=`workers`）；参数校验 `workers <= 0` 或 `n < 0` 立即抛 `IllegalArgumentException`；通过 `List<Future<Long>>` 汇总各段和，在 `try-finally` 中确保 `pool.shutdown()` 与 `awaitTermination` 执行，保证即使某个大 `n`（如 `n = 100000`）也不会 `int` 溢出。

---

## 解锁核对

全部完成思考与实测后，点击查看 [参考解析与评判要点](answers/diagnostic_solutions.md)。
