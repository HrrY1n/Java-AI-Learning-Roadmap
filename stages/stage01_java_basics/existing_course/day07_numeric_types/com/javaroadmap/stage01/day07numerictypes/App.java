package com.javaroadmap.stage01.day07numerictypes;

/**
 * 知识点：Java 八种基本数据类型、编译期常量窄化、整型提升、整数溢出与浮点特殊值。
 *
 * Observe：预测 (max + 1)、byte + byte 的类型归属、1.0 / 0.0 以及 Math.addExact 的输出。
 * Modify：照 29 行注释把 byteSum 改成 byte 类型，观察整型提升后的编译保护；再把 15 行 long 字面量的 L 去掉试试，看 javac 怎么报错。
 */
public class App {
    public static void main(String[] args) {
        // 1. 四种整型：byte(8位) / short(16位) / int(32位) / long(64位)
        byte box = 127;               // 编译期字面量 127 在 byte(-128~127) 内，编译器允许隐式窄化
        short small = 32767;
        int normal = 2_100_000_000;
        long big = 9_000_000_000L;    // 超过 int 范围的整数字面量必须带 L 后缀

        // 2. 两种浮点（IEEE 754）+ 字符 + 布尔 = 共八种基本类型
        float f = 3.14f;
        double d = 3.14;
        char letter = 'A';            // 16 位无符号 Unicode 码元（0 ~ 65535）
        boolean flag = true;          // 逻辑真假，不能与 0/1 互换

        System.out.println("byte 最大：" + box + "，short 最大：" + small);
        System.out.println("int：" + normal + "，long：" + big);
        System.out.println("float：" + f + "，double：" + d + "，char：" + letter + "，boolean：" + flag);

        // 3. 整型提升：byte/short/char 参与算术运算时会先自动提升为 int
        byte x = 10, y = 20;
        int byteSum = x + y;          // 若写成 byte byteSum = x + y; 编译报错：从 int 转换到 byte 可能有损失
        System.out.println("byte 相加提升为 int：" + byteSum);

        // 4. 整数溢出：静默补码绕回 vs Math.addExact 显式失败
        int max = Integer.MAX_VALUE;
        System.out.println("int 最大值 + 1 = " + (max + 1));
        try {
            Math.addExact(max, 1);
        } catch (ArithmeticException e) {
            System.out.println("Math.addExact 拦截溢出：" + e.getMessage());
        }

        // 5. 浮点不抛除零异常也不绕回，按 IEEE 754 产生 Infinity / NaN（回想 day02 的 0.1+0.2）
        System.out.println("1.0 / 0.0 = " + (1.0 / 0.0));
        System.out.println("0.0 / 0.0 = " + (0.0 / 0.0));
    }
}
