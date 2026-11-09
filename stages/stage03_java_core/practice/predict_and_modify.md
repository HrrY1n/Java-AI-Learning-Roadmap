# Stage 03 预测与修改练习集

用法：先写预测再运行；答案集中在 [answers.md](answers.md)，做完至少 5 题再看。预测题片段均自包含：复制到一个 `.java` 文件即可编译运行（类名与文件名一致）。

## A. 预测题

### S03A1 HashMap 取不到的键
```java
import java.util.HashMap;
import java.util.Map;

public class NullGetDemo {
    public static void main(String[] args) {
        Map<String, Integer> m = new HashMap<String, Integer>();
        m.put("a", 1);
        System.out.println(m.get("b"));
        System.out.println(m.getOrDefault("b", 0));
        System.out.println(m.containsKey("b"));
    }
}
```
预测三行输出。思考：如果第二行写成 `m.get("b") + 1` 会发生什么？（这就是 `getOrDefault`/`containsKey` 存在的理由。）参考：[深化课 01](../deep_dives/01_choose_collection/README.md)

### S03A2 List.remove 的重载陷阱
```java
import java.util.ArrayList;
import java.util.List;

public class RemoveOverloadDemo {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<Integer>();
        list.add(10);
        list.add(20);
        list.add(30);
        list.remove(1);
        System.out.println(list);
    }
}
```
预测输出（remove(1) 删的是"值 1"还是"下标 1"？）。

### S03A3 Stream 惰性
```java
import java.util.ArrayList;
import java.util.List;

public class LazyStreamDemo {
    public static void main(String[] args) {
        List<String> names = new ArrayList<String>();
        names.add("小明");
        names.stream()
             .peek(n -> System.out.println("经过 " + n))
             .filter(n -> n.length() > 5);
        System.out.println("main 继续");
    }
}
```
预测输出顺序：有没有"经过"行？为什么？

### S03A4 finally 与 return
```java
public class FinallyDemo {
    static int test() {
        try {
            return 1;
        } finally {
            System.out.println("finally 执行了");
        }
    }

    public static void main(String[] args) {
        System.out.println(test());
    }
}
```
预测完整输出与顺序。

### S03A5 String 的不可变
```java
public class ImmutableStringDemo {
    public static void main(String[] args) {
        String s = "java";
        s.toUpperCase();
        System.out.println(s);
    }
}
```
预测输出；为什么不是 "JAVA"？（Stage 02 String 话题的收尾。）

### S03A6 边遍历边删的安全写法
```java
import java.util.ArrayList;
import java.util.List;

public class RemoveWhileIteratingDemo {
    public static void main(String[] args) {
        List<String> names = new ArrayList<String>();
        names.add("小明");
        names.add("小红");
        names.add("小刚");
        names.removeIf(name -> name.equals("小红"));
        System.out.println(names);
    }
}
```
预测输出。再想一步：如果把 `removeIf` 换成 for-each 循环里直接 `names.remove(name)`，会发生什么？

## B. 修改题

### S03B1 day02hashmap 覆盖语义
在 `legacy_fundamentals/collections_generics/day02_hashmap/` 里对同一 key 再 `put` 一次不同分数。
预测：遍历输出几条？旧值去哪了？运行验证。

### S03B2 day01exception 捕获范围
在 `exceptions_io/day01_exception/` 里把 `catch (ArithmeticException e)` 改成 `catch (RuntimeException e)`。
预测：输出有变化吗？再把除数改为非零，两种写法行为差异是什么？思考：捕获范围放大换来了什么、丢了什么（参考 [异常设计深化课](../deep_dives/03_exception_design/README.md)）。

### S03B3 FileStudentRepository 编码
把 `FileStudentRepository` 的读取编码临时改为 GBK（写入保持 UTF-8），先手工用 UTF-8 运行一次程序生成数据文件，再运行第二次。
预测：读出的学生名是什么形态？程序崩溃吗？这个实验对应 [UTF-8 深化课](../deep_dives/04_utf8_io/README.md) 的哪一行？

### S03B4 day03streamcollect 链式加工
在 `lambda_stream/day03_stream_collect/` 的流水线中间插入 `.map(n -> n + "!")`。
预测输出列表内容；再说明这行 map 的输入/输出类型各是什么（泛型读法练习）。

---

完成后回到 [结构化练习](../existing_course/exercises/collection_exception_io_exercises.md) 完成四个系统扩展练习，或在网站"编程练习"里做对应的交互版（题面见 [s03-exercises.md](s03-exercises.md)）。
