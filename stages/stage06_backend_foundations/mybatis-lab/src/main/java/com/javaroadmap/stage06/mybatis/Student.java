package com.javaroadmap.stage06.mybatis;

/**
 * 学生行对象：与 students 表的列一一对应（id, student_no, name, score, email）。
 * 与 StudentRepository 契约里的 Student 同形状——本模块是"存储层的另一种实现"，
 * 因此行对象保持同形状，接口层面（课 5 分层）可无缝替换。
 */
public class Student {
    private Integer id;          // Integer：插入前为 null，数据库回填自增 id 后有值——课 7 正文的关键细节
    private String studentNo;
    private String name;
    private int score;
    private String email;

    public Student() {
        // MyBatis 结果映射要求无参构造器
    }

    public Student(Integer id, String studentNo, String name, int score, String email) {
        this.id = id;
        this.studentNo = studentNo;
        this.name = name;
        this.score = score;
        this.email = email;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getStudentNo() { return studentNo; }
    public void setStudentNo(String studentNo) { this.studentNo = studentNo; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
