# static、跨包可见性与对象生命周期

> 对应示例：`day07_static_visibility`（多包：`day07staticvisibility` 与 `otherpkg` 四个文件）

## 1. static 成员与类初始化时机

- **归属差异**：实例字段（如 `name`、`score`）随每次 `new` 各占一份；`static` 字段属于类本身，全类只有一份。
- **初始化顺序（JLS §12.4）**：类首次被主动使用（例如 `new Student(...)`、读写非常量 `static` 字段 `Student.createdCount`、调用 `static` 方法）时，JVM 触发类初始化——按源码顺序执行静态字段赋值与 `static { ... }` 静态代码块。整个程序生命周期里**只初始化一次**，且必定早于对象构造器运行。
- **常见硬规则**：`static` 方法没有 `this`（不存在“当前对象”），因此内部不能直接读写非静态实例字段，也不能直接调用普通实例方法。

> 注：如果写成 `public static final int MAX = 100;`（编译期常量），调用方读取它时可能直接被编译器内联为字面量，不一定会触发类初始化。

## 2. 包（package）与四档可见性精确矩阵

Java 的包名直接对应磁盘目录树（如 `com.javaroadmap.stage02.otherpkg` 对应 `com/javaroadmap/stage02/otherpkg/`），不同包之间的访问需要 `import`。

| 修饰符 | 本类内部 | 同包其他类 | 跨包子类 (`extends`) | 跨包非子类 |
| --- | :---: | :---: | :---: | :---: |
| `private` | ✓ | ✗ | ✗ | ✗ |
| 不写（默认/包私有） | ✓ | ✓ | ✗ | ✗ |
| `protected` | ✓ | ✓ | **有限制 ✓** | ✗ |
| `public` | ✓ | ✓ | ✓ | ✓ |

### `protected` 跨包访问的真正规则（JLS §6.6.2）

初学者最常把 `protected` 误背成“子类哪里都能访问”。精准规则是：**跨包子类只能通过子类自身类型（如 `this` 或 `SubStudent` 引用）访问继承下来的 `protected` 成员；不能在子类方法里 `new Student(...)` 后通过父类引用直接访问 `base.gradeNote`！** 本课 `SubStudent.java` 已留有注释对照实验行，取消注释即可亲眼看到 `javac` 报错。

### 顶层类的修饰符限制（JLS §8.1.1）

顶层类（直接写在 `.java` 文件最外层的类）**只有两种可见性**：`public` 或不写（包私有）。`private class Foo` 和 `protected class Foo` 在顶层都会直接编译失败；且一个源文件至多只能有一个 `public` 顶层类，文件名必须与它完全相同。

## 3. 对象的一生与垃圾回收（GC）初步

```text
new 出生 ──▶ 强可达（至少有一个存活引用指向它） ──▶ 全部引用断开（不可达） ──▶ GC 择机回收
```

- **多别名与可达性**：只要还有像 `alias` 这样的其他变量指着对象，把 `a = null;` 并不会让对象消失（`alias.describe()` 照样正常输出）。必须等到**所有强引用全部断开**，对象才成为不可达垃圾。
- **程序不能手动控制何时回收**：`System.gc()` 也只是“建议”而非强制执行。正因为 GC 时机不确定，文件流、数据库连接（Stage 03/05）**绝不能等 GC 回收才释放**，必须使用 `try-with-resources` 或显式 `close()`。

## 学习验收与自我检核

- **需要掌握什么**：说清 `static` 与实例成员的归属及初始化时机；熟记四档修饰符精确权限矩阵（含 `protected` 跨包限制与顶层类限制）；理解多别名场景下的对象可达性。
- **如何证明理解**：① 取消 `SubStudent` 的两行注释，不用运行就能解释为什么 `base.gradeNote` 与 `this.internalTag` 报错而 `this.gradeNote` 通过；② 说明为何 `ExternalCaller` 看不到 `PackageOnlyHelper`；③ 在有别名的代码里判断对象何时真正变成不可达。
- **什么情况属于尚未掌握**：认为“把变量置 `null` 内存就立刻释放了”，或以为跨包子类可以用父类实例随意访问父类的 `protected` 字段。
- **针对错误如何复习**：编译权限困惑对照本节矩阵表逐项在 `SubStudent`/`ExternalCaller` 取消注释验证；引用别名困惑回看 `s02-reference-state`。
