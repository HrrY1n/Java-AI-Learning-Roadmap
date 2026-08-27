package com.javaroadmap.stage03.collections.day05studentmanagement;

/** 知识点：集合中的对象类型。 */
public class Student {
    private String name;
    private int score;

    public Student(String name, int score) {
        this.name = name;
        this.score = score;
    }

    public void show() {
        System.out.println("姓名：" + name + "，分数：" + score);
    }
}

