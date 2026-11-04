package com.javaroadmap.csapp.csapp_system_io;

/**
 * 教学示例：系统级 I/O 与 Java 文件流
 * 来源：CS:APP（第 3 版 Global Edition）
 * 仅用于课程观察；不声称测量真实 CPU、OS 调度或公网网络。
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 系统级 I/O 与 Java 文件流 ===");
        java.nio.file.Path source = java.nio.file.Files.createTempFile("jrl-io-source", ".txt");
        java.nio.file.Path target = java.nio.file.Files.createTempFile("jrl-io-target", ".txt");
        java.nio.file.Files.writeString(source, "system level I/O demo" + System.lineSeparator());
        try (java.io.InputStream input = java.nio.file.Files.newInputStream(source);
             java.io.OutputStream output = java.nio.file.Files.newOutputStream(target)) {
            input.transferTo(output);
        }
        System.out.println("复制后字节数：" + java.nio.file.Files.size(target));
        java.nio.file.Files.deleteIfExists(source);
        java.nio.file.Files.deleteIfExists(target);
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }
}
