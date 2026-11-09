package com.javaroadmap.stage01.day01outputvariable;

/**
 * 知识点：变量与输出——给数据起名字，再把它打印出来。
 *
 * 心智模型：变量是"带类型标签的格子"；String 装文本，int 装整数。
 * println 把表达式的值交给标准输出，+ 把文本和变量值拼在一起。
 *
 * Observe：先预测会打印几行、每行内容，再运行核对。
 * Modify：只改 age 的值再运行；跳过 javac 直接 java 会看到什么？
 */
public class App {
    public static void main(String[] args) {
        // 信息变化时只改定义处，下面的打印不用动——这就是变量存在的理由。
        String name = "小明";
        String school = "青云大学";
        String city = "济南";
        int age = 18;

        System.out.println("姓名：" + name);
        System.out.println("学校：" + school);
        System.out.println("城市：" + city);
        System.out.println("年龄：" + age);
    }
}
