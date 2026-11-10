package com.javaroadmap.stage03.student;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/** 文件版学生仓库。 */
public class FileStudentRepository implements StudentRepository {
    private Path filePath;

    public FileStudentRepository(Path filePath) {
        this.filePath = filePath;
    }

    @Override
    public void save(Student student) {
        List<Student> students = findAll();
        boolean updated = false;

        for (int i = 0; i < students.size(); i++) {
            if (students.get(i).getId() == student.getId()) {
                students.set(i, student);
                updated = true;
                break;
            }
        }

        if (!updated) {
            students.add(student);
        }

        writeAll(students);
    }

    @Override
    public Student findById(int id) {
        List<Student> students = findAll();
        for (Student student : students) {
            if (student.getId() == id) {
                return student;
            }
        }
        return null;
    }

    @Override
    public List<Student> findAll() {
        try {
            if (!Files.exists(filePath)) {
                return new ArrayList<Student>();
            }

            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);
            List<Student> students = new ArrayList<Student>();

            for (String line : lines) {
                if (!line.trim().isEmpty()) {
                    students.add(Student.fromCsvLine(line));
                }
            }

            return students;
        } catch (IOException e) {
            // IO 故障属于系统/外部环境错误，不应伪装成 BusinessException 被业务层当普通校验失败吞掉；
            // 保留原始 cause 向上抛出，让入口层或日志系统看到真实根因。
            throw new IllegalStateException("读取学生文件失败：" + filePath, e);
        }
    }

    private void writeAll(List<Student> students) {
        try {
            if (filePath.getParent() != null) {
                Files.createDirectories(filePath.getParent());
            }

            List<String> lines = new ArrayList<String>();
            for (Student student : students) {
                lines.add(student.toCsvLine());
            }

            Files.write(filePath, lines, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("写入学生文件失败：" + filePath, e);
        }
    }
}

