# 位、字节与整数表示：溢出的物理来源

## 1. Scenario：从一个具体问题出发
Java `int` 乘法结果突然变成负数；把 `int` 转成 `byte` 后值也改变。

## 2. Why：为什么这个问题值得系统理解
整数溢出不是随机错误，而是固定位宽、补码和截断规则共同决定的确定性结果。

## 3. Concept：核心概念
计算机用固定比特表示整数。Java `int` 是 32 位补码，`byte` 是 8 位补码；高位截断和符号扩展会改变值。无符号运算在 Java 中需要 `Integer.toUnsignedLong` 等辅助方法。

## 4. Mental Model：把机制装进一张图
一个整数不是抽象数字，而是有限比特串。加法可能回绕，移位可能符号扩展，类型转换可能截断。

## 5. Minimal Code：最小示例
```java
int overflow = Integer.MAX_VALUE + 1;
int truncated = (byte) 300 & 0xff;
System.out.println(overflow + " / " + truncated);
```

## 6. Observe：先预测，再运行
先预测 `overflow`、`truncated` 的值，再运行源码；用 `Integer.toBinaryString()` 打印关键中间值。

## 7. Modify：只改一个有意义的条件
把 `300` 改为 `-300` 或把 `byte` 改成 `short`，比较截断结果和符号位变化。

## 8. Exercise：独立完成
实现 `safeAdd(int a, int b)`，在溢出前抛出异常；另写测试证明边界 `Integer.MAX_VALUE`、`MIN_VALUE` 都被覆盖。

## 9. Real Usage：联系 Java 与工程实践
协议解析、哈希函数、位标志、金额分单位计算都依赖位级语义；不要用浮点数表示精确金额。

## 来源与出处
《CSAPP, 3rd Global Edition》Chapter 2, 2.1–2.3 节（PDF 第 71-145 页）。
