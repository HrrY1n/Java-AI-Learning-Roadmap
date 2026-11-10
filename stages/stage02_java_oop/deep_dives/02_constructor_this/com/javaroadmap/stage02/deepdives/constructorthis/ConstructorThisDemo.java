package com.javaroadmap.stage02.deepdives.constructorthis;

/**
 * 深化课 02：构造方法与 this——对象如何带着合法状态出生。
 *
 * Observe：预测四段输出与注释实验的报错位置，再运行核对。
 * Modify：把单参构造器里的 this(name, 18) 挪到 println 后面，观察 javac 限制；
 *         取消第三段注释验证构造期拦截异常。
 */
public class ConstructorThisDemo {
    public static void main(String[] args) {
        // 第一段：new 执行初始化顺序后返回实例引用。
        Person p = new Person("小明", 18);
        p.show();

        // 第二段：this 指向当前调用者，且可 return this 实现链式调用。
        p.rename("明仔").show();

        // 第三段：单参重载构造器委托 this(name, 18)，共用主构造器校验规则。
        Person freshman = new Person("小红");
        freshman.show();

        // 第四段：构造器把关——非法年龄直接被拒绝，坏对象无法出生。
        // 取消下面注释运行：构造器在 new 一行立即抛出 IllegalArgumentException。
        // Person bad = new Person("老王", -5);
        // bad.show();
    }
}

class Person {
    String name;
    int age;

    // 主构造器：参数校验集中在这一处，避免在重载构造器里复制校验代码。
    Person(String name, int age) {
        if (age < 0) {
            throw new IllegalArgumentException("年龄不能为负数：" + age);
        }
        this.name = name;
        this.age = age;
    }

    // 委托构造器：this(...) 必须是第一条语句，复用双参构造器的校验与赋值。
    Person(String name) {
        this(name, 18);
    }

    // return this 让调用者可以写出 p.rename("...").show() 这样的链式调用。
    Person rename(String name) {
        this.name = name;
        return this;
    }

    void show() {
        System.out.println("姓名：" + this.name + "，年龄：" + this.age);
    }
}
