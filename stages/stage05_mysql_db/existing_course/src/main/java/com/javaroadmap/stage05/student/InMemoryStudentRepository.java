package com.javaroadmap.stage05.student;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 第 1 阶段：内存中的学生仓库（与 Stage 03 一脉相承，新增唯一学号检查与事务性批量回滚模拟）。
 */
public class InMemoryStudentRepository implements StudentRepository {
    private final Map<Integer, Student> store = new LinkedHashMap<>();

    @Override
    public void save(Student student) {
        for (Student existing : store.values()) {
            if (existing.getId() != student.getId()
                    && existing.getStudentNo().equals(student.getStudentNo())) {
                throw new IllegalArgumentException("学号已存在：" + student.getStudentNo());
            }
        }
        store.put(student.getId(), student);
    }

    @Override
    public Student findById(int id) {
        return store.get(id);
    }

    @Override
    public List<Student> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public boolean updateScore(int id, int newScore) {
        Student target = store.get(id);
        if (target == null) return false;
        target.setScore(newScore);
        return true;
    }

    @Override
    public boolean deleteById(int id) {
        return store.remove(id) != null;
    }

    @Override
    public void saveBatchAtomically(List<Student> batch) {
        // 内存版快照回滚模拟（真实并发与持久化靠阶段 3-6 MySQL 事务引擎）
        Map<Integer, Student> snapshot = new LinkedHashMap<>(store);
        try {
            for (Student s : batch) {
                save(s);
            }
        } catch (RuntimeException e) {
            store.clear();
            store.putAll(snapshot);
            throw e;
        }
    }
}
