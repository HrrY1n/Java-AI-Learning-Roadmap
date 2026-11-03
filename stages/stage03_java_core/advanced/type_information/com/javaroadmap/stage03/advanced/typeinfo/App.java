package com.javaroadmap.stage03.advanced.typeinfo;

import java.util.ArrayList;
import java.util.List;

/**
 * 运行时类型信息（RTTI）与反射入门。
 * 对应《On Java 8》第 19 章（类型信息）。
 *
 * Shape、Circle、Square 是同包的顶层类（一个文件可含多个非 public 顶层类），
 * 这样反射 Class.forName 才能用简单的类名找到它们。
 */
class Shape {
    double area() {
        return 0;
    }
}

class Circle extends Shape {
    final double r = 2;

    @Override
    double area() {
        return Math.PI * r * r;
    }
}

class Square extends Shape {
    @Override
    double area() {
        return 9;
    }
}

public class App {

    public static void main(String[] args) throws Exception {
        List<Shape> shapes = new ArrayList<>();
        shapes.add(new Circle());
        shapes.add(new Square());
        shapes.add(new Shape());

        for (Shape shape : shapes) {
            // getClass() 返回运行时的真实类型
            System.out.println(shape.getClass().getSimpleName() + " 面积：" + shape.area());
        }

        // instanceof 在向下转型前做安全检查
        if (shapes.get(0) instanceof Circle) {
            Circle circle = (Circle) shapes.get(0);
            System.out.println("圆的半径：" + circle.r);
        }

        // 反射：按名字加载类并创建实例（框架的底层机制）
        Class<?> loaded = Class.forName("com.javaroadmap.stage03.advanced.typeinfo.Square");
        Square square = (Square) loaded.getDeclaredConstructor().newInstance();
        System.out.println("反射创建的实例：" + square.getClass().getSimpleName());
        System.out.println("要点：多态靠虚方法分派，反射把“类型”本身当作数据来操作。");
    }
}
