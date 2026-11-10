package com.javaroadmap.stage01.day01outputvariable;

/**
 * 知识点：变量与输出——给数据起名字，再把它打印出来。
 *
 * 心智模型：变量是"带类型标签的格子"；String 装文本，int 装整数。
 * 局部变量必须先声明并赋值后才能读取（否则编译报错），但之后可以重新写入新值。
 *
 * Observe：先预测会打印几行、每次 age 的值以及最后一行 "+" 拼接输出什么，再运行核对。
 * Modify：把 age = 19; 删掉或把赋值移到读取之后，观察 javac 报什么错。
 */
public class App {
    public static void main(String[] args) {
        String name = "小明";
        String school = "青云大学";
        String city = "济南";
        int age = 18;

        System.out.println("姓名：" + name);
        System.out.println("学校：" + school);
        System.out.println("城市：" + city);
        System.out.println("年龄：" + age);

        // "变"量：可以原地写入新值，后面的读取立刻看到新状态。
        age = 19;
        System.out.println("明年年龄：" + age);

        // + 号从左到右结合：先遇到数字做加法，遇到 String 之后全变文本拼接（预测题 A2）。
        System.out.println(1 + 2 + "3" + 4);
    }
}
