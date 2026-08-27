package com.javaroadmap.stage03.collections.day03hashset;

import java.util.HashSet;

/** 知识点：HashSet。 */
public class App {
    public static void main(String[] args) {
        HashSet<String> names = new HashSet<String>();

        names.add("小明");
        names.add("小红");
        names.add("小明");

        System.out.println("集合大小：" + names.size());
        System.out.println("是否包含小明：" + names.contains("小明"));

        for (String name : names) {
            System.out.println(name);
        }
    }
}

