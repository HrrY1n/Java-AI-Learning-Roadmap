package com.javaroadmap.stage02.answers;

/** OOP 学生管理练习参考答案。 */
public class StudentManagementAnswer {
    public static void main(String[] args) {
        AnswerStudent student = new AnswerStudent(1, "小明", 90, "xiaoming@example.com");
        student.printInfo();
        student.setScore(95);
        student.printInfo();
    }
}

class AnswerStudent {
    private int id;
    private String name;
    private int score;
    private String email;

    public AnswerStudent(int id, String name, int score, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
        setScore(score);
    }

    public void setScore(int score) {
        if (score < 0 || score > 100) {
            System.out.println("分数范围错误。");
            return;
        }
        this.score = score;
    }

    public void printInfo() {
        System.out.println(id + " " + name + " " + score + " " + email);
    }
}

