# 浮点数：二进制近似与舍入边界

## 1. Scenario：从一个具体问题出发
金额用 `double` 累加后出现 0.30000000000000004。

## 2. Why：为什么这个问题值得系统理解
浮点数用有限二进制近似十进制，误差来自指数、尾数与舍入规则，不是 JVM 的 bug。

## 3. Concept：核心概念
IEEE 754 用符号、指数和尾数表示数。Java `float` 是 32 位，`double` 是 64 位；加减乘除会舍入，特殊值包括 NaN、Infinity 和 -0.0。

## 4. Mental Model：把机制装进一张图
浮点数像“有精度的科学计数法”。越远离 1，可表示的相邻数间隔越大。

## 5. Minimal Code：最小示例
```java
System.out.println(0.1 + 0.2 == 0.3);
System.out.println(Math.abs(0.1 + 0.2 - 0.3) < 1e-15);
```

## 6. Observe：先预测，再运行
先预测输出，再运行；用 `BigDecimal` 重做同一计算并比较字符串结果。

## 7. Modify：只改一个有意义的条件
把 `0.1` 改成 `1.0 / 3.0`，或把阈值从 `1e-15` 改成 `1e-20`，观察判断何时失效。

## 8. Exercise：独立完成
实现 `moneyEquals(double a, double b)`，写清精度阈值和适用场景；再解释为什么金额通常用最小货币单位的整数或 `BigDecimal`。

## 9. Real Usage：联系 Java 与工程实践
统计阈值、科学计算可使用浮点；金额、库存和账务要避免 `double` 直接累加。

## 来源与出处
《CSAPP, 3rd Global Edition》Chapter 2, 2.4 节（PDF 第 145-163 页）。
