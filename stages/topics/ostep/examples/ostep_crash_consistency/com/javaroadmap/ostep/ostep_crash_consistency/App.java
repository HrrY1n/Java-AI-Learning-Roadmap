package com.javaroadmap.ostep.ostep_crash_consistency;

/**
 * 教学示例：崩溃一致性：FSCK 与预写日志
 * 来源：操作系统导论（本地中文版）
 * 仅用于课程观察；不声称测量真实 CPU、OS 调度或公网网络。
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 崩溃一致性：FSCK 与预写日志 ===");
        String oldBlock = "A";
        String newBlock = "B";
        System.out.println("BEGIN");
        System.out.println("WRITE old=" + oldBlock + " new=" + newBlock);
        System.out.println("COMMIT");
        System.out.println("CHECKPOINT");
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }
}
