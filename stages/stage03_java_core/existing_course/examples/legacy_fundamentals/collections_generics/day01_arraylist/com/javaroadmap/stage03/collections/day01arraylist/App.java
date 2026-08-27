package com.javaroadmap.stage03.collections.day01arraylist;

import java.util.ArrayList;

/** 知识点：ArrayList。 */
public class App {
    public static void main(String[] args) {
        ArrayList<String> names = new ArrayList<String>();

        names.add("小明");
        names.add("小红");
        names.add("小刚");

        System.out.println("第一个名字：" + names.get(0));
        System.out.println("列表长度：" + names.size());

        for (int i = 0; i < names.size(); i++) {
            System.out.println("姓名：" + names.get(i));
        }
    }
}

