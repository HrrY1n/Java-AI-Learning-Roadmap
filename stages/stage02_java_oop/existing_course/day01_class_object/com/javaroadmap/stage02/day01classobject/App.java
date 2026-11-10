package com.javaroadmap.stage02.day01classobject;

/**
 * 知识点：类与对象——图纸与按图纸造出的多个独立实例。
 *
 * Observe：预测 s1 与 s2 各打印什么；修改 s2.age 后，s1.age 会不会跟着变？
 * Modify：去掉 s2.name 赋值保留默认初始化，运行看打印出什么（字段默认值 vs 局部变量无默认值）。
 */
public class App {
    public static void main(String[] args) {
        // 第一次 new：造出第一个学生对象，s1 持有它的引用。
        Student s1 = new Student();
        s1.name = "小明";
        s1.age = 18;

        // 第二次 new：同一张类图纸再造一个独立对象，拥有自己独立的一套字段状态。
        Student s2 = new Student();
        s2.name = "小红";
        s2.age = 20;

        s1.sayHello();
        s2.sayHello();

        // 修改 s2 不会影响 s1（各自拥有独立的内存字段，见深化课 s02-reference-state）。
        s2.age = 21;
        System.out.println("修改 s2 年龄后，s1 年龄仍为：" + s1.age);

        // 第三个对象未手动赋值：字段有默认值（String 默认 null，int 默认 0）。
        // 注意：局部引用变量若写成 Student s3 = null; 后调用 s3.sayHello() 会触发 NullPointerException。
        Student empty = new Student();
        System.out.println("未赋值字段默认值：name=" + empty.name + ", age=" + empty.age);
    }
}
