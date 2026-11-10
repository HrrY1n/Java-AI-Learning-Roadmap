package com.javaroadmap.stage01.day02datatypeoperator;

/**
 * 知识点：数据类型与运算符——整型截断、char 数值本质与浮点精度边界。
 *
 * Observe：预测 a / b、a % b、(int) level 与 0.1 + 0.2 的输出，再运行核对。
 * Modify：把 int b = 3 改为 double b = 3.0，逐行观察哪几行只是显示变化、哪一行数值变化。
 */
public class App {
    public static void main(String[] args) {
        int a = 10;
        int b = 3;

        // 两个 int 相除结果仍是 int（直接舍去小数，不四舍五入）；取余 % 得到余数。
        System.out.println("a + b = " + (a + b));
        System.out.println("a - b = " + (a - b));
        System.out.println("a * b = " + (a * b));
        System.out.println("a / b = " + (a / b));
        System.out.println("a % b = " + (a % b));

        // 浮点数默认采用二进制 IEEE 754（double）：0.1 + 0.2 无法精确表示为十进制 0.3。
        double price = 19.9;
        System.out.println("价格：" + price);
        System.out.println("0.1 + 0.2 = " + (0.1 + 0.2));

        // char 在内存中本质上是 16 位无符号 UTF-16 整数（'A' 对应码值 65，见预测题 A7）。
        boolean isAdult = true;
        char level = 'A';
        System.out.println("是否成年：" + isAdult);
        System.out.println("等级：" + level + "（整数码值：" + (int) level + "）");
        System.out.println("a 是否大于 b：" + (a > b));
    }
}
