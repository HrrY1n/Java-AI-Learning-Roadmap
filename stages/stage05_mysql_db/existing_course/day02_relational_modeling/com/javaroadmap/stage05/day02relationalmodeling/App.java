package com.javaroadmap.stage05.day02relationalmodeling;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * 知识点：关系模型（1:N / M:N 中间表）、外键约束与 INNER JOIN vs LEFT JOIN 对照。
 *
 * Observe：预测 INNER JOIN 与 LEFT JOIN 分别返回几行（小刚未选课会去哪？）；
 * 尝试向 lab_enrollments 插入不存在的 student_id=9999，观察外键 RESTRICT 拦截错误码 1452。
 */
public class App {
    public static void main(String[] args) throws SQLException {
        try (Connection conn = DbEnv.openConnection();
             Statement stmt = conn.createStatement()) {

            stmt.executeUpdate("DROP TABLE IF EXISTS lab_enrollments");
            stmt.executeUpdate("DROP TABLE IF EXISTS lab_courses");
            stmt.executeUpdate("DROP TABLE IF EXISTS lab_students");

            stmt.executeUpdate("""
                    CREATE TABLE lab_students (
                        id BIGINT NOT NULL AUTO_INCREMENT,
                        student_no VARCHAR(32) NOT NULL,
                        name VARCHAR(64) NOT NULL,
                        PRIMARY KEY (id),
                        UNIQUE KEY uk_student_no (student_no)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """);
            stmt.executeUpdate("""
                    CREATE TABLE lab_courses (
                        id BIGINT NOT NULL AUTO_INCREMENT,
                        course_code VARCHAR(32) NOT NULL,
                        title VARCHAR(80) NOT NULL,
                        PRIMARY KEY (id),
                        UNIQUE KEY uk_course_code (course_code)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """);
            stmt.executeUpdate("""
                    CREATE TABLE lab_enrollments (
                        id BIGINT NOT NULL AUTO_INCREMENT,
                        student_id BIGINT NOT NULL,
                        course_id BIGINT NOT NULL,
                        grade INT NULL,
                        PRIMARY KEY (id),
                        UNIQUE KEY uk_student_course (student_id, course_id),
                        CONSTRAINT fk_stu FOREIGN KEY (student_id) REFERENCES lab_students(id) ON DELETE RESTRICT,
                        CONSTRAINT fk_crs FOREIGN KEY (course_id)  REFERENCES lab_courses(id)  ON DELETE RESTRICT
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """);

            stmt.executeUpdate("INSERT INTO lab_students (id, student_no, name) VALUES (1,'S01','小明'),(2,'S02','小红'),(3,'S03','小刚')");
            stmt.executeUpdate("INSERT INTO lab_courses (id, course_code, title) VALUES (10,'JAVA101','Java核心'),(20,'DB201','MySQL建模')");
            // 小明选两门、小红选一门、小刚一门都没选
            stmt.executeUpdate("INSERT INTO lab_enrollments (student_id, course_id, grade) VALUES (1,10,91),(1,20,85),(2,10,88)");

            System.out.println("=== INNER JOIN（只返回有选课记录的行）===");
            try (ResultSet rs = stmt.executeQuery("""
                    SELECT s.name, c.course_code, e.grade
                    FROM lab_students s
                    INNER JOIN lab_enrollments e ON s.id = e.student_id
                    INNER JOIN lab_courses c ON e.course_id = c.id
                    ORDER BY s.id, c.id
                    """)) {
                while (rs.next()) {
                    System.out.println("  " + rs.getString("name") + " | " + rs.getString("course_code") + " | " + rs.getInt("grade"));
                }
            }

            System.out.println("=== LEFT JOIN（保留所有学生，小刚显示为未选课）===");
            try (ResultSet rs = stmt.executeQuery("""
                    SELECT s.name, COALESCE(c.course_code, '(未选课)') AS code, e.grade
                    FROM lab_students s
                    LEFT JOIN lab_enrollments e ON s.id = e.student_id
                    LEFT JOIN lab_courses c ON e.course_id = c.id
                    ORDER BY s.id, c.id
                    """)) {
                while (rs.next()) {
                    System.out.println("  " + rs.getString("name") + " | " + rs.getString("code") + " | " + rs.getObject("grade"));
                }
            }

            // 外键反例：插入不存在的学生 id=9999，MySQL 拒绝（errorCode=1452）
            try {
                stmt.executeUpdate("INSERT INTO lab_enrollments (student_id, course_id, grade) VALUES (9999, 10, 80)");
            } catch (SQLException e) {
                System.out.println("外键拦截孤儿记录：errorCode=" + e.getErrorCode() + ", sqlState=" + e.getSQLState());
            }
        }
    }
}
