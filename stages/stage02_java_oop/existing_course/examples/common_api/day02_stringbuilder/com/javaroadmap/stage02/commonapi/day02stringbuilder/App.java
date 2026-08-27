package com.javaroadmap.stage02.commonapi.day02stringbuilder;

/** 知识点：StringBuilder。 */
public class App {
    public static void main(String[] args) {
        StringBuilder builder = new StringBuilder();

        builder.append("姓名：").append("小明");
        builder.append("，年龄：").append(18);
        builder.append("，课程：").append("Java");

        String result = builder.toString();
        System.out.println(result);

        StringBuilder word = new StringBuilder("Java");
        System.out.println("反转：" + word.reverse().toString());
    }
}

