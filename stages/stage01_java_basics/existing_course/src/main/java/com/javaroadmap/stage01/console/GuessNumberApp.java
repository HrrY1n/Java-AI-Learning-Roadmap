package com.javaroadmap.stage01.console;

import java.util.Random;
import java.util.Scanner;

/** 猜数字小游戏。 */
public class GuessNumberApp {
    public static void main(String[] args) {
        Random random = new Random();
        Scanner scanner = new Scanner(System.in);

        int answer = random.nextInt(100) + 1;
        int count = 0;

        System.out.println("请猜一个 1 到 100 之间的数字。");

        while (true) {
            System.out.print("请输入你的猜测：");
            int guess = scanner.nextInt();
            count++;

            if (guess > answer) {
                System.out.println("猜大了");
            } else if (guess < answer) {
                System.out.println("猜小了");
            } else {
                System.out.println("猜对了，一共猜了 " + count + " 次。");
                break;
            }
        }

        scanner.close();
    }
}

