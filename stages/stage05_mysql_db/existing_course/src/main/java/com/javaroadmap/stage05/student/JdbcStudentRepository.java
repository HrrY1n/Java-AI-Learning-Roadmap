package com.javaroadmap.stage05.student;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * 第 3-6 阶段：MySQL JDBC 实现（完整 CRUD + 约束异常转化 + 事务原子批量保存 + try-with-resources 防泄漏）。
 */
public class JdbcStudentRepository implements StudentRepository {

    /** 幂等初始化表结构（仅作用于测试表 evo_students，可安全重复调用）。 */
    public void resetSchema() {
        try (Connection conn = DbEnv.openConnection();
             Statement stmt = conn.createStatement()) {
            stmt.executeUpdate("DROP TABLE IF EXISTS evo_students");
            stmt.executeUpdate("""
                    CREATE TABLE evo_students (
                        id         INT          NOT NULL,
                        student_no VARCHAR(32)  NOT NULL,
                        name       VARCHAR(64)  NOT NULL,
                        score      INT          NOT NULL,
                        email      VARCHAR(128) NOT NULL DEFAULT '-',
                        updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        PRIMARY KEY (id),
                        UNIQUE KEY uk_evo_student_no (student_no),
                        CONSTRAINT chk_evo_score CHECK (score >= 0 AND score <= 100)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
                    """);
        } catch (SQLException e) {
            throw new IllegalStateException("初始化 evo_students 表失败", e);
        }
    }

    @Override
    public void save(Student student) {
        // 注意：不能无脑用 ON DUPLICATE KEY UPDATE——若新 id=10 与旧 id=1 的 student_no 冲突，
        // ON DUPLICATE KEY UPDATE 会去修改 id=1 那行而不是拒绝冲突！
        // 正确做法：按主键 id 显式区分更新与插入，让 uk_evo_student_no 唯一约束真正拦住学号冒用。
        try (Connection conn = DbEnv.openConnection()) {
            boolean exists;
            try (PreparedStatement check = conn.prepareStatement("SELECT 1 FROM evo_students WHERE id = ?")) {
                check.setInt(1, student.getId());
                try (ResultSet rs = check.executeQuery()) {
                    exists = rs.next();
                }
            }
            if (exists) {
                try (PreparedStatement ps = conn.prepareStatement(
                        "UPDATE evo_students SET student_no = ?, name = ?, score = ?, email = ? WHERE id = ?")) {
                    ps.setString(1, student.getStudentNo());
                    ps.setString(2, student.getName());
                    ps.setInt(3, student.getScore());
                    ps.setString(4, student.getEmail());
                    ps.setInt(5, student.getId());
                    ps.executeUpdate();
                }
            } else {
                try (PreparedStatement ps = conn.prepareStatement(
                        "INSERT INTO evo_students (id, student_no, name, score, email) VALUES (?, ?, ?, ?, ?)")) {
                    bindStudent(ps, student);
                    ps.executeUpdate();
                }
            }
        } catch (SQLIntegrityConstraintViolationException e) {
            // 唯一学号冲突（MySQL errorCode 1062）转为清晰业务提示并保留 cause
            throw new IllegalArgumentException("数据库唯一约束冲突（学号可能已被占用）：" + student.getStudentNo(), e);
        } catch (SQLException e) {
            throw new IllegalStateException("保存学生失败：id=" + student.getId(), e);
        }
    }

    @Override
    public Student findById(int id) {
        String sql = "SELECT id, student_no, name, score, email FROM evo_students WHERE id = ?";
        try (Connection conn = DbEnv.openConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? mapRow(rs) : null;
            }
        } catch (SQLException e) {
            throw new IllegalStateException("按 id 查询失败：id=" + id, e);
        }
    }

    @Override
    public List<Student> findAll() {
        String sql = "SELECT id, student_no, name, score, email FROM evo_students ORDER BY id";
        try (Connection conn = DbEnv.openConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<Student> list = new ArrayList<>();
            while (rs.next()) {
                list.add(mapRow(rs));
            }
            return list;
        } catch (SQLException e) {
            throw new IllegalStateException("查询全部学生失败", e);
        }
    }

    @Override
    public boolean updateScore(int id, int newScore) {
        if (newScore < 0 || newScore > 100) {
            throw new IllegalArgumentException("分数必须在 0~100 之间：" + newScore);
        }
        String sql = "UPDATE evo_students SET score = ? WHERE id = ?";
        try (Connection conn = DbEnv.openConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, newScore);
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new IllegalStateException("修改分数失败：id=" + id, e);
        }
    }

    @Override
    public boolean deleteById(int id) {
        String sql = "DELETE FROM evo_students WHERE id = ?";
        try (Connection conn = DbEnv.openConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new IllegalStateException("删除学生失败：id=" + id, e);
        }
    }

    @Override
    public void saveBatchAtomically(List<Student> batch) {
        String sql = "INSERT INTO evo_students (id, student_no, name, score, email) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DbEnv.openConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                for (Student student : batch) {
                    bindStudent(ps, student);
                    ps.executeUpdate();
                }
                conn.commit();
            } catch (SQLException e) {
                try {
                    conn.rollback();
                } catch (SQLException suppressed) {
                    e.addSuppressed(suppressed);
                }
                throw new IllegalArgumentException("批量写入触发数据库约束，事务已全部回滚：" + e.getMessage(), e);
            }
        } catch (SQLException e) {
            throw new IllegalStateException("批量事务连接失败", e);
        }
    }

    private static void bindStudent(PreparedStatement ps, Student s) throws SQLException {
        ps.setInt(1, s.getId());
        ps.setString(2, s.getStudentNo());
        ps.setString(3, s.getName());
        ps.setInt(4, s.getScore());
        ps.setString(5, s.getEmail());
    }

    private static Student mapRow(ResultSet rs) throws SQLException {
        return new Student(
                rs.getInt("id"),
                rs.getString("student_no"),
                rs.getString("name"),
                rs.getInt("score"),
                rs.getString("email")
        );
    }
}
