package com.javaroadmap.stage02.day02constructorthis;

/** 知识点：构造方法。 */
public class Person {
    String name;
    int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public void show() {
        System.out.println("姓名：" + name + "，年龄：" + age);
    }
}

