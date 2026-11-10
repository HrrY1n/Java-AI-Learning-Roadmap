package com.javaroadmap.stage03.lambdastream.day01lambda;

/** 知识点：Lambda 表达式——只捕获 final 或"有效 final"的局部变量。 */
public class App {
    public static void main(String[] args) {
        Calculator calculator = (a, b) -> a + b;

        int result = calculator.add(10, 20);
        System.out.println("结果：" + result);

        // 变量捕获：lambda 抓住的是 base 这个局部变量，不是它的拷贝——
        // 所以 Java 要求它捕获后不能再改（final 或"有效 final"）。
        int base = 10;
        Calculator withBase = (a, b) -> a + b + base;
        System.out.println("带基数结果：" + withBase.add(10, 20));
        // base = 20; // 取消注释：编译报错——被 lambda 捕获的局部变量必须是有效 final
    }
}

interface Calculator {
    int add(int a, int b);
}

