package com.javaroadmap.stage02.day05polymorphism;

/** 知识点：多态中的父类。 */
public class Animal {
    String name;

    public Animal(String name) {
        this.name = name;
    }

    public void eat() {
        System.out.println(name + " 正在吃东西");
    }
}

