package com.javaroadmap.stage03.student;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** 内存版学生仓库。 */
public class InMemoryStudentRepository implements StudentRepository {
    private Map<Integer, Student> studentMap = new HashMap<Integer, Student>();

    @Override
    public void save(Student student) {
        studentMap.put(student.getId(), student);
    }

    @Override
    public Student findById(int id) {
        return studentMap.get(id);
    }

    @Override
    public List<Student> findAll() {
        return new ArrayList<Student>(studentMap.values());
    }
}

