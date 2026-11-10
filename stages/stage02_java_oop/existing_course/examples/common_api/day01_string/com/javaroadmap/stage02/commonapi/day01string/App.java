package com.javaroadmap.stage02.commonapi.day01string;

/**
 * 知识点：String 不可变性、常量池与 == vs equals。
 *
 * Observe：预测 s1 == s2、s1 == a、a == b 以及 text.toUpperCase() 后 text 本身的输出。
 */
public class App {
    public static void main(String[] args) {
        String text = "I love Java";

        System.out.println("长度：" + text.length());
        System.out.println("是否包含 Java：" + text.contains("Java"));
        // 不可变性：toUpperCase() 返回一个新字符串，原 text 并未被原地改成大写！
        System.out.println("转大写：" + text.toUpperCase());
        System.out.println("原 text 仍为：" + text);
        System.out.println("从第 2 个字符开始截取：" + text.substring(2));

        // 1) 字面量入字符串常量池：相同的字面量保证是同一个池对象（JLS §3.10.5，== 必为 true）。
        //    但工程上判相等仍然只用 equals——因为 new String(...) 的堆对象内容相同、引用不同，== 是 false。
        String s1 = "Java";
        String s2 = "Java";
        System.out.println("字面量 s1 == s2：" + (s1 == s2));

        // 2) new String(...) 必然在堆上创建全新对象：即使内容一模一样，== 也是 false。
        String a = new String("Java");
        String b = new String("Java");
        System.out.println("a == b（引用比较）：" + (a == b));
        System.out.println("内容是否相同：" + a.equals(b));
    }
}
