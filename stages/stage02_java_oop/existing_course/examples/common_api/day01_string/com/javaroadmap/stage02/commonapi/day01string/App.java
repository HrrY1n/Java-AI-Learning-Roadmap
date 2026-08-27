package com.javaroadmap.stage02.commonapi.day01string;

/** 知识点：String 字符串。 */
public class App {
    public static void main(String[] args) {
        String text = "I love Java";

        System.out.println("长度：" + text.length());
        System.out.println("是否包含 Java：" + text.contains("Java"));
        System.out.println("转大写：" + text.toUpperCase());
        System.out.println("从第 2 个字符开始截取：" + text.substring(2));

        String a = new String("Java");
        String b = new String("Java");
        System.out.println("内容是否相同：" + a.equals(b));
    }
}

