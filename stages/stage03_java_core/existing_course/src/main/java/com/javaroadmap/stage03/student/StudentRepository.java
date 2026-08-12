package com.javaroadmap.stage03.student;

import java.util.List;

/** 学生数据仓库接口。 */
public interface StudentRepository {
    void save(Student student);

    Student findById(int id);

    List<Student> findAll();
}

