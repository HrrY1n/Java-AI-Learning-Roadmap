package com.javaroadmap.stage02.day05polymorphism;

/** 知识点：多态。 */
public class App {
    public static void main(String[] args) {
        Animal dog = new Dog("旺财");
        Animal cat = new Cat("咪咪");

        dog.eat();
        cat.eat();

        feed(dog);
        feed(cat);
    }

    public static void feed(Animal animal) {
        System.out.println("准备喂食");
        animal.eat();
    }
}

