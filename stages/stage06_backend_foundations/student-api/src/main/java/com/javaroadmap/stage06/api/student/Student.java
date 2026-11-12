package com.javaroadmap.stage06.api.student;

import java.util.Objects;

/**
 * 学生业务对象——Stage 05 升级版契约的延续（5 字段 + 构造器/setScore 校验）。
 *
 * 它与 web 包里的 StudentDto 的分工：Student 是"业务规则所在的对象"（构造器即校验），
 * DTO 是"HTTP 世界的传输形状"——两者不混用，课 5 正文会讲为什么值得多写一个类。
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

    public void setEmail(String email) {
        // 与构造器同一条规则：空值统一回落为 "-"，保持"邮箱可以为空但不会是 null"的领域约束
        this.email = (email == null || email.trim().isEmpty()) ? "-" : email.trim();
    }

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
