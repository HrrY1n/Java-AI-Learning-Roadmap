package com.javaroadmap.network.net_udp_tcp_sockets;

/**
 * 教学示例：UDP 与 TCP：数据报、字节流和套接字
 * 来源：计算机网络（原书第 8 版中文版）
 * 仅用于课程观察；不声称测量真实 CPU、OS 调度或公网网络。
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== UDP 与 TCP：数据报、字节流和套接字 ===");
        try (java.net.ServerSocket server = new java.net.ServerSocket(0);
             java.net.Socket client = new java.net.Socket("127.0.0.1", server.getLocalPort());
             java.net.Socket accepted = server.accept()) {
            client.getOutputStream().write(("tcp-ping" + System.lineSeparator()).getBytes(java.nio.charset.StandardCharsets.UTF_8));
            String received = new String(accepted.getInputStream().readNBytes(8), java.nio.charset.StandardCharsets.UTF_8);
            System.out.println("本机 TCP 数据：" + received.trim());
        }
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }
}
