package com.javaroadmap.stage05.practice.skeleton;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * 独立实践 TODO 骨架：事务名额划转（复制一份到 my_practices/ 后补全 TODO）。
 * 请勿修改此骨架里的答案；验收时应能通过环境变量传入的隔离 MySQL 测试库验证：
 * 1) 合法划转提交成功，总名额守恒；
 * 2) 目标院系不存在（executeUpdate() == 0）或扣成负数时整笔回滚，源院系名额不被平白扣掉！
 */
public class ScholarshipTransferLab {

    public static void setupTestTable(Connection conn) throws SQLException {
        try (Statement stmt = conn.createStatement()) {
            stmt.executeUpdate("DROP TABLE IF EXISTS lab_dept_quota");
            stmt.executeUpdate("""
                    CREATE TABLE lab_dept_quota (
                        id BIGINT PRIMARY KEY,
                        dept_name VARCHAR(64) NOT NULL,
                        quota INT NOT NULL,
                        CONSTRAINT chk_quota_nonneg CHECK (quota >= 0)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """);
            stmt.executeUpdate("INSERT INTO lab_dept_quota VALUES (1,'计算机学院',10),(2,'软件学院',5)");
        }
    }

    /**
     * TODO: 在同一事务中把 amount 个名额从 fromDeptId 划转到 toDeptId。
     * 关键要求：
     * 1. 关闭自动提交 conn.setAutoCommit(false)；
     * 2. 检查扣减与增加两步的 executeUpdate() 返回值必须都等于 1（目标不存在不会自己抛异常，会返回 0！）；
     * 3. 任一步失败（包括 CHECK 约束违约或更新行数 != 1）立即 conn.rollback() 后抛出异常；
     * 4. 两步均成功才 conn.commit()；建议在 finally 中恢复 conn.setAutoCommit(true)。
     */
    public static void transferQuota(Connection conn, long fromDeptId, long toDeptId, int amount) throws SQLException {
        // TODO: 由你独立实现，不要只写一条 UPDATE 或忘了判断 executeUpdate() == 1
        throw new UnsupportedOperationException("TODO: 待你独立实现事务名额划转");
    }

    public static int sumAllQuota(Connection conn) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement("SELECT COALESCE(SUM(quota), 0) FROM lab_dept_quota");
             ResultSet rs = ps.executeQuery()) {
            rs.next();
            return rs.getInt(1);
        }
    }

    public static void main(String[] args) {
        System.out.println("这是练习 TODO 骨架：请复制到 my_practices/ 并传入隔离 MySQL 连接后完成 transferQuota 实现。");
    }
}
