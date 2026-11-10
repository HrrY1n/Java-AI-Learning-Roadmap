package com.javaroadmap.stage05.student;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * 第 2 阶段：UTF-8 CSV 文件版仓库（完整支持增删改查与批处理回滚，暴露全量读写的扩展瓶颈）。
 */
public class FileStudentRepository implements StudentRepository {
    private final Path filePath;

    public FileStudentRepository(Path filePath) {
        this.filePath = filePath;
    }

    @Override
    public void save(Student student) {
        List<Student> list = findAll();
        for (Student existing : list) {
            if (existing.getId() != student.getId()
                    && existing.getStudentNo().equals(student.getStudentNo())) {
                throw new IllegalArgumentException("学号已存在：" + student.getStudentNo());
            }
        }
        boolean replaced = false;
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).getId() == student.getId()) {
                list.set(i, student);
                replaced = true;
                break;
            }
        }
        if (!replaced) {
            list.add(student);
        }
        writeAll(list);
    }

    @Override
    public Student findById(int id) {
        for (Student s : findAll()) {
            if (s.getId() == id) return s;
        }
        return null;
    }

    @Override
    public List<Student> findAll() {
        if (!Files.exists(filePath)) return new ArrayList<>();
        try {
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);
            List<Student> result = new ArrayList<>();
            for (String line : lines) {
                if (!line.trim().isEmpty()) {
                    result.add(Student.fromCsvLine(line));
                }
            }
            return result;
        } catch (IOException e) {
            throw new IllegalStateException("读取学生文件失败：" + filePath, e);
        }
    }

    @Override
    public boolean updateScore(int id, int newScore) {
        List<Student> list = findAll();
        for (Student s : list) {
            if (s.getId() == id) {
                s.setScore(newScore);
                writeAll(list);
                return true;
            }
        }
        return false;
    }

    @Override
    public boolean deleteById(int id) {
        List<Student> list = findAll();
        boolean removed = list.removeIf(s -> s.getId() == id);
        if (removed) {
            writeAll(list);
        }
        return removed;
    }

    @Override
    public void saveBatchAtomically(List<Student> batch) {
        List<Student> original = findAll();
        try {
            for (Student s : batch) {
                save(s);
            }
        } catch (RuntimeException e) {
            writeAll(original);
            throw e;
        }
    }

    private void writeAll(List<Student> list) {
        try {
            if (filePath.getParent() != null) {
                Files.createDirectories(filePath.getParent());
            }
            List<String> lines = new ArrayList<>();
            for (Student s : list) {
                lines.add(s.toCsvLine());
            }
            Files.write(filePath, lines, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("写入学生文件失败：" + filePath, e);
        }
    }
}
