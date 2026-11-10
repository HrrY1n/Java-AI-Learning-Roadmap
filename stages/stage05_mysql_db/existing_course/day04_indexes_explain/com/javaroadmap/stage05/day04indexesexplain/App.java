package com.javaroadmap.stage05.day04indexesexplain;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * 知识点：B+ 树索引与 EXPLAIN 执行计划对比（全表扫描 ALL vs 索引定位 ref/range + 最左前缀与失效场景）。
 *
 * Observe：观察同一条 SQL 在建索引前后 EXPLAIN 的 type、key、rows、Extra 列的真实变化，
 * 以及跳过了联合索引最左列、或对索引列用算术/前导 % 模糊匹配时，优化器为什么退回全表扫描。
 */
public class App {
    public static void main(String[] args) throws SQLException {
        try (Connection conn = DbEnv.openConnection();
             Statement stmt = conn.createStatement()) {

            stmt.executeUpdate("DROP TABLE IF EXISTS lab_index_bench");
            stmt.executeUpdate("""
                    CREATE TABLE lab_index_bench (
                        id BIGINT NOT NULL AUTO_INCREMENT,
                        dept_code VARCHAR(16) NOT NULL,
                        score INT NOT NULL,
                        username VARCHAR(32) NOT NULL,
                        PRIMARY KEY (id)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """);

            // 批量插入 500 行测试样本（使用事务+预编译，几十毫秒完成）
            conn.setAutoCommit(false);
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO lab_index_bench (dept_code, score, username) VALUES (?, ?, ?)")) {
                for (int i = 1; i <= 500; i++) {
                    ps.setString(1, "D" + (i % 10));
                    ps.setInt(2, i % 101);
                    ps.setString(3, "user_" + i);
                    ps.addBatch();
                }
                ps.executeBatch();
                conn.commit();
            }
            conn.setAutoCommit(true);
            // 注意：MySQL 中 ANALYZE TABLE 会返回结果集（Table/Op/Msg_text），不能用 executeUpdate()
            stmt.execute("ANALYZE TABLE lab_index_bench");

            String targetSql = "SELECT id, username FROM lab_index_bench WHERE dept_code = 'D3' AND score >= 80";
            printExplain(stmt, "1) 无二级索引前（全表扫描 ALL）", targetSql);

            // 创建联合索引 (dept_code, score)
            stmt.executeUpdate("CREATE INDEX idx_dept_score ON lab_index_bench (dept_code, score)");
            stmt.execute("ANALYZE TABLE lab_index_bench");

            printExplain(stmt, "2) 建联合索引 (dept_code, score) 后（命中 range/ref）", targetSql);
            printExplain(stmt, "3) 跳过最左列只查 WHERE score >= 80（索引无法定位左列，退回 ALL）",
                    "SELECT id, username FROM lab_index_bench WHERE score >= 80");
            printExplain(stmt, "4) 覆盖索引对比：只查索引自带字段 dept_code, score, id（Extra 出现 Using index，免回表）",
                    "SELECT id, dept_code, score FROM lab_index_bench WHERE dept_code = 'D3' AND score >= 80");
            printExplain(stmt, "5) 索引列套用函数 LOWER(dept_code) = 'd3'（不能用 B+ 树快速定位，退回全表扫描 ALL）",
                    "SELECT id, username FROM lab_index_bench WHERE LOWER(dept_code) = 'd3'");

            stmt.executeUpdate("DROP TABLE IF EXISTS lab_index_bench");
        }
    }

    private static void printExplain(Statement stmt, String label, String sql) throws SQLException {
        System.out.println("\n=== " + label + " ===");
        try (ResultSet rs = stmt.executeQuery("EXPLAIN " + sql)) {
            while (rs.next()) {
                System.out.println("  type=" + rs.getString("type")
                        + " | possible_keys=" + rs.getString("possible_keys")
                        + " | key=" + rs.getString("key")
                        + " | rows=" + rs.getLong("rows")
                        + " | Extra=" + rs.getString("Extra"));
            }
        }
    }
}
