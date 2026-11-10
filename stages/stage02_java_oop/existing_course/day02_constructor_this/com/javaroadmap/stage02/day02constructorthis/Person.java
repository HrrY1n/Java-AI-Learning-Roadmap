package com.javaroadmap.stage02.day02constructorthis;

/**
 * 知识点：构造方法、构造器重载与 this(...) 委托。
 *
 * Observe：预测两个构造器各自输出的姓名与年龄；为什么注释掉两个构造器后才能 new Person()？
 * Modify：把 this.name = name 改成 name = name（字段仍保持默认值 null），观察"自我赋值"隐患。
 */
public class Person {
    String name;
    int age;

    // 构造器 1（主构造器）：完整参数，集中做状态初始化与校验。
    public Person(String name, int age) {
        if (age < 0) {
            throw new IllegalArgumentException("年龄不能为负：" + age);
        }
        this.name = name;
        this.age = age;
    }

    // 构造器 2（重载 + this 委托）：只传姓名时默认年龄 18，委托给主构造器，不重复写校验逻辑。
    // 注意：this(...) 必须是构造器第一条语句；且一旦手动写了构造器，编译器不再送默认无参构造器。
    public Person(String name) {
        this(name, 18);
    }

    // 链式返回当前对象引用（this 的又一常见用法）。
    public Person growUp() {
        this.age++;
        return this;
    }

    public void show() {
        System.out.println("姓名：" + name + "，年龄：" + age);
    }
}
