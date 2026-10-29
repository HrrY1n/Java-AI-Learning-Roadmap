# Stage 01 预测与修改练习集

用法：**先在纸上写预测，再运行验证**；预测错误的条目，回看对应深化课并写一句"我原来的模型错在哪"。全部答案集中在 [answers.md](answers.md)——做完至少 6 题再打开。

## A. 预测题（先写预测，再新建文件运行）

### A1 整数除法与取余
```java
System.out.println(7 / 2 + " / " + 7 % 2);
System.out.println(7 / 2.0);
```
预测两行输出。参考：[深化课 02](../deep_dives/02_integer_division/README.md)

### A2 加号的两副面孔
```java
System.out.println(1 + 2 + "3" + 4 + 5);
```
预测输出（提示：加号从左到右，遇到 String 前后行为不同）。

### A3 循环边界
```java
for (int i = 0; i < 3; i++) {
    System.out.print(i);
}
System.out.println();
```
预测输出；然后只把 `<` 改成 `<=`，再预测一次。

### A4 continue 与 break 的接力
```java
for (int i = 1; i <= 5; i++) {
    if (i % 2 == 0) continue;
    if (i == 5) break;
    System.out.print(i + " ");
}
System.out.println("结束");
```
预测输出。参考：[深化课 05](../deep_dives/05_loop_bounds/README.md)

### A5 数组别名
```java
int[] a = {1, 2, 3};
int[] b = a;
b[1] = 99;
System.out.println(a[1]);
```
预测输出。参考：[深化课 03](../deep_dives/03_array_memory/README.md)

### A6 参数传递
```java
public class T6 {
    public static void main(String[] args) {
        int n = 5;
        bump(n);
        System.out.println(n);
    }
    static void bump(int x) {
        x++;
    }
}
```
预测输出。参考：[深化课 04](../deep_dives/04_argument_passing/README.md)

### A7 char 与 int
```java
System.out.println('A' + 1);
System.out.println((char) ('A' + 1));
```
预测两行输出（两行不一样，为什么？）。

### A8 短路求值
```java
int[] arr = new int[2];
if (arr.length > 2 && arr[2] == 0) {
    System.out.println("不会走到这里");
}
System.out.println("安全");
```
预测：会崩溃吗？`&&` 的右边执行了吗？把 `&&` 换成 `&` 再跑一次，对比。

## B. 修改题（改一个条件，先预测差异再运行）

### B1 day02 数据类型
在 `existing_course/day02_data_type_operator/` 里把 `int b = 3;` 改为 `double b = 3.0;`。
预测：哪些输出行变了？`a % b` 现在输出什么？

### B2 day05 数组
在 `existing_course/day05_array/` 里把第一个分数 90 改为 60。
预测：总分、平均分各变多少？先笔算再运行核对。

### B3 MenuDemoApp 退出分支
在 `existing_course/src/` 的 `MenuDemoApp` 里，把 `case 0:` 的打印语句从 `break` 之前移到之后（放回 switch 外、循环内）。
预测：输入 0 后程序行为有什么变化？（提示：break 只跳出 switch，不跳出 while。）

### B4 计算器加一条规则
在 `SimpleCalculatorApp` 里给乘法加约束"第二个数不能是 0"。
先预测：需要动几个地方？实现后用 `6 * 0` 与 `6 * 3` 验证。

---

完成后回到 [结构化练习](../existing_course/exercises/basic_syntax_exercises.md) 做独立实现题。
