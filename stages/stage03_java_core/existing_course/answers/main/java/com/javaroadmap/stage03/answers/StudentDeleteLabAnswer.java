package com.javaroadmap.stage03.answers;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

/**
 * 练习"删除学生"参考答案：三种删除结果互不重叠，全部不抛异常。
 *
 * 注意 deleteById 里用**下标循环**而不是 for-each 删除：
 * for-each 中途 remove 会触发 ConcurrentModificationException（预测题 S03A6）。
 */
public class StudentDeleteLabAnswer {

    /** 练习用的最小学生模型。 */
    static class Student {
        final int id;
        final String name;
        int score;

        Student(int id, String name, int score) {
            this.id = id;
            this.name = name;
            this.score = score;
        }

        String label() {
            return id + ":" + name + "/" + score;
        }
    }

    static final List<Student> students = new ArrayList<Student>();

    public static void main(String[] args) {
        students.add(new Student(1, "张三", 88));
        students.add(new Student(2, "小红", 95));
        students.add(new Student(3, "小刚", 55));

        Scanner scanner = new Scanner(System.in);
        while (true) {
            System.out.println("1=删除 2=名单 0=退出");
            String choice = scanner.next();
            if (choice.equals("1")) {
                deleteById(scanner.nextInt());
            } else if (choice.equals("2")) {
                printStudents();
            } else if (choice.equals("0")) {
                System.out.println("程序结束。");
                break;
            } else {
                System.out.println("没有这个选项。");
            }
        }
        scanner.close();
    }

    /** 返回是否真的删除了；消息打印集中在入口语义层。 */
    static boolean deleteById(int id) {
        if (id <= 0) {
            System.out.println("id 非法：" + id);
            return false;
        }
        for (int i = 0; i < students.size(); i++) {
            if (students.get(i).id == id) {
                students.remove(i);
                System.out.println("已删除：" + id);
                return true;
            }
        }
        System.out.println("学生不存在：" + id);
        return false;
    }

    static void printStudents() {
        StringBuilder text = new StringBuilder("[");
        for (int i = 0; i < students.size(); i++) {
            if (i > 0) {
                text.append(", ");
            }
            text.append(students.get(i).label());
        }
        text.append("]");
        System.out.println("学生名单：" + text);
    }
}
