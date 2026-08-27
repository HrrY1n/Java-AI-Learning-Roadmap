package com.javaroadmap.stage01.guessnumber;

import java.util.Random;
import java.util.Scanner;

/** 项目：猜数字小游戏。 */
public class GuessNumber {
    public static void main(String[] args) {
        Random random = new Random();
        Scanner scanner = new Scanner(System.in);

        int answer = random.nextInt(100) + 1;
        int count = 0;

        System.out.println("我已经想好了一个 1 到 100 的数字，请你来猜。");

        while (true) {
            System.out.print("请输入你的猜测：");
            int guess = scanner.nextInt();
            count++;

            if (guess > answer) {
                System.out.println("猜大了");
            } else if (guess < answer) {
                System.out.println("猜小了");
            } else {
                System.out.println("猜对了！你一共猜了 " + count + " 次。");
                break;
            }
        }

        scanner.close();
    }
}

