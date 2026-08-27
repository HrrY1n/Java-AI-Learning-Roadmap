package com.javaroadmap.stage02.day04inheritance;

/** 知识点：父类。 */
public class Animal {
    String name;

    public Animal(String name) {
        this.name = name;
    }

    public void eat() {
        System.out.println(name + " 正在吃东西");
    }
}

