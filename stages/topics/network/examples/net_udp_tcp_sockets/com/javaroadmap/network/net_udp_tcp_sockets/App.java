package com.javaroadmap.network.net_udp_tcp_sockets;

/**
 * 教学示例：UDP 与 TCP：数据报、字节流和套接字
 * 来源：计算机网络（原书第 8 版中文版）第 2.7 节与第 3.1-3.3 节
 * 在本机回环上各做一次真实收发对照：
 * - UDP：无连接，send 后不建立会话；回环上通常可达，但协议本身不确认、不重传。
 * - TCP：先 accept 建立连接，再按字节流读写，有确认与按序交付。
 * 仅用于课程观察；不声称测量公网网络。
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== UDP 与 TCP：数据报、字节流和套接字 ===");
        udpDatagram();
        tcpStream();
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }

    /** UDP 对照：发送方只管发出数据报；接收方绑临时端口等待接收。 */
    private static void udpDatagram() throws Exception {
        System.out.println("--- UDP 数据报 ---");
        try (java.net.DatagramSocket receiver = new java.net.DatagramSocket(0);
             java.net.DatagramSocket sender = new java.net.DatagramSocket()) {
            receiver.setSoTimeout(2000); // 真实网络中数据报可能丢失，这里靠超时兜底
            byte[] payload = "udp-ping".getBytes(java.nio.charset.StandardCharsets.UTF_8);
            // 发送到接收方实际绑定的端口；UDP 没有 accept/connect 的会话过程
            sender.send(new java.net.DatagramPacket(payload, payload.length,
                java.net.InetAddress.getByName("127.0.0.1"), receiver.getLocalPort()));
            byte[] buffer = new byte[64];
            java.net.DatagramPacket incoming = new java.net.DatagramPacket(buffer, buffer.length);
            receiver.receive(incoming);
            String text = new String(incoming.getData(), 0, incoming.getLength(),
                java.nio.charset.StandardCharsets.UTF_8);
            System.out.println("接收方收到数据报：" + text + "（无确认、无重传，丢了就是丢了）");
        }
    }

    /** TCP 对照：服务端 accept 建立连接后，双向按字节流读写。 */
    private static void tcpStream() throws Exception {
        System.out.println("--- TCP 字节流 ---");
        try (java.net.ServerSocket server = new java.net.ServerSocket(0);
             java.net.Socket client = new java.net.Socket("127.0.0.1", server.getLocalPort());
             java.net.Socket accepted = server.accept()) {
            java.io.OutputStream clientOut = client.getOutputStream();
            clientOut.write(("tcp-ping" + System.lineSeparator()).getBytes(java.nio.charset.StandardCharsets.UTF_8));
            clientOut.flush();
            java.io.BufferedReader serverIn = new java.io.BufferedReader(
                new java.io.InputStreamReader(accepted.getInputStream(), java.nio.charset.StandardCharsets.UTF_8));
            String line = serverIn.readLine();
            System.out.println("服务端按字节流读到：" + line + "（先连接、有确认、按序交付）");
        }
    }
}
