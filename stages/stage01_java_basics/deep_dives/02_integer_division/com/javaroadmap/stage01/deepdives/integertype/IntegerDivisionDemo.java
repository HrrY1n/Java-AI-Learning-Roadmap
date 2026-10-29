package com.javaroadmap.stage01.deepdives.integertype;

/**
 * 深化课 02：整数除法与类型转换。
 *
 * 场景：day02 里出现过 "a / b = 3"（10 / 3），day05 里出现过 sum * 1.0 / length。
 * 心智模型：Java 对"两个操作数的类型"各算各的——两个 int 运算结果还是 int，
 * 只要有一个是 double，另一个就被"提升"为 double 再运算。
 *
 * Observe：先预测每一行输出，再运行核对。重点预测：
 *   1) 10 / 3 和 10.0 / 3 为什么不同？
 *   2) (int) 3.99 得到 3 还是 4？
 *   3) (int) (scoreSum * 1.0 / count) 会不会丢小数？
 */
public class IntegerDivisionDemo {
    public static void main(String[] args) {
        int a = 10;
        int b = 3;

        System.out.println("1) " + (a / b));        // 两个 int 相除：商的整数部分，小数直接丢弃（不是四舍五入）
        System.out.println("2) " + (a % b));        // % 取余：10 = 3*3 + 1，余 1
        System.out.println("3) " + (a / 3.0));      // 3.0 是 double，10 被提升为 10.0，做小数除法

        double exact = (double) a / b;              // 强制转换写在除法之前才有意义
        System.out.println("4) " + exact);

        // 强制转换是"截断"，不是四舍五入——这是高频错误。
        double price = 3.99;
        int truncated = (int) price;
        System.out.println("5) " + truncated);      // 3：直接砍掉小数部分

        // 四舍五入要用 Math.round，返回 long，需要再转 int。
        int rounded = (int) Math.round(price);
        System.out.println("6) " + rounded);        // 4

        // day05 平均分的写法为什么乘 1.0？——把整数除法变成小数除法。
        int scoreSum = 95 + 76 + 82;
        int count = 3;
        System.out.println("7) " + (scoreSum / count));                 // 84：错误但能编译
        System.out.println("8) " + (scoreSum * 1.0 / count));           // 84.333...
        System.out.println("9) " + (int) (scoreSum * 1.0 / count));     // 先小数除法，再取整

        // 强制转换的位置决定结果：先除后转，小数已经丢了；先转后除才是小数除法。
        System.out.println("10) " + (double) (a / b));   // 3.0——小数在括号里就丢掉了
        System.out.println("11) " + (double) a / b);     // 3.333...
    }
}
