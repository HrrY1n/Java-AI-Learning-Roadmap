package com.javaroadmap.stage02.deepdives.constructorthis;

/**
 * 深化课 02：构造方法与 this——对象如何带着合法状态出生。
 *
 * 场景：day02 的 Person 已有构造器。本课回答：没有构造器会怎样？
 * this 到底指什么？为什么字段名和参数名可以相同？
 *
 * 心智模型：new 一行做了三件事——按类定义分配内存、把字段设为默认值、
 * 调用匹配的构造器。this 就是"当前正在被初始化的这 个对象"。
 * 构造器的本职是"把关"：不允许 age = -5 的对象存在。
 *
 * Observe：先预测每段输出与编译结果，再运行。
 */
public class ConstructorThisDemo {
    public static void main(String[] args) {
        // 第一段：new 做三件事；字段先有默认值，构造器再覆盖。
        Person p = new Person("小明", 18);
        p.show();

        // 第二段：this 在方法里指"调用它的那个对象"——两个对象互不串线。
        p.rename("明仔");
        p.show();

        // 第三段：构造器把关——非法年龄直接被拒绝，坏对象无法出生。
        // 取消下面注释运行：构造器会抛出 IllegalArgumentException。
        // Person bad = new Person("老王", -5);
        // bad.show();
    }
}

class Person {
    String name;
    int age;

    // 参数名与字段名相同：this.name 是"这个对象的字段"，单独的 name 是参数。
    // 这正是 this 最常见的用途：在"重名遮蔽"下明确指路。
    Person(String name, int age) {
        if (age < 0) {
            throw new IllegalArgumentException("年龄不能为负数：" + age);
        }
        this.name = name;
        this.age = age;
    }

    // this.rename(...) 里的 this 在运行时绑定到调用者；没有它，方法不知道该改谁。
    void rename(String name) {
        this.name = name;
    }

    void show() {
        // 方法里没写 this 时，访问 name 等价于 this.name——编译器帮你补了。
        System.out.println("姓名：" + this.name + "，年龄：" + this.age);
    }
}
