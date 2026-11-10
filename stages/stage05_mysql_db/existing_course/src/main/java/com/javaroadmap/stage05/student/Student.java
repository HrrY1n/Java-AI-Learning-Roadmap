package com.javaroadmap.stage05.student;

import java.util.Objects;

/**
 * 连续演进的学生实体：从内存/CSV 一直演进到 MySQL 映射，新增 studentNo 业务唯一学号。
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

    public int getId() { return id; }
    public String getStudentNo() { return studentNo; }
    public String getName() { return name; }
    public int getScore() { return score; }
    public String getEmail() { return email; }

    public void setScore(int score) {
        if (score < 0 || score > 100) {
            throw new IllegalArgumentException("分数必须在 0~100 之间：" + score);
        }
        this.score = score;
    }

    public String toCsvLine() {
        return id + "," + studentNo + "," + name + "," + score + "," + email;
    }

    public static Student fromCsvLine(String line) {
        String[] parts = line.split(",", -1);
        if (parts.length != 5) {
            throw new IllegalArgumentException("CSV 字段数不是 5：" + line);
        }
        return new Student(
                Integer.parseInt(parts[0].trim()),
                parts[1].trim(),
                parts[2].trim(),
                Integer.parseInt(parts[3].trim()),
                parts[4].trim()
        );
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Student)) return false;
        return id == ((Student) o).id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return id + ":" + studentNo + "/" + name + "/" + score + "/" + email;
    }
}
