package com.javaroadmap.stage05.day01sqlconstraints;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * 知识点：MySQL 表结构与约束实战（PRIMARY KEY / NOT NULL / UNIQUE / CHECK / DEFAULT）。
 *
 * Observe：观察合法数据正常落表，以及重复学号（UNIQUE 冲突）与越界分数（MySQL 8.0.16+ CHECK 拦截）
 * 各自在数据库层面抛出什么 SQLState 与错误码，从而不依赖"每个调用方自觉校验"。
 */
public class App {
    public static void main(String[] args) throws SQLException {
        try (Connection conn = DbEnv.openConnection();
             Statement stmt = conn.createStatement()) {

            // 保证本示例可重复执行：先删子表（如有）再重建 lab_students
            stmt.executeUpdate("DROP TABLE IF EXISTS lab_enrollments");
            stmt.executeUpdate("DROP TABLE IF EXISTS lab_students");
            stmt.executeUpdate("""
                    CREATE TABLE lab_students (
                        id         BIGINT       NOT NULL AUTO_INCREMENT,
                        student_no VARCHAR(32)  NOT NULL,
                        name       VARCHAR(64)  NOT NULL,
                        score      INT          NOT NULL DEFAULT 0,
                        email      VARCHAR(128) NULL,
                        created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (id),
                        UNIQUE KEY uk_student_no (student_no),
                        CONSTRAINT chk_score_range CHECK (score >= 0 AND score <= 100)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
                    """);

            // 1. 正常插入
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO lab_students (student_no, name, score, email) VALUES (?, ?, ?, ?)")) {
                ps.setString(1, "S2026001");
                ps.setString(2, "小明");
                ps.setInt(3, 88);
                ps.setString(4, "xiaoming@school.example");
                ps.executeUpdate();
            }

            // 2. 反例一：重复学号触发 UNIQUE 约束（MySQL 错误码 1062，SQLState 23000）
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO lab_students (student_no, name, score) VALUES (?, ?, ?)")) {
                ps.setString(1, "S2026001");
                ps.setString(2, "冒名者");
                ps.setInt(3, 90);
                ps.executeUpdate();
            } catch (SQLException e) {
                System.out.println("UNIQUE 拦截重复学号：errorCode=" + e.getErrorCode()
                        + ", sqlState=" + e.getSQLState());
            }

            // 3. 反例二：越界分数触发 CHECK 约束（MySQL 8.0.16+ 强制校验，错误码 3819）
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO lab_students (student_no, name, score) VALUES (?, ?, ?)")) {
                ps.setString(1, "S2026002");
                ps.setString(2, "分数异常者");
                ps.setInt(3, 150);
                ps.executeUpdate();
            } catch (SQLException e) {
                System.out.println("CHECK 拦截越界分数：errorCode=" + e.getErrorCode()
                        + ", sqlState=" + e.getSQLState());
            }

            // 4. 查询验证库内干净状态（只有 S2026001 存在）
            try (ResultSet rs = stmt.executeQuery(
                    "SELECT id, student_no, name, score FROM lab_students ORDER BY id")) {
                while (rs.next()) {
                    System.out.println("库内记录：" + rs.getLong("id") + " | "
                            + rs.getString("student_no") + " | "
                            + rs.getString("name") + " | " + rs.getInt("score"));
                }
            }
        }
    }
}
