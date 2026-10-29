package com.javaroadmap.stage02.deepdives.refstate;

/**
 * 深化课 01：引用与对象状态——两个变量"是同一个对象"意味着什么。
 *
 * 场景：Stage 01 的数组已经演示过"赋值只复制地址"。对象把这件事放大：
 * 改一个变量"看见"的状态，另一个变量立刻同步——因为它们本来就是同一个对象。
 *
 * 心智模型：对象本体住在一块内存里；变量里存的只是门牌号。
 *   Student a = ...; Student b = a;   // 复制门牌号，不是复制学生
 *   == 比较的是"是不是同一扇门"，equals 比较的是"屋里住的人是否相同"。
 *
 * Observe：先预测三段输出，再运行核对。
 */
public class ReferenceStateDemo {
    public static void main(String[] args) {
        // 第一段：两个变量，一个对象。
        Student a = new Student("小明", 88);
        Student b = a;                      // 门牌号复制了一份
        b.score = 95;                       // 顺着门牌号改了屋里的人
        System.out.println("1) a.score = " + a.score);          // 95——a 看的是同一个对象
        System.out.println("2) a == b：" + (a == b));            // true：同一扇门

        // 第二段：两个变量，两个对象，内容相同。
        Student c = new Student("小明", 88);
        System.out.println("3) a == c：" + (a == c));            // false：不同对象
        System.out.println("4) 字段内容相同吗：" + sameContent(a, c));

        // 第三段：把 b 指向别的对象，a 不受影响（呼应 Stage 01 参数传递 case3）。
        b = new Student("小红", 60);
        System.out.println("5) b.score = " + b.score + "，a.score = " + a.score);
    }

    // 手写比较两个学生的内容；String 的比较用 equals（day01_string 示例已演示 == 的问题）。
    static boolean sameContent(Student x, Student y) {
        return x.name.equals(y.name) && x.score == y.score;
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
