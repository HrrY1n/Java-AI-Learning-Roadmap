package com.javaroadmap.stage06.api.web;

import com.javaroadmap.stage06.api.student.DuplicateStudentNoException;
import com.javaroadmap.stage06.api.student.InMemoryStudentRepository;
import com.javaroadmap.stage06.api.student.Student;
import com.javaroadmap.stage06.api.student.StudentNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service 层：业务规则与用例编排。
 *
 * 分层的真实含义（课 5 正文的核心论证）：
 * - Controller 只做"HTTP ↔ Java"翻译，不含业务判断；
 * - Service 是唯一允许说"这条请求在业务上成不成立"的地方（谁生成 id、冲突算什么异常）；
 * - Repository 只谈存取。三者各自可替换、可单独测试。
 */
@Service
public class StudentService {

    private final InMemoryStudentRepository repository;

    /** 构造器注入：Spring 在装配时把容器里的 Repository Bean 递进来（课 4）。 */
    public StudentService(InMemoryStudentRepository repository) {
        this.repository = repository;
    }

    public StudentResponse create(StudentCreateDto dto) {
        int id = nextId();
        // DTO → 业务对象：字段转换与默认值在这里完成，Controller 不碰 Student 构造器
        Student student = new Student(id, dto.studentNo(), dto.name(), dto.score() == null ? 0 : dto.score(), dto.email());
        repository.save(student); // 学号冲突 → DuplicateStudentNoException → 409（见 ApiExceptionHandler）
        return StudentResponse.from(student);
    }

    public StudentResponse get(int id) {
        return StudentResponse.from(requireStudent(id));
    }

    public List<StudentResponse> list() {
        return repository.findAll().stream().map(StudentResponse::from).toList();
    }

    public StudentResponse update(int id, StudentUpdateDto dto) {
        Student student = requireStudent(id);
        if (dto.score() != null) {
            student.setScore(dto.score()); // 业务对象自带分数校验（0~100）
        }
        if (dto.email() != null) {
            student.setEmail(dto.email());
        }
        return StudentResponse.from(student);
    }

    public void delete(int id) {
        if (!repository.deleteById(id)) {
            throw new StudentNotFoundException(id);
        }
    }

    /** 内存版的 id 生成策略：现有最大 id + 1。MySQL 版会换成 AUTO_INCREMENT（课 5 正文）。 */
    private int nextId() {
        return repository.findAll().stream().mapToInt(com.javaroadmap.stage06.api.student.Student::getId).max().orElse(0) + 1;
    }

    private Student requireStudent(int id) {
        Student student = repository.findById(id);
        if (student == null) {
            throw new StudentNotFoundException(id);
        }
        return student;
    }
}
