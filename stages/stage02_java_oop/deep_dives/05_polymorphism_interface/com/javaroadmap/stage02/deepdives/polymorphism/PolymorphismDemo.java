package com.javaroadmap.stage02.deepdives.polymorphism;

/**
 * 深化课 05：多态与接口——面向"约定"写代码。
 *
 * 场景：day05 的 Animal a = new Dog(...) 与 day06 的 Flyable 已经分别见过。
 * 本课把它们接起来回答：多态到底"多"在哪？接口和抽象类怎么选？
 *
 * 心智模型：
 *   同一句 animal.act()，JVM 看"门牌号指向的对象实际是什么"，调用它的真实版本——
 *   这就是动态绑定。调用方只依赖"动物会活动"这条约定，不关心具体是谁。
 *   接口=纯约定（能飞）；抽象类=约定+部分公共实现（都有名字、都要吃饭）。
 *
 * Observe：先预测输出顺序，再运行；重点想"为什么 speakAll 不用改就能处理新动物"。
 */
public class PolymorphismDemo {
    public static void main(String[] args) {
        Animal[] zoo = { new Dog("旺财"), new Cat("咪咪") };

        // 一行代码处理三种动物：动态绑定在运行时各自找到真实的 speak 版本。
        speakAll(zoo);

        // 接口：Robot 不是动物，但"能自我介绍"——约定可以跨类实现。
        Introducible[] things = { new Dog("旺财"), new Robot("R2") };
        for (Introducible t : things) {
            t.introduce();
        }
    }

    // 只依赖 Animal 约定。明天加 Bird，这个方法一行都不用改——多态的核心收益。
    static void speakAll(Animal[] animals) {
        for (Animal a : animals) {
            a.speak();
        }
    }
}

abstract class Animal {
    String name;

    Animal(String name) {
        this.name = name;
    }

    // 抽象方法 = "子类必须回答这个问题"；抽象类自己不回答。
    abstract void speak();

    // 公共实现放抽象类：所有子类共享，不重复。
    String title() {
        return "[" + name + "]";
    }
}

class Dog extends Animal implements Introducible {
    Dog(String name) {
        super(name);
    }

    @Override
    void speak() {
        System.out.println(title() + " 汪");
    }

    @Override
    public void introduce() {
        System.out.println("我是狗，叫 " + name);
    }
}

class Cat extends Animal {
    Cat(String name) {
        super(name);
    }

    @Override
    void speak() {
        System.out.println(title() + " 喵");
    }
}

/** 接口：只声明"能做什么"，不带任何状态和实现。 */
interface Introducible {
    void introduce();
}

/** 一个类可以实现多个接口——继承只能有一个父类，接口组合能力更灵活。 */
class Robot implements Introducible {
    private String id;

    Robot(String id) {
        this.id = id;
    }

    @Override
    public void introduce() {
        System.out.println("机器人 " + id + " 上线");
    }
}

// Dog 同时是 Animal（继承）和 Introducible（实现）：上一行数组里它两种身份都能扮演。
