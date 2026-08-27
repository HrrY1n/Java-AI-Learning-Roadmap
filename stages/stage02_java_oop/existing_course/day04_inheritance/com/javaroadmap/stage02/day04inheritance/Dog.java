package com.javaroadmap.stage02.day04inheritance;

/** 知识点：子类。 */
public class Dog extends Animal {
    public Dog(String name) {
        super(name);
    }

    public void bark() {
        System.out.println(name + " 正在汪汪叫");
    }
}

