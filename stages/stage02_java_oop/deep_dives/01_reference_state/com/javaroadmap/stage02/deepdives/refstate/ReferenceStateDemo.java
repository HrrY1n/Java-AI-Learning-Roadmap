package com.javaroadmap.stage02.deepdives.refstate;

import java.util.Objects;

/**
 * 深化课 01：引用与对象状态——两个变量"是同一个对象"意味着什么。
 *
 * Observe：先预测四段输出，重点对照方法传参时"改字段" vs "重赋形参"的行为差异。
 */
public class ReferenceStateDemo {
    public static void main(String[] args) {
        // 第一段：两个变量，一个对象。
        Student a = new Student("小明", 88);
        Student b = a;                      // 复制的是对象引用（同一扇门），不是复制学生
        b.score = 95;                       // 顺着引用改了同一个对象的状态
        System.out.println("1) a.score = " + a.score);          // 95
        System.out.println("2) a == b：" + (a == b));            // true：同一对象

        // 第二段：两个变量，两个对象，内容相同。
        Student c = new Student("小明", 95);
        System.out.println("3) a == c：" + (a == c));            // false：不同对象
        System.out.println("4) 字段内容相同吗：" + sameContent(a, c)); // true

        // 第三段：把 b 指向别的对象，a 不受影响（改变的是变量持有的引用本身）。
        b = new Student("小红", 60);
        System.out.println("5) b.score = " + b.score + "，a.score = " + a.score);

        // 第四段：方法传参的值传递本质——传的是"引用的副本"：
        // 顺着副本能改原对象字段（score 变 99），但把形参重新 new（换门牌）绝不会改变外面的 a。
        mutateAndReassign(a);
        System.out.println("6) 传参改字段后 a.score = " + a.score + "，姓名仍是 = " + a.name);
    }

    static void mutateAndReassign(Student target) {
        target.score = 99;                  // 改了调用方同一个对象的字段
        target = new Student("路人", 0);    // 只换了局部变量 target 指向的新对象，不影响实参 a
        target.score = 1;
    }

    // 用 Objects.equals(x.name, y.name) 代替 x.name.equals(...)，防止 name 为 null 时触发 NPE。
    static boolean sameContent(Student x, Student y) {
        if (x == y) return true;
        if (x == null || y == null) return false;
        return Objects.equals(x.name, y.name) && x.score == y.score;
    }
}

class Student {
    String name;
    int score;

    Student(String name, int score) {
        this.name = name;
        this.score = score;
    }
}
