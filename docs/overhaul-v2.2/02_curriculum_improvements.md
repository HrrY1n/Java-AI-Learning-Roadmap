# 02 · Stage 01–04 课程实际改进明细（V2.2-P1/P3/P5）

> 全部改进均保留原课程稳定 ID（零破坏用户学习历史），对应提交：`a09d0c2`（Stage04 练习与并发工具）、`daf62d4`（Stage01–04 缺陷修复与连续讲义）、`fca64d2`（评审修复）。

## 一、Stage 01 Java 基础改进

| 课程/目录 | 实际修改 | 证据文件 |
| --- | --- | --- |
| `day01` | 源码补变量再赋值与 `+` 左结合；JSON 补 JLS §16 赋值前读限制 | `stages/stage01_java_basics/existing_course/day01_output_variable/.../App.java`、`day01.json` |
| `day02` | 修正左结合优先级表述；源码补 `0.1 + 0.2` 精度展示与 `(int) 'A'` 数值化 | `day02_data_type_operator/.../App.java`、`day02.json` |
| `day03` | 去掉超前的 `new int[2]`，改用纯变量除零短路；新增连续 `bodyPath` 讲义（条件遮蔽/Java 14 `->`/支持类型/四要素闭环），收拢机械短步骤 | `day03_if_switch/README.md`、`App.java`、`day03.json` |
| `day04` | 源码补 `continue`/`break` 实例；JSON 清理“两个倒计时”陈旧文案 | `day04_loop/.../App.java`、`day04.json` |
| `day05` | JSON 补充空数组时 `sum * 1.0 / 0` 产生 `NaN` 边界提醒 | `day05.json` |
| `day07` | 源码补 `char`/`boolean`、整型提升、`Math.addExact` 与 `Infinity`/`NaN`；新增连续 `bodyPath` 讲义（8 种类型总表、JLS §5.2/§5.6 常量窄化与提升、四要素闭环） | `day07_numeric_types/README.md`、`App.java`、`day07.json` |

## 二、Stage 02 面向对象基础改进

| 课程/目录 | 实际修改 | 证据文件 |
| --- | --- | --- |
| `s02-class-basics` | 增加第二个独立 `Student` 实例与默认零值/NPE 实验；补全成员变量 vs 局部变量默认值对比 | `day01_class_object/.../App.java`、`s02-class-basics.json` |
| `s02-constructor-this` & `deep02` | 补齐 JLS §12.5 5 步初始化、§8.8.9 默认构造器语义、重载+`this(...)`+`return this` 链式调用、`void` 误写反例，删“赋值出”误导措辞 | `day02_constructor_this/`、`deep_dives/02_constructor_this/README.md`、`s02-constructor-this.json` |
| `s02-static-lifecycle` | 拆建为真多包工程（`day07staticvisibility` + `otherpkg/SubStudent` + `ExternalCaller`），`javac` 实证 JLS §6.6.2 `protected` 跨包限制、顶层类权限、`static {}` 时机与多别名 GC；挂入连续讲义与四要素闭环 | `day07_static_visibility/`、`s02-static-lifecycle.json` |
| `s02-encapsulation-basics` & `deep03` | `Account` 构造器加初始负余额校验；`EncapsulationDemo` 新增 `LeakyTeam` 内部数组引用逃逸反例；提醒 `double` 精度隐患 | `day03_encapsulation/Account.java`、`deep_dives/03_encapsulation_why/` |
| `s02-reference-state` | 删对 Stage 04 讲深浅拷贝的虚假承诺，就地补最小浅拷贝 vs 深拷贝对照；`sameContent` 改用 `Objects.equals`；新增传参改字段 vs 重赋形参代码段 | `deep_dives/01_reference_state/` |
| `s02-string-common-api` | 源码补字面量常量池与 `new String` 对照；挂入连续讲义（不可变机制、常量池模型、四要素闭环） | `examples/common_api/day01_string/`、`s02-string-common-api.json` |

## 三、Stage 03 Java 核心 API 改进

| 课程/目录 | 实际修改 | 证据文件 |
| --- | --- | --- |
| `s03-arraylist` | 面向 `List` + `<>`；增补 `remove(1)` vs `remove(Integer.valueOf(1))`、正向删除漏删反例与 `removeIf`、包装类 `IntegerCache(-128~127)`；挂入连续讲义（补齐包装类断档+四要素闭环） | `collections_generics/day01_arraylist/`、`s03-arraylist.json` |
| `s03-hashmap` | 修正错链的 `relatedLessonIds`（`s03-equals-hashcode`、`s03-choose-collection`）；挂入连续讲义（桶定位、JDK 8 树化阈值 ≥8 & ≥64、`null` 规则、拆箱 NPE、四要素闭环） | `collections_generics/day02_hashmap/README.md`、`s03-hashmap.json` |
| `s03-equals-hashcode` | 增补“只重写 `equals` 未重写 `hashCode`”与“可变字段修改后在 `HashSet` 失踪”两大反例 | `advanced/equals_hashcode/App.java` |
| `s03-exception` & `deep03` | `BusinessException` 补 `(String, Throwable)` 构造器；`FileStudentRepository` 保留 `cause` 抛 `IllegalStateException` 不再被业务层吞掉；修正 `ExceptionDesignDemo` 与 `README` 矛盾；`s03-exception.json` 删“返回 0”反模式，补 `Throwable` 树与 `try-with-resources` | `exception/BusinessException.java`、`student/FileStudentRepository.java`、`deep_dives/03_exception_design/`、`s03-exception.json` |

## 四、Stage 04 并发基础改进与扩充

| 课程/目录 | 实际修改 | 证据文件 |
| --- | --- | --- |
| `s04-thread-basics` | 去掉非确定性 `RUNNABLE` 打印期待（同步 `verify_manifest.tsv`）；补全 6 种 `Thread.State` 与重复 `start()` 抛异常 | `day01_thread_basics/App.java`、`s04-thread-basics.json` |
| `s04-visibility-volatile` | 修正虚假 `println` 提示错位；挂入连续讲义（JIT 循环提升、DCL 有序性、`happens-before` 传递性、四要素闭环） | `day02_visibility_volatile/`、`s04-visibility-volatile.json` |
| `s04-synchronized-mutex` | 源码补可重入锁嵌套调用 `ReentrantCounter`；挂入连续讲义（`unlock hb lock`、实例锁 vs 类锁、最小死锁与加锁顺序、四要素闭环） | `day03_synchronized_mutex/`、`s04-synchronized-mutex.json` |
| `s04-concurrent-tools`（新增） | 补充 `AtomicInteger` CAS、`Callable/Future` 与 `ConcurrentHashMap`（衔接练习 3 与 `S04B1`）；线程池改 `try-finally` 关闭；挂连续讲义（JDK 7 成环 vs JDK 8 覆盖、ABA/`LongAdder`、`computeIfAbsent` 桶锁风险、四要素闭环） | `day05_concurrent_tools/`、`s04-concurrent-tools.json` |
