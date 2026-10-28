package com.javaroadmap.stage01.deepdives.scanner;

import java.util.InputMismatchException;
import java.util.Scanner;

/**
 * 深化课 07：Scanner 与非法输入——为什么输入字母程序就崩了。
 *
 * 场景：菜单程序里输入 "abc"，nextInt() 直接抛 InputMismatchException，
 * 程序崩溃——而且循环菜单里这个异常会一轮接一轮地抛，看起来像死循环。
 *
 * 心智模型：Scanner 逐个"记号"读取。nextInt 只接受整数记号；记号不匹配时
 * 异常被抛出，且**坏记号不会被消费**——这是"崩溃循环"的根源。
 * 两种防御：事前用 hasNextInt 询问；事后用 try/catch 捕获并把坏记号消费掉。
 *
 * Observe：运行后分别输入字母、数字，观察两种防御的输出差异。
 * 自动化测试可直接重定向输入：java ... < input.txt（见 scripts/fixtures/）。
 */
public class ScannerGuardDemo {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        // 防御一：先问再读（推荐用于菜单循环）。
        int choice = readIntInRange(scanner, "选择防御方式（1=hasNextInt 演示，2=try/catch 演示）：", 1, 2);

        if (choice == 1) {
            System.out.print("输入任意词：");
            // hasNextInt 询问"下一个记号是不是整数"，不消费记号。
            System.out.println("下一个记号是整数吗：" + scanner.hasNextInt());
            System.out.println("原样读出：" + scanner.next());
        } else {
            System.out.println("现在输入 10 / 0：");
            try {
                int a = scanner.nextInt();
                int b = scanner.nextInt();
                System.out.println("商 = " + (a / b));
            } catch (InputMismatchException e) {
                // 只捕获"输入不是整数"这一种可恢复错误，不扩大捕获范围。
                System.out.println("输入的不是整数，坏记号还在缓冲区里");
            }
            // 捕获后如果不消费坏记号，下一次 nextInt 会立刻再抛同样的异常——崩溃循环。
            if (scanner.hasNext()) {
                System.out.println("消费掉坏记号：" + scanner.next());
            }
        }

        System.out.println("程序正常结束（没有被异常打断）");
        scanner.close();
    }

    // 通用模式：循环 + 事前校验 + 范围检查，读不到合法值不返回。
    static int readIntInRange(Scanner scanner, String prompt, int min, int max) {
        while (true) {
            System.out.print(prompt);
            if (scanner.hasNextInt()) {
                int value = scanner.nextInt();
                if (value >= min && value <= max) {
                    return value;
                }
                System.out.println("请在 " + min + " 到 " + max + " 之间");
            } else {
                System.out.println("这不是整数：" + scanner.next());   // next() 消费坏记号
            }
        }
    }
}
