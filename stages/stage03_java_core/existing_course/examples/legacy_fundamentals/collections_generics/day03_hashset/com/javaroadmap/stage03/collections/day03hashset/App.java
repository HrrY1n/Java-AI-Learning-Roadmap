package com.javaroadmap.stage03.collections.day03hashset;

import java.util.HashSet;

/** 知识点：HashSet——去重不是魔法：add 先用 hashCode 决定进哪个桶，桶内再用 equals 找相等元素。 */
public class App {
    public static void main(String[] args) {
        HashSet<String> names = new HashSet<String>();

        // 第一个小明：hashCode 定桶，桶内没有相等元素 -> 新增。
        names.add("小明");
        names.add("小红");
        // 第二个小明：同一个桶里 equals 命中已有元素 -> 直接丢弃，size 不变。
        // 注意：自定义类不重写 hashCode/equals 时，每个 new 出来的对象都是"不同元素"（见 equals/hashCode 课）。
        names.add("小明");

        System.out.println("集合大小：" + names.size());
        System.out.println("是否包含小明：" + names.contains("小明"));

        for (String name : names) {
            System.out.println(name);
        }
    }
}

