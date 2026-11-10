package com.javaroadmap.stage05.student;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/**
 * 连续演进项目总演示：同一套 StudentRepository 契约走通内存 → 文件 → MySQL 完整 CRUD + 约束与事务回滚。
 *
 * 说明两点：① 本包的 StudentRepository/Student 是 Stage 03 契约的升级版（6 方法/5 字段），阶段 1–2 是重演；
 * ② 业务流程暂写在 main 里、没有独立 Service 层——这是为聚焦存储层的有意裁剪，Stage 06 Spring 的 @Service 会把它归位。
 */
public class StudentEvolutionDemo {
    public static void main(String[] args) throws IOException {
        System.out.println("=== 阶段 1：InMemoryStudentRepository ===");
        runCrudCycle(new InMemoryStudentRepository());

        System.out.println("\n=== 阶段 2：FileStudentRepository (临时文件，运行后自清理) ===");
        Path tempCsv = Files.createTempFile("jrl-evo-students-", ".csv");
        try {
            runCrudCycle(new FileStudentRepository(tempCsv));
        } finally {
            Files.deleteIfExists(tempCsv);
        }

        System.out.println("\n=== 阶段 3-6：JdbcStudentRepository (真实 MySQL 8.0 持久化 + 约束 + 事务) ===");
        JdbcStudentRepository jdbcRepo = new JdbcStudentRepository();
        jdbcRepo.resetSchema();
        runCrudCycle(jdbcRepo);

        // 阶段 6a：唯一约束冲突拦截（S001 已被小明占用，试图用 id=10 重用 S001）
        try {
            jdbcRepo.save(new Student(10, "S001", "冒名者", 70, "-"));
        } catch (IllegalArgumentException e) {
            System.out.println("唯一约束拦截成功：" + e.getMessage());
        }

        // 阶段 6b：事务原子批量写入——第 1 条合法(id=20)，第 2 条故意冲突(重复学号 S001)
        // 断言：第 1 条 id=20 也必须随回滚一起撤销，绝不半成功污染数据库！
        List<Student> batchWithError = List.of(
                new Student(20, "S020", "临时同伴", 85, "s20@school.example"),
                new Student(21, "S001", "学号冲突触发回滚", 80, "-")
        );
        try {
            jdbcRepo.saveBatchAtomically(batchWithError);
        } catch (IllegalArgumentException e) {
            System.out.println("事务回滚已触发：" + e.getMessage());
        }
        System.out.println("回滚后查 id=20（应为 null）：" + jdbcRepo.findById(20));
        System.out.println("最终库内全部学生：" + jdbcRepo.findAll());
    }

    private static void runCrudCycle(StudentRepository repo) {
        repo.save(new Student(1, "S001", "小明", 88, "ming@school.example"));
        repo.save(new Student(2, "S002", "小红", 95, "hong@school.example"));
        repo.save(new Student(3, "S003", "小刚", 55, "-"));

        repo.updateScore(3, 62);
        repo.deleteById(2);
        System.out.println("  CRUD 后剩余：" + repo.findAll());
        System.out.println("  查 id=3：" + repo.findById(3));
        System.out.println("  查已删除 id=2：" + repo.findById(2));
    }
}
