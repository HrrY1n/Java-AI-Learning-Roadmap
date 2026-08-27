package com.javaroadmap.stage03.lambdastream.day03streamcollect;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/** 知识点：Stream 的 collect。 */
public class App {
    public static void main(String[] args) {
        List<String> names = new ArrayList<String>();
        names.add("小明");
        names.add("小红");
        names.add("张三");
        names.add("小刚");

        List<String> result = names.stream()
                .filter(name -> name.startsWith("小"))
                .collect(Collectors.toList());

        System.out.println("原列表：" + names);
        System.out.println("筛选后的新列表：" + result);
    }
}

