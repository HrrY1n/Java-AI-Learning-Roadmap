package com.javaroadmap.csapp.csapp_network_programming;

/**
 * 教学示例：套接字编程：本机回环的 TCP echo（真实双向回显）
 * 来源：CS:APP（第 3 版 Global Edition）Chapter 11
 * 本示例在本机回环地址上真实建立 TCP 连接并完成一次双向读写；
 * 不声称测量公网网络，也不把回环结果当作生产验证。
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 套接字编程：本机回环的 TCP echo ===");
        // ServerSocket 绑定临时端口（0 表示由操作系统分配），避免与其他服务冲突。
        try (java.net.ServerSocket server = new java.net.ServerSocket(0);
             java.net.Socket client = new java.net.Socket("127.0.0.1", server.getLocalPort());
             java.net.Socket accepted = server.accept()) {
            // 客户端 -> 服务端：写一行文本。TCP 是字节流，必须约定行分隔符作为消息边界。
            java.io.BufferedWriter clientOut = new java.io.BufferedWriter(
                new java.io.OutputStreamWriter(client.getOutputStream(), java.nio.charset.StandardCharsets.UTF_8));
            clientOut.write("ping");
            clientOut.newLine();
            clientOut.flush();

            // 服务端：读一行，然后原样写回——这才是“回显”，而不是只读取。
            java.io.BufferedReader serverIn = new java.io.BufferedReader(
                new java.io.InputStreamReader(accepted.getInputStream(), java.nio.charset.StandardCharsets.UTF_8));
            String received = serverIn.readLine();
            java.io.BufferedWriter serverOut = new java.io.BufferedWriter(
                new java.io.OutputStreamWriter(accepted.getOutputStream(), java.nio.charset.StandardCharsets.UTF_8));
            serverOut.write(received == null ? "" : received);
            serverOut.newLine();
            serverOut.flush();

            // 客户端 <- 服务端：读取回显结果，验证双向通路都已打通。
            java.io.BufferedReader clientIn = new java.io.BufferedReader(
                new java.io.InputStreamReader(client.getInputStream(), java.nio.charset.StandardCharsets.UTF_8));
            String echoed = clientIn.readLine();
            System.out.println("客户端发送：ping");
            System.out.println("服务端收到并原样写回：" + received);
            System.out.println("客户端读到回显：" + echoed);
        }
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }
}
