package com.javaroadmap.stage02.day06interfaceabstract;

/** 知识点：抽象类。 */
public abstract class Bird implements Flyable {
    protected String name;

    public Bird(String name) {
        this.name = name;
    }

    public abstract void eat();
}

class Sparrow extends Bird {
    public Sparrow(String name) {
        super(name);
    }

    @Override
    public void eat() {
        System.out.println(name + " 正在吃谷子");
    }

    @Override
    public void fly() {
        System.out.println(name + " 正在低空飞行");
    }
}

