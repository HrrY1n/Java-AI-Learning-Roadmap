package com.javaroadmap.stage01.console;

import java.util.Scanner;

/** 简单计算器。 */
public class SimpleCalculatorApp {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("请输入第一个数字：");
        double a = scanner.nextDouble();

        System.out.print("请输入运算符（+ - * /）：");
        String operator = scanner.next();

        System.out.print("请输入第二个数字：");
        double b = scanner.nextDouble();

        calculateAndPrint(a, operator, b);
        scanner.close();
    }

    public static void calculateAndPrint(double a, String operator, double b) {
        if ("+".equals(operator)) {
            System.out.println("结果：" + (a + b));
        } else if ("-".equals(operator)) {
            System.out.println("结果：" + (a - b));
        } else if ("*".equals(operator)) {
            System.out.println("结果：" + (a * b));
        } else if ("/".equals(operator)) {
            if (b == 0) {
                System.out.println("除数不能为 0");
            } else {
                System.out.println("结果：" + (a / b));
            }
        } else {
            System.out.println("暂不支持这个运算符：" + operator);
        }
    }
}

