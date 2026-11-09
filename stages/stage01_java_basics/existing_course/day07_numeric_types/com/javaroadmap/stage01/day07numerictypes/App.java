package com.javaroadmap.stage01.day07numerictypes;

/**
 * 知识点：整型四档（byte/short/int/long）、浮点两档（float/double）、字面量后缀与溢出。
 *
 * 心智模型：每种数值类型是一个"固定宽度的格子"——格子越宽，装的范围越大；
 * 超出格子宽度的数学结果会被"截断绕回"，而不是自动换更大的格子。
 *
 * Observe：先预测"int 最大值 + 1"输出什么，再运行核对。
 * Modify：把 9_000_000_000L 的 L 去掉（编译错误——字面量默认按 int 读）；把 byte 的 127 改成 128 试试。
 */
public class App {
    public static void main(String[] args) {
        // 日常用 int；确需更大范围才用 long，并给字面量加 L 后缀。
        byte box = 127;               // 8 位：-128 ~ 127
        short small = 32767;          // 16 位：约 ±3.2 万
        int normal = 2_100_000_000;   // 32 位：约 ±21 亿（下划线只是分组，便于读位数）
        long big = 9_000_000_000L;    // 64 位：超过 int 范围的字面量必须带 L
        System.out.println("byte 最大：" + box);
        System.out.println("short 最大：" + small);
        System.out.println("int：" + normal);
        System.out.println("long：" + big);

        // 溢出现场：int 最大值再加 1 不会"更大"，而是绕回最小值（32 位补码的固定行为）。
        int max = Integer.MAX_VALUE;
        System.out.println("int 最大值 + 1 = " + (max + 1));

        // 小数字面量默认是 double；float 是 32 位浮点，字面量要加 f 后缀。
        // 金额等精确小数两者都不合适（回想 day02 的 0.1 + 0.2），要用 BigDecimal（以后会学）。
        float f = 3.14f;
        double d = 3.14;
        System.out.println("float 3.14f：" + f);
        System.out.println("double 3.14：" + d);
    }
}
