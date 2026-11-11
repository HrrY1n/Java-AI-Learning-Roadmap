package com.javaroadmap.stage06.lab.student;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 内存实现：与 Stage 05 的内存版逐行为一致（唯一学号检查 + 快照回滚模拟事务）。
 *
 * 零依赖路径：不需要任何数据库就能运行全部 JUnit 测试——这是课 2 的被测对象。
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
        // 内存版用快照回滚模拟事务语义：任何一条失败，整批恢复到调用前状态后把异常抛出。
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
