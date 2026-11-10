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
 * 第 3-6 阶段：MySQL JDBC 实现（完整 CRUD + 精准异常分类 + 事务原子批量保存 + try-with-resources 防泄漏）。
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
        try (Connection conn = DbEnv.openConnection()) {
            upsertOnConnection(conn, student);
        } catch (SQLException e) {
            throw translateConstraintOrSystemError("保存学生失败", student, e);
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
        try (Connection conn = DbEnv.openConnection()) {
            conn.setAutoCommit(false);
            Student current = null;
            try {
                // 在同一事务连接上复用 upsertOnConnection：保持与内存/文件版相同的"同 id 覆盖"契约，
                // 同时绝不触发 ON DUPLICATE KEY UPDATE 误改他人学号行。
                for (Student student : batch) {
                    current = student;
                    upsertOnConnection(conn, student);
                }
                conn.commit();
            } catch (SQLException e) {
                try {
                    conn.rollback();
                } catch (SQLException suppressed) {
                    e.addSuppressed(suppressed);
                }
                throw translateConstraintOrSystemError("批量写入事务已全部回滚", current, e);
            } finally {
                try {
                    conn.setAutoCommit(true);
                } catch (SQLException ignored) {
                    // 连接即将随 try-with-resources 关闭
                }
            }
        } catch (SQLException e) {
            throw new IllegalStateException("批量事务连接失败", e);
        }
    }

    /**
     * 按主键 id 显式区分 UPDATE 与 INSERT：既满足同 id 覆盖语义，
     * 又让 uk_evo_student_no 唯一约束能真正拦截“换个 id 冒用他人学号”。
     */
    private static void upsertOnConnection(Connection conn, Student student) throws SQLException {
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
    }

    /**
     * 精准区分业务数据约束违约（1062 唯一/主键冲突、3819 CHECK 违约）与底层系统故障（网络/权限/死锁），
     * 绝不把网络断连或 SQL 语法错误吞并成 IllegalArgumentException。
     */
    private static RuntimeException translateConstraintOrSystemError(
            String action, Student student, SQLException e) {
        if (e instanceof SQLIntegrityConstraintViolationException || e.getErrorCode() == 3819) {
            String msg = e.getMessage() == null ? "" : e.getMessage();
            if (msg.contains("PRIMARY")) {
                return new IllegalArgumentException(
                        action + "：主键 id 冲突（并发写入或重复主键），id="
                                + (student != null ? student.getId() : "?") + "，" + msg, e);
            }
            if (e.getErrorCode() == 3819) {
                return new IllegalArgumentException(action + "：数据违反 CHECK 约束，" + msg, e);
            }
            return new IllegalArgumentException(
                    action + "：数据库唯一约束冲突（学号可能已被占用）："
                            + (student != null ? student.getStudentNo() : "?") + "（" + msg + "）", e);
        }
        return new IllegalStateException(action + "（底层 SQL/连接故障）：" + e.getMessage(), e);
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
