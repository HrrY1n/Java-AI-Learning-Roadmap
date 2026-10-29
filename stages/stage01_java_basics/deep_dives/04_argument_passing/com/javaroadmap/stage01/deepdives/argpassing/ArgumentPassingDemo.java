package com.javaroadmap.stage01.deepdives.argpassing;

/**
 * 深化课 04：方法参数传递——Java 只有值传递。
 *
 * 场景：day06 的方法接收参数。一个流传极广的说法是"传基本类型是值传递，
 * 传对象是引用传递"。本课用三个递进实验证明：两种情况复制的都是"值"，
 * 区别只在于这个值本身是什么。
 *
 * 心智模型：调用方法时，JVM 把实参"复印一份"给形参。
 *   - 基本类型：复印的是数值本身（10 复印成 10）；
 *   - 引用类型：复印的是"地址"这个数值（两份地址指向同一个对象）。
 * 所以：形参永远影响不到"调用方变量存的什么"，但两份相同地址能摸到同一个对象。
 *
 * Observe：先预测 case1/case3 里调用方变量是否改变，再运行验证。
 */
public class ArgumentPassingDemo {
    public static void main(String[] args) {
        // case1：基本类型——形参拿到的是副本，改形参不影响外面。
        int number = 10;
        tryChange(number);
        System.out.println("case1 调用后 number = " + number);      // 仍然是 10

        // case2：数组——方法内改"元素"，外面看得见。
        // 这不是引用传递：方法改的是两份地址共同指向的那段格子，没有改变调用方变量本身。
        int[] scores = {90, 85};
        changeElement(scores);
        System.out.println("case2 调用后 scores[0] = " + scores[0]); // 变成 0

        // case3：决定性实验——在方法里给形参整个换一个新数组。
        // 如果 Java 是"引用传递"，这一步应该改变调用方的 scores；实际不会。
        int[] scores2 = {90, 85};
        reassignArray(scores2);
        System.out.println("case3 调用后 scores2[0] = " + scores2[0]); // 仍是 90
    }

    static void tryChange(int value) {
        value = 999;                    // 只改了自己的副本
    }

    static void changeElement(int[] arr) {
        arr[0] = 0;                     // 通过复制来的地址，改到了共享的那个数组
    }

    static void reassignArray(int[] arr) {
        arr = new int[]{7, 7};          // 只是把"本地那份地址复印件"换了个指向
        arr[0] = 0;                     // 于是这句改的是新数组，与调用方无关
    }
}
