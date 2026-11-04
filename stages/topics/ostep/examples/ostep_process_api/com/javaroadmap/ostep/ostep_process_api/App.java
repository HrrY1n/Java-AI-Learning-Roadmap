package com.javaroadmap.ostep.ostep_process_api;

/**
 * 教学示例：进程 API：创建、等待与退出
 * 来源：操作系统导论（本地中文版）
 * 仅用于课程观察；不声称测量真实 CPU、OS 调度或公网网络。
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 进程 API：创建、等待与退出 ===");
        Process process = new ProcessBuilder("java", "--version")
            .redirectErrorStream(true)
            .start();
        String output = new String(process.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
        int exit = process.waitFor();
        System.out.println("退出码：" + exit);
        System.out.println(output.strip());
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }
}
