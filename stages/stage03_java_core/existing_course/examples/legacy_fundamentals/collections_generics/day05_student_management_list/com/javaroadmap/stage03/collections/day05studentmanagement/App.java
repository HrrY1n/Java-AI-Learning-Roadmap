package com.javaroadmap.stage03.collections.day05studentmanagement;

import java.util.ArrayList;

/** 知识点：使用 ArrayList 管理学生。 */
public class App {
    public static void main(String[] args) {
        ArrayList<Student> students = new ArrayList<Student>();

        students.add(new Student("小明", 90));
        students.add(new Student("小红", 96));
        students.add(new Student("小刚", 82));

        for (int i = 0; i < students.size(); i++) {
            students.get(i).show();
        }
    }
}

