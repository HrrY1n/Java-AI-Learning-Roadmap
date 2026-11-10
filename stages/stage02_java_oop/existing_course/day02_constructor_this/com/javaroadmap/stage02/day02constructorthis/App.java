package com.javaroadmap.stage02.day02constructorthis;

/**
 * 知识点：构造方法、构造器重载与 this 的几种高频用法。
 *
 * Observe：预测 p1、p2（调用单参构造器委托）以及 p2.growUp().show() 的输出。
 * Modify：尝试新增一行 new Person(); 观察为什么编译报错——一旦自建构造器，默认构造器消失。
 */
public class App {
    public static void main(String[] args) {
        Person person = new Person("小明", 18);
        person.show();

        // 调用单参重载构造器（内部用 this(name, 18) 委托给双参构造器）。
        Person freshman = new Person("小红");
        freshman.growUp().show();
    }
}
