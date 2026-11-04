package com.javaroadmap.csapp.csapp_network_programming;

/**
 * 教学示例：套接字编程：本机回环的 TCP echo
 * 来源：CS:APP（第 3 版 Global Edition）
 * 仅用于课程观察；不声称测量真实 CPU、OS 调度或公网网络。
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 套接字编程：本机回环的 TCP echo ===");
        try (java.net.ServerSocket server = new java.net.ServerSocket(0);
             java.net.Socket client = new java.net.Socket("127.0.0.1", server.getLocalPort());
             java.net.Socket accepted = server.accept()) {
            client.getOutputStream().write(("ping" + System.lineSeparator()).getBytes(java.nio.charset.StandardCharsets.UTF_8));
            String received = new String(accepted.getInputStream().readNBytes(4), java.nio.charset.StandardCharsets.UTF_8);
            System.out.println("本机 TCP echo 收到：" + received.trim());
        }
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }
}
