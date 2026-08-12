package com.javaroadmap.stage02.student;

/** 学生管理系统入口。 */
public class StudentManagementApp {
    public static void main(String[] args) {
        StudentService service = new StudentService();

        service.addStudent(new Student(1, "小明", 88));
        service.addStudent(new Student(2, "小红", 95));
        service.addStudent(new Student(3, "小刚", 76));

        System.out.println("=== 学生列表 ===");
        service.printAllStudents();

        System.out.println("平均分：" + service.calculateAverageScore());

        Student student = service.findById(2);
        if (student != null) {
            System.out.println("找到学号为 2 的学生：");
            student.printInfo();
        }
    }
}

