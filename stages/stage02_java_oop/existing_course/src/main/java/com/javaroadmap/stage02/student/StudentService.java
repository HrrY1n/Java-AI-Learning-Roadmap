package com.javaroadmap.stage02.student;

/** 学生业务类。 */
public class StudentService {
    private Student[] students = new Student[10];
    private int size = 0;

    public void addStudent(Student student) {
        if (size >= students.length) {
            System.out.println("学生数组已满，暂时不能继续添加。");
            return;
        }
        students[size] = student;
        size++;
    }

    public void printAllStudents() {
        if (size == 0) {
            System.out.println("暂无学生数据。");
            return;
        }

        for (int i = 0; i < size; i++) {
            students[i].printInfo();
        }
    }

    public Student findById(int id) {
        for (int i = 0; i < size; i++) {
            if (students[i].getId() == id) {
                return students[i];
            }
        }
        return null;
    }

    public double calculateAverageScore() {
        if (size == 0) {
            return 0;
        }

        int total = 0;
        for (int i = 0; i < size; i++) {
            total = total + students[i].getScore();
        }
        return total * 1.0 / size;
    }
}

