package com.javaroadmap.csapp.csapp_bits_integers;

/**
 * 教学示例：位、字节与整数表示：溢出的物理来源
 * 来源：CS:APP（第 3 版 Global Edition）
 * 仅用于课程观察；不声称测量真实 CPU、OS 调度或公网网络。
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 位、字节与整数表示：溢出的物理来源 ===");
        int overflow = Integer.MAX_VALUE + 1;
        int truncated = (byte) 300 & 0xff;
        System.out.println("int 溢出：" + overflow);
        System.out.println("byte 截断：" + truncated);
        System.out.println("-1 的 32 位补码：" + Integer.toBinaryString(-1));
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }
}
