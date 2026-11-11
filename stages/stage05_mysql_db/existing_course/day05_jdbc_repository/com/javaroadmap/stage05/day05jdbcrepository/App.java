package com.javaroadmap.stage05.day05jdbcrepository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * 知识点：JDBC 数据访问、PreparedStatement 参数绑定防 SQL 注入与 try-with-resources 资源关闭。
 *
 * Observe：对比恶意输入 "' OR '1'='1" 在 SQL 字符串拼接下怎样绕过条件查出全表，
 * 而 PreparedStatement 的 ? 占位符如何让绑定值只作为数据参与比较、无法改变语句语法结构。
 * （边界：? 只保护值的位置，表名/列名/ORDER BY 等结构不能用占位符，需固定选项映射。）
 */
public class App {
    public static void main(String[] args) throws SQLException {
        try (Connection conn = DbEnv.openConnection();
             Statement stmt = conn.createStatement()) {

            stmt.executeUpdate("DROP TABLE IF EXISTS lab_jdbc_users");
            stmt.executeUpdate("""
                    CREATE TABLE lab_jdbc_users (
                        id BIGINT NOT NULL AUTO_INCREMENT,
                        username VARCHAR(64) NOT NULL,
                        role VARCHAR(32) NOT NULL,
                        PRIMARY KEY (id),
                        UNIQUE KEY uk_username (username)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """);
            stmt.executeUpdate("INSERT INTO lab_jdbc_users (username, role) VALUES ('alice','USER'),('admin','ADMIN')");

            String maliciousInput = "' OR '1'='1";

            // 1. 演示危险的反模式（仅用于对照说明原理，实际工程严禁拼接输入！）：
            String unsafeSql = "SELECT username, role FROM lab_jdbc_users WHERE username = '" + maliciousInput + "'";
            System.out.println("=== 1) 字符串拼接（危险反例）查出的行数 ===");
            System.out.println("  拼接后 SQL：" + unsafeSql);
            List<String> leaked = new ArrayList<>();
            try (ResultSet rs = stmt.executeQuery(unsafeSql)) {
                while (rs.next()) {
                    leaked.add(rs.getString("username") + "(" + rs.getString("role") + ")");
                }
            }
            System.out.println("  SQL 注入泄露结果：" + leaked);

            // 2. 正确做法：PreparedStatement ? 占位符（1-based 绑定，参数不参与 SQL 语法解析）
            System.out.println("=== 2) PreparedStatement 参数绑定（安全）===");
            String safeSql = "SELECT username, role FROM lab_jdbc_users WHERE username = ?";
            List<String> safeResult = new ArrayList<>();
            try (PreparedStatement ps = conn.prepareStatement(safeSql)) {
                ps.setString(1, maliciousInput); // 占位符下标从 1 开始！
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        safeResult.add(rs.getString("username") + "(" + rs.getString("role") + ")");
                    }
                }
            }
            System.out.println("  安全查询结果（空列表，注入失败）：" + safeResult);

            stmt.executeUpdate("DROP TABLE IF EXISTS lab_jdbc_users");
        }
    }
}
