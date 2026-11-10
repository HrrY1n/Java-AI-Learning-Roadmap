package com.javaroadmap.stage01.answers;

import java.util.Scanner;

/** 简单计算器练习参考答案。 */
public class SimpleCalculatorAnswer {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        // 题面契约：输入不是数字时提示"请输入数字"后正常结束，而不是让 InputMismatchException 崩溃。
        if (!scanner.hasNextDouble()) {
            System.out.println("请输入数字");
            scanner.close();
            return;
        }
        System.out.print("请输入第一个数字：");
        double a = scanner.nextDouble();
        System.out.print("请输入运算符：");
        String operator = scanner.next();
        System.out.print("请输入第二个数字：");
        double b = scanner.nextDouble();

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

        scanner.close();
    }
}

