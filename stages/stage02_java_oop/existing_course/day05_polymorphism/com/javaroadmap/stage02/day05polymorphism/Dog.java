package com.javaroadmap.stage02.day05polymorphism;

/** 知识点：方法重写。 */
public class Dog extends Animal {
    public Dog(String name) {
        super(name);
    }

    @Override
    public void eat() {
        System.out.println(name + " 正在吃骨头");
    }

    public void bark() {
        System.out.println(name + " 汪汪叫");
    }
}

