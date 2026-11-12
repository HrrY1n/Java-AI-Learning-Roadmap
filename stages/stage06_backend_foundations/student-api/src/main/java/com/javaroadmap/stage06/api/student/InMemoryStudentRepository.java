package com.javaroadmap.stage06.api.student;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 内存实现——Spring 用 @Component 把它注册为 Bean（单一实现，课 4 正文讲构造器注入如何选中它）。
 * 零数据库依赖：应用默认以本实现启动，MySQL/MyBatis 版后续以同一接口接入。
 */
@org.springframework.stereotype.Component
public class InMemoryStudentRepository implements StudentRepository {
    private final Map<Integer, Student> store = new LinkedHashMap<>();

    @Override
    public void save(Student student) {
        for (Student existing : store.values()) {
            if (existing.getId() != student.getId()
                    && existing.getStudentNo().equals(student.getStudentNo())) {
                throw new DuplicateStudentNoException(student.getStudentNo());
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

    /** 清空仓库。仅供 @SpringBootTest 测试在每条用例前重置共享单例状态；生产代码不得调用。 */
    public void clear() {
        store.clear();
    }

    @Override
    public void saveBatchAtomically(List<Student> batch) {
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
