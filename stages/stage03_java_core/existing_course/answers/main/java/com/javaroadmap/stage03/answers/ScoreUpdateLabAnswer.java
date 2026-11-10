package com.javaroadmap.stage03.answers;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

/**
 * 练习"修改分数"参考答案：三种失败消息精确不同，且校验只写在一处。
 *
 * 注意：无论 id 是否合法，"改分"总是先读完 id 与分数两行再校验，
 * 保证与输入流的行序对齐（否则坏 id 会把分数行当成下一轮菜单选项）。
 */
public class ScoreUpdateLabAnswer {

    static class Student {
        final int id;
        final String name;
        int score;

        Student(int id, String name, int score) {
            this.id = id;
            this.name = name;
            this.score = score;
        }
    }

    static final List<Student> students = new ArrayList<Student>();

    public static void main(String[] args) {
        students.add(new Student(1, "张三", 88));
        students.add(new Student(2, "小红", 95));
        students.add(new Student(3, "小刚", 55));

        Scanner scanner = new Scanner(System.in);
        while (true) {
            System.out.println("1=改分 2=及格名单 0=退出");
            String choice = scanner.next();
            if (choice.equals("1")) {
                int id = scanner.nextInt();
                int newScore = scanner.nextInt();
                updateScore(id, newScore);
            } else if (choice.equals("2")) {
                printPassed();
            } else if (choice.equals("0")) {
                System.out.println("程序结束。");
                break;
            } else {
                System.out.println("没有这个选项。");
            }
        }
        scanner.close();
    }

    /** 校验顺序：id 合法性 → 存在性 → 分数范围；每条失败消息都带上下文。 */
    static boolean updateScore(int id, int newScore) {
        if (id <= 0) {
            System.out.println("id 非法：" + id);
            return false;
        }
        Student target = findById(id);
        if (target == null) {
            System.out.println("学生不存在：" + id);
            return false;
        }
        if (newScore < 0 || newScore > 100) {
            System.out.println("分数必须在 0 到 100 之间：" + newScore);
            return false;
        }
        target.score = newScore;
        System.out.println("已更新：" + id + " 新分数：" + newScore);
        return true;
    }

    static Student findById(int id) {
        for (Student student : students) {
            if (student.id == id) {
                return student;
            }
        }
        return null;
    }

    static void printPassed() {
        StringBuilder text = new StringBuilder("[");
        boolean first = true;
        for (Student student : students) {
            if (student.score < 60) {
                continue;
            }
            if (!first) {
                text.append(", ");
            }
            text.append(student.name).append("/").append(student.score);
            first = false;
        }
        text.append("]");
        System.out.println("及格名单：" + text);
    }
}
