package com.javaroadmap.stage03.student;

import com.javaroadmap.stage03.common.Result;
import com.javaroadmap.stage03.exception.BusinessException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/** 学生业务类。 */
public class StudentService {
    private StudentRepository repository;

    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }

    public Result<Student> addStudent(Student student) {
        try {
            validateStudent(student);

            Student old = repository.findById(student.getId());
            if (old != null) {
                throw new BusinessException("学生 id 已存在：" + student.getId());
            }

            repository.save(student);
            return Result.success(student);
        } catch (BusinessException e) {
            return Result.fail(e.getMessage());
        }
    }

    public Result<Student> findById(int id) {
        Student student = repository.findById(id);
        if (student == null) {
            return Result.fail("学生不存在：" + id);
        }
        return Result.success(student);
    }

    public List<Student> listAll() {
        return repository.findAll();
    }

    public List<Student> listPassedStudents() {
        return repository.findAll()
                .stream()
                .filter(student -> student.getScore() >= 60)
                .collect(Collectors.toList());
    }

    public double calculateAverageScore() {
        List<Student> students = repository.findAll();
        if (students.isEmpty()) {
            return 0;
        }

        int total = students.stream()
                .mapToInt(Student::getScore)
                .sum();

        return total * 1.0 / students.size();
    }

    public Set<String> collectStudentNames() {
        Set<String> names = new HashSet<String>();
        for (Student student : repository.findAll()) {
            names.add(student.getName());
        }
        return names;
    }

    private void validateStudent(Student student) {
        if (student.getId() <= 0) {
            throw new BusinessException("学生 id 必须大于 0");
        }
        if (student.getName() == null || student.getName().trim().isEmpty()) {
            throw new BusinessException("学生姓名不能为空");
        }
        if (student.getScore() < 0 || student.getScore() > 100) {
            throw new BusinessException("分数必须在 0 到 100 之间");
        }
    }
}

