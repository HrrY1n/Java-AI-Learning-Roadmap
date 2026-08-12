package com.javaroadmap.stage03.student;

import com.javaroadmap.stage03.common.Result;

import java.nio.file.Paths;
import java.util.List;

/** 学生管理系统入口。 */
public class StudentManagementApp {
    public static void main(String[] args) {
        System.out.println("=== 内存版学生管理 ===");
        StudentService memoryService = new StudentService(new InMemoryStudentRepository());
        runDemo(memoryService);

        System.out.println();
        System.out.println("=== 文件版学生管理 ===");
        StudentRepository fileRepository = new FileStudentRepository(Paths.get("data", "students.txt"));
        StudentService fileService = new StudentService(fileRepository);
        runDemo(fileService);
    }

    private static void runDemo(StudentService service) {
        service.addStudent(new Student(1, "小明", 88)).print();
        service.addStudent(new Student(2, "小红", 95)).print();
        service.addStudent(new Student(3, "小刚", 55)).print();

        Result<Student> result = service.findById(2);
        result.print();

        System.out.println("全部学生：");
        printStudents(service.listAll());

        System.out.println("及格学生：");
        printStudents(service.listPassedStudents());

        System.out.println("平均分：" + service.calculateAverageScore());
        System.out.println("不重复姓名：" + service.collectStudentNames());
    }

    private static void printStudents(List<Student> students) {
        for (Student student : students) {
            System.out.println(student);
        }
    }
}

