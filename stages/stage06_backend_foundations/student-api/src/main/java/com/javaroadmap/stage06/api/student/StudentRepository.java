package com.javaroadmap.stage06.api.student;

import java.util.List;

/**
 * 存储契约——与 Stage 05 / maven-lab 逐签名一致的 6 方法接口。
 *
 * Repository 层只谈 Student（业务对象），不认识 DTO 与 HTTP：
 * 这是"Controller → Service → Repository"分层能各自替换的前提（课 5 正文）。
 */
public interface StudentRepository {
    void save(Student student);

    Student findById(int id);

    List<Student> findAll();

    boolean updateScore(int id, int newScore);

    boolean deleteById(int id);

    void saveBatchAtomically(List<Student> batch);
}
