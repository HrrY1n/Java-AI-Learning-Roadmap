package com.javaroadmap.stage02.deepdives.inheritance;

/**
 * 深化课 04：继承与组合——"是什么"才继承，"有一个"就组合。
 *
 * 场景：day04 用 Dog extends Animal 演示了语法。本课回答更重要的判断题：
 * 什么时候该用继承？什么时候组合更对？以及为什么"为了复用代码而继承"是陷阱。
 *
 * 心智模型：
 *   继承表达"是一个"（Dog 是一个 Animal）：子类可以安全地出现在任何需要父类的地方。
 *   组合表达"有一个"（Car 有一个 Engine）：把另一个对象当字段用，只暴露需要的功能。
 * 判据：子类必须满足父类的全部行为约定（里氏替换的朴素版）。
 *
 * Observe：先预测每段输出，再运行；重点预测 Square 的面积。
 */
public class InheritanceCompositionDemo {
    public static void main(String[] args) {
        // 继承用对了的样子：Dog 满足 Animal 的一切约定，替换父类毫无风险。
        Animal animal = new Dog("旺财");
        animal.describe();
        animal.act();

        // 继承用错的经典反例：数学上正方形"是一个"长方形，但行为约定被破坏。
        Rectangle rect = new Square(5);
        rect.setWidth(4);              // 改宽之后，正方形的"高"也被改了
        System.out.println("1) rect.width=" + rect.width + " rect.height=" + rect.height);
        System.out.println("2) 预期面积 4×5=20，实际：" + rect.area());

        // 同样的"车辆"需求，组合的写法：行为来自内部对象，不背父类包袱。
        Car car = new Car(new Engine());
        car.drive();
    }
}

class Animal {
    String name;

    Animal(String name) {
        this.name = name;
    }

    void describe() {
        System.out.print(name + " 是一只动物，");
    }

    void act() {
        System.out.println("它在活动");
    }
}

class Dog extends Animal {
    Dog(String name) {
        super(name);
    }

    @Override
    void act() {
        System.out.println("它在追球");
    }
}

class Rectangle {
    int width;
    int height;

    Rectangle(int width, int height) {
        this.width = width;
        this.height = height;
    }

    int area() {
        return width * height;
    }

    void setWidth(int width) {
        this.width = width;
    }
}

// 反面教材：为了"省一个字段"继承 Rectangle，却破坏了"改宽不改高"的隐含约定。
class Square extends Rectangle {
    Square(int side) {
        super(side, side);
    }

    @Override
    void setWidth(int width) {
        this.width = width;
        this.height = width;      // 正方形的自我修复，恰恰证明它不适合被当作 Rectangle 用
    }
}

class Engine {
    String start() {
        return "引擎点火";
    }
}

class Car {
    private Engine engine;        // 组合：车"有一个"引擎，不是"是一个"引擎

    Car(Engine engine) {
        this.engine = engine;
    }

    void drive() {
        System.out.println("3) " + engine.start() + "，车辆出发");
    }
}
