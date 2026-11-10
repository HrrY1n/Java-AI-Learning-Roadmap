package com.javaroadmap.stage05.day03transactionsacid;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * 知识点：MySQL 事务 ACID、setAutoCommit(false) 提交/回滚与 InnoDB REPEATABLE READ 隔离级别实证。
 *
 * Observe：观察同一个 Java 程序用两个独立 Connection 连到 MySQL 8.0 时：
 * 1) 事务 1 扣积分未 commit 前，事务 2 看不见脏数据（无脏读）；
 * 2) 事务 1 第二步失败触发 rollback() 后，第一步的扣款自动恢复原样（原子性）；
 * 3) 事务 1 成功 commit() 后，事务 2 在旧快照里仍看到旧值（可重复读 MVCC），新开事务看到新值。
 */
public class App {
    public static void main(String[] args) throws SQLException {
        try (Connection setup = DbEnv.openConnection();
             Statement stmt = setup.createStatement()) {
            stmt.executeUpdate("DROP TABLE IF EXISTS lab_tx_accounts");
            stmt.executeUpdate("""
                    CREATE TABLE lab_tx_accounts (
                        id BIGINT PRIMARY KEY,
                        name VARCHAR(64) NOT NULL,
                        credits INT NOT NULL,
                        CONSTRAINT chk_credits_nonneg CHECK (credits >= 0)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """);
            stmt.executeUpdate("INSERT INTO lab_tx_accounts VALUES (1,'小明',100),(2,'小红',50)");
        }

        // 实验一：中途失败必须整笔回滚（原子性）
        try (Connection tx1 = DbEnv.openConnection();
             Connection reader = DbEnv.openConnection()) {
            tx1.setAutoCommit(false);
            reader.setAutoCommit(false);

            // reader 先读一次建立 REPEATABLE READ 快照
            System.out.println("实验一前 reader 快照：小明=" + readCredits(reader, 1) + ", 小红=" + readCredits(reader, 2));

            try {
                // 步骤 1：小明扣 40（成功写进当前未提交事务）
                transferStep(tx1, 1, -40);
                // 此时另一连接在 REPEATABLE READ 下绝不会读到小明的中间态 60
                System.out.println("tx1 未提交时 reader 看到小明仍是：" + readCredits(reader, 1));

                // 步骤 2：故意扣减超过小明余额或违反非负检查造成失败
                transferStep(tx1, 1, -1000); // 触发 CHECK (credits >= 0) 错误 3819
                tx1.commit();
            } catch (SQLException e) {
                tx1.rollback(); // 关键：撤销本事务内前面做过的 -40！
                System.out.println("tx1 第二步失败已 rollback：" + e.getMessage());
            }
            reader.commit();
        }

        // 实验二：合法事务提交 + MVCC 可重复读对比
        try (Connection tx2 = DbEnv.openConnection();
             Connection readerOldTx = DbEnv.openConnection();
             Connection readerNewTx = DbEnv.openConnection()) {
            readerOldTx.setAutoCommit(false);
            System.out.println("实验二开始时，老事务 readerOldTx 快照读取小明=" + readCredits(readerOldTx, 1));

            tx2.setAutoCommit(false);
            transferStep(tx2, 1, -30);
            transferStep(tx2, 2, 30);
            tx2.commit();
            System.out.println("tx2 已 commit 转账 30");

            // 同一个未结束的 REPEATABLE READ 事务内再次普通 SELECT（快照读），依然看到 100！
            System.out.println("tx2 提交后，未结束的 readerOldTx（MVCC 快照读）仍看到小明=" + readCredits(readerOldTx, 1));
            readerOldTx.commit();

            // 全新事务（或新快照）立刻看到提交后的最新状态 70 / 80
            System.out.println("新查询看到提交后真实余额：小明=" + readCredits(readerNewTx, 1)
                    + ", 小红=" + readCredits(readerNewTx, 2));
        } finally {
            try (Connection clean = DbEnv.openConnection(); Statement s = clean.createStatement()) {
                s.executeUpdate("DROP TABLE IF EXISTS lab_tx_accounts");
            }
        }
    }

    private static void transferStep(Connection conn, long id, int delta) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(
                "UPDATE lab_tx_accounts SET credits = credits + ? WHERE id = ?")) {
            ps.setInt(1, delta);
            ps.setLong(2, id);
            ps.executeUpdate();
        }
    }

    private static int readCredits(Connection conn, long id) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement("SELECT credits FROM lab_tx_accounts WHERE id = ?")) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                return rs.getInt(1);
            }
        }
    }
}
