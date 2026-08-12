package com.javaroadmap.stage02.student;

/** 学生实体类。 */
public class Student {
    private int id;
    private String name;
    private int score;

    public Student(int id, String name, int score) {
        this.id = id;
        this.name = name;
        setScore(score);
    }

    public int getId() {
        return id;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        if (score < 0 || score > 100) {
            System.out.println("分数范围应为 0 到 100，已设置为 0");
            this.score = 0;
            return;
        }
        this.score = score;
    }

    public void printInfo() {
        System.out.println("学号：" + id + "，姓名：" + name + "，分数：" + score);
    }
}

