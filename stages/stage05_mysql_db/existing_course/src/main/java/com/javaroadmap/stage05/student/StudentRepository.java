package com.javaroadmap.stage05.student;

import java.util.List;

/**
 * 统一存储接口：阶段 1（内存）、阶段 2（文件）、阶段 3-6（MySQL JDBC）共用同一份契约。
 */
public interface StudentRepository {
    void save(Student student);
    Student findById(int id);
    List<Student> findAll();
    boolean updateScore(int id, int newScore);
    boolean deleteById(int id);
    void saveBatchAtomically(List<Student> batch);
}
