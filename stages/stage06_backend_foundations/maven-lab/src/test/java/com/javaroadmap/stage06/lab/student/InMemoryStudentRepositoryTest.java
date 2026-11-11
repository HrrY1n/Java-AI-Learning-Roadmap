package com.javaroadmap.stage06.lab.student;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 课 2 的被测契约测试：每条 @Test 对应 StudentRepository 的一条可验证行为，
 * 覆盖正常路径、边界值与异常路径——这正是"测试替身-free 的单元测试"该有的样子。
 */
class InMemoryStudentRepositoryTest {

    private InMemoryStudentRepository repository;

    @BeforeEach
    void setUp() {
        // 生命周期：每个 @Test 前都会重新执行——测试之间互不污染是可重复测试的前提。
        repository = new InMemoryStudentRepository();
    }

    private Student student(int id, String studentNo, int score) {
        return new Student(id, studentNo, "学生" + id, score, "-");
    }

    @Test
    @DisplayName("save 后 findById 能找到同一 id 的学生")
    void saveThenFindById() {
        Student in = student(1, "S001", 88);
        repository.save(in);

        Student out = repository.findById(1);
        assertNotNull(out, "已保存的学生不应查不到");
        assertEquals("S001", out.getStudentNo());
        assertEquals(88, out.getScore());
    }

    @Test
    @DisplayName("findById 不存在的 id 返回 null（调用方必须处理判空）")
    void findByIdMissingReturnsNull() {
        assertNull(repository.findById(999));
    }

    @Test
    @DisplayName("相同 id 再次 save = 覆盖更新，不是新增第二条")
    void saveSameIdOverwrites() {
        repository.save(student(1, "S001", 60));
        repository.save(student(1, "S001", 95));

        assertEquals(1, repository.findAll().size(), "同 id 覆盖后仍只有一条");
        assertEquals(95, repository.findById(1).getScore());
    }

    @Test
    @DisplayName("唯一学号约束：不同 id 抢同一学号 → IllegalArgumentException")
    void duplicateStudentNoRejected() {
        repository.save(student(1, "S001", 88));

        IllegalArgumentException e = assertThrows(IllegalArgumentException.class,
                () -> repository.save(student(2, "S001", 90)));
        assertTrue(e.getMessage().contains("学号已存在"), "异常消息应指明冲突原因：" + e.getMessage());
        assertNull(repository.findById(2), "失败的 save 不应留下半条记录");
    }

    @Test
    @DisplayName("updateScore 成功路径返回 true 并真正改值")
    void updateScoreHappyPath() {
        repository.save(student(1, "S001", 60));

        assertTrue(repository.updateScore(1, 92));
        assertEquals(92, repository.findById(1).getScore());
    }

    @Test
    @DisplayName("updateScore 目标不存在返回 false（而不是抛异常）")
    void updateScoreMissingReturnsFalse() {
        assertFalse(repository.updateScore(999, 80));
    }

    @Test
    @DisplayName("deleteById 二次删除：第一次 true，第二次 false")
    void deleteTwice() {
        repository.save(student(1, "S001", 60));

        assertTrue(repository.deleteById(1));
        assertFalse(repository.deleteById(1), "第二次删除同一 id 应返回 false");
        assertNull(repository.findById(1));
    }

    @Test
    @DisplayName("findAll 返回快照副本：修改返回列表不影响仓库内部")
    void findAllIsSnapshot() {
        repository.save(student(1, "S001", 60));
        repository.save(student(2, "S002", 70));

        List<Student> snapshot = repository.findAll();
        snapshot.clear();
        assertEquals(2, repository.findAll().size(), "清空副本不应影响仓库");
    }

    @Test
    @DisplayName("saveBatchAtomically：整批成功时全部入库")
    void batchAllSuccess() {
        repository.save(student(1, "S001", 60));

        repository.saveBatchAtomically(List.of(student(2, "S002", 70), student(3, "S003", 80)));

        assertEquals(3, repository.findAll().size());
    }

    @Test
    @DisplayName("saveBatchAtomically：批内一条冲突 → 整批回滚，仓库回到调用前状态")
    void batchRollbackOnConflict() {
        repository.save(student(1, "S001", 60));

        List<Student> batch = List.of(
                student(2, "S002", 70),
                student(3, "S001", 80)); // 与已有 id=1 抢学号 S001
        assertThrows(IllegalArgumentException.class, () -> repository.saveBatchAtomically(batch));

        assertNull(repository.findById(2), "回滚后新学生不应存在");
        assertEquals(1, repository.findAll().size(), "回滚后只剩调用前的 1 条");
        assertEquals(60, repository.findById(1).getScore(), "原有数据不受批内失败影响");
    }

    @Test
    @DisplayName("边界值：分数 0 与 100 合法，-1 与 101 被 Student 构造器拒绝")
    void scoreBoundaries() {
        assertDoesNotThrow(() -> repository.save(student(1, "S001", 0)));
        assertDoesNotThrow(() -> repository.save(student(2, "S002", 100)));
        assertThrows(IllegalArgumentException.class, () -> student(3, "S003", -1));
        assertThrows(IllegalArgumentException.class, () -> student(3, "S003", 101));
    }

    @Test
    @DisplayName("构造器校验：空学号与空姓名都被拒绝")
    void constructorValidation() {
        assertThrows(IllegalArgumentException.class,
                () -> new Student(1, "  ", "小明", 60, "-"));
        assertThrows(IllegalArgumentException.class,
                () -> new Student(1, "S001", "", 60, "-"));
        assertThrows(IllegalArgumentException.class,
                () -> new Student(0, "S001", "小明", 60, "-"), "id 必须为正");
    }
}
