package com.javaroadmap.stage06.api.student;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.javaroadmap.stage06.api.web.StudentService;
import com.javaroadmap.stage06.api.web.StudentCreateDto;
import com.javaroadmap.stage06.api.web.StudentResponse;
import com.javaroadmap.stage06.api.web.StudentUpdateDto;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Service 层单元测试：不启动 Spring，用真实 InMemory 实现做协作对象。
 * 快（毫秒级）、稳（无网络/无容器）、聚焦（只验证 Service 的业务规则）。
 */
class StudentServiceTest {

    private StudentService service;
    private InMemoryStudentRepository repository;

    @BeforeEach
    void setUp() {
        repository = new InMemoryStudentRepository();
        service = new StudentService(repository);
    }

    @Test
    @DisplayName("create 顺序分配 id：第一条 1，第二条 2")
    void createAssignsSequentialIds() {
        StudentResponse first = service.create(new StudentCreateDto("S001", "小明", 88, "ming@school.cn"));
        StudentResponse second = service.create(new StudentCreateDto("S002", "小红", 95, "-"));

        assertEquals(1, first.id());
        assertEquals(2, second.id());
        assertEquals(2, service.list().size());
    }

    @Test
    @DisplayName("create 缺省分数按 0 处理，缺省邮箱回落为 -")
    void createWithDefaults() {
        StudentResponse response = service.create(new StudentCreateDto("S001", "小明", null, null));

        assertEquals(0, response.score());
        assertEquals("-", response.email());
    }

    @Test
    @DisplayName("create 学号冲突 → DuplicateStudentNoException")
    void createDuplicateStudentNo() {
        service.create(new StudentCreateDto("S001", "小明", 88, "-"));

        assertThrows(DuplicateStudentNoException.class,
                () -> service.create(new StudentCreateDto("S001", "冒名者", 70, "-")));
    }

    @Test
    @DisplayName("get 不存在的 id → StudentNotFoundException")
    void getMissingThrows() {
        assertThrows(StudentNotFoundException.class, () -> service.get(999));
    }

    @Test
    @DisplayName("update 只改 score 与 email，学号与姓名不变")
    void updateScoreAndEmail() {
        service.create(new StudentCreateDto("S001", "小明", 60, "-"));

        StudentResponse updated = service.update(1, new StudentUpdateDto(92, "ming@school.cn"));

        assertEquals(92, updated.score());
        assertEquals("ming@school.cn", updated.email());
        assertEquals("S001", updated.studentNo());
        assertEquals("小明", updated.name());
    }

    @Test
    @DisplayName("update 不存在的 id → StudentNotFoundException")
    void updateMissingThrows() {
        assertThrows(StudentNotFoundException.class,
                () -> service.update(999, new StudentUpdateDto(90, "-")));
    }

    @Test
    @DisplayName("delete 成功后 get 抛 NotFound；重复 delete 也抛 NotFound")
    void deleteThenGetThrows() {
        service.create(new StudentCreateDto("S001", "小明", 60, "-"));

        service.delete(1);
        assertThrows(StudentNotFoundException.class, () -> service.get(1));
        assertThrows(StudentNotFoundException.class, () -> service.delete(1));
    }
}
