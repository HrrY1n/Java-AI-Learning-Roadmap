package com.javaroadmap.stage02.deepdives.polymorphism;

/**
 * 深化课 05 补充演示：字段不参与多态。
 *
 * 动态绑定只作用于方法；字段在编译期按引用的"静态类型"解析——
 * 子类的同名字段只是"遮蔽"（shadowing），父类字段仍然存在，不是覆盖。
 * 这也是"接口没有实例字段"的技术根源：字段没有多态，跨层级共享状态只能靠继承拿同一份。
 */
public class FieldShadowDemo {
    public static void main(String[] args) {
        Animal animal = new Dog("旺财"); // 静态类型 Animal，实际类型 Dog
        Dog dog = new Dog("旺财");

        // 字段：编译期看 Animal，读到父类版本。
        System.out.println(animal.label);
        // 方法：运行期看实际类型 Dog，执行子类版本（动态绑定）。
        animal.speak();
        // 只有换成 Dog 引用，才读得到子类版本的 label。
        System.out.println(dog.label);
    }
}
