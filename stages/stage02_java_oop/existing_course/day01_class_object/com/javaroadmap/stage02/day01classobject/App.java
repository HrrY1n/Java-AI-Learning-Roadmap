package com.javaroadmap.stage02.day01classobject;

/** 知识点：类与对象。 */
public class App {
    public static void main(String[] args) {
        Student student = new Student();
        student.name = "小明";
        student.age = 18;

        student.sayHello();
    }
}

