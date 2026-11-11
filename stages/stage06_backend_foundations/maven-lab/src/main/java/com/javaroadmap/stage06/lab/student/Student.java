package com.javaroadmap.stage06.lab.student;

import java.util.Objects;

/**
 * 学生实体——Stage 05 升级版契约（5 字段 + 构造器校验）的演练场副本。
 *
 * 来源说明：与 stages/stage05_mysql_db 的 Student 同一份契约（id/studentNo/name/score/email，
 * 构造器与 setScore 携带业务校验），本副本只保留 Stage 06 演练用到的成员——
 * 这是"连续项目在新工程里的重演"，不是两套互不相干的实现。
 */
public class Student {
    private final int id;
    private final String studentNo;
    private final String name;
    private int score;
    private String email;

    public Student(int id, String studentNo, String name, int score, String email) {
        if (id <= 0) {
            throw new IllegalArgumentException("学生 id 必须大于 0：" + id);
        }
        if (studentNo == null || studentNo.trim().isEmpty()) {
            throw new IllegalArgumentException("学号不能为空");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("姓名不能为空");
        }
        if (score < 0 || score > 100) {
            throw new IllegalArgumentException("分数必须在 0~100 之间：" + score);
        }
        this.id = id;
        this.studentNo = studentNo.trim();
        this.name = name.trim();
        this.score = score;
        this.email = (email == null || email.trim().isEmpty()) ? "-" : email.trim();
    }

    public int getId() {
        return id;
    }

    public String getStudentNo() {
        return studentNo;
    }

    public String getName() {
        return name;
    }

    public int getScore() {
        return score;
    }

    public String getEmail() {
        return email;
    }

    public void setScore(int score) {
        if (score < 0 || score > 100) {
            throw new IllegalArgumentException("分数必须在 0~100 之间：" + score);
        }
        this.score = score;
    }

    /** 业务身份以 id 判等：同一个 id 就是同一个学生，与内存字段无关。 */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Student)) return false;
        return id == ((Student) o).id;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
