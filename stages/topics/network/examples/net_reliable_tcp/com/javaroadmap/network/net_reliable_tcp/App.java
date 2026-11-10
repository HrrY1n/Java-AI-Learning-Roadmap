package com.javaroadmap.network.net_reliable_tcp;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 教学示例：计算机网络 3.4-3.5 节——可靠传输状态、累计确认、超时重传与业务幂等边界，外加接收窗口流控。
 * 来源：《计算机网络：自顶向下方法（原书第 8 版）》第 3.4-3.5 节
 * 仅用纯内存事件模型确定性演示协议机制，不声称测量真实广域网丢包率或内核协议栈实现。
 */
public final class App {
    private App() {}

    /** 接收端状态机（简化字节流/分组序号模型 + 应用层幂等对照）。 */
    static final class TcpReceiverSim {
        private int expectedSeq = 1;
        private int rwndBytes = 128; // 接收缓冲区剩余可用窗口（流量控制）
        private final List<Integer> deliveredToApp = new ArrayList<>();

        /** 返回发送端收到的累计 ACK 号（期望收到的下一个序号）。 */
        int onPacketArrive(int seq, int payloadBytes, boolean ackDroppedOnReturn) {
            if (seq == expectedSeq) {
                deliveredToApp.add(seq);
                expectedSeq++;
                rwndBytes = Math.max(0, rwndBytes - payloadBytes);
                System.out.println("  [接收端] 收到按序分组 seq=" + seq + " -> 交付应用层，剩余 rwnd=" + rwndBytes);
            } else if (seq < expectedSeq) {
                // 关键：分组重传到达（之前可能只是 ACK 丢了），传输层识别出重复序号并丢弃，只重发累计 ACK！
                System.out.println("  [接收端] 收到重复分组 seq=" + seq + " -> 传输层去重丢弃，重发累计 ACK=" + expectedSeq);
            } else {
                // 乱序分组暂不按序交付（累计确认维持在当前 expectedSeq）
                System.out.println("  [接收端] 收到乱序分组 seq=" + seq + "（期望 " + expectedSeq + "）-> 触发重复 ACK=" + expectedSeq);
            }
            if (ackDroppedOnReturn) {
                System.out.println("  [网络链路] 回程 ACK=" + expectedSeq + " 在途中丢失！");
                return -1; // 模拟 ACK 丢失，发送方超时
            }
            return expectedSeq;
        }
    }

    /** 对比业务层：如果连接超时断开后客户端重新建链发请求，TCP 序号已重置，必须靠业务幂等键去重。 */
    static final class IdempotentOrderService {
        private final Set<String> processedKeys = new HashSet<>();

        String createOrder(String idempotencyKey, String item) {
            if (!processedKeys.add(idempotencyKey)) {
                return "幂等拦截重复请求（key=" + idempotencyKey + "），不重复扣款下单";
            }
            return "首次下单成功（key=" + idempotencyKey + ", 商品=" + item + "）";
        }
    }

    public static void main(String[] args) {
        System.out.println("=== 3.4-3.5 可靠数据传输 (RDT) 与流控、幂等边界 ===");
        TcpReceiverSim receiver = new TcpReceiverSim();

        // 1. 正常交付 seq=1，但回程 ACK 在网络中丢失
        int ack1 = receiver.onPacketArrive(1, 32, true);
        if (ack1 < 0) {
            System.out.println("[发送端] 等待超时 RTO 到期，触发重传 seq=1");
            int retryAck = receiver.onPacketArrive(1, 32, false);
            System.out.println("[发送端] 重传收到累计 ACK=" + retryAck);
        }

        // 2. 乱序到达 seq=3（seq=2 尚未到），收到重复 ACK=2（快速重传依据：连续收到 3 个重复 ACK 即提前重传 seq=2）
        int ackOutOfOrder = receiver.onPacketArrive(3, 32, false);
        System.out.println("[发送端] 收到重复 ACK=" + ackOutOfOrder + "（seq=2 未被确认，仍需补发）");

        // 3. 补发 seq=2 到达后，累计确认推进
        int ackSeq2 = receiver.onPacketArrive(2, 32, false);
        System.out.println("[发送端] seq=2 补达后收到确认 ACK=" + ackSeq2 + "，当前交付序列=" + receiver.deliveredToApp);

        // 4. TCP 可靠 != 业务安全：若应用读取超时重连发第二次下单请求，必须用业务幂等键
        IdempotentOrderService orderApi = new IdempotentOrderService();
        System.out.println("[业务请求1] " + orderApi.createOrder("req-8801", "Java实战课"));
        System.out.println("[连接超时后重连请求2] " + orderApi.createOrder("req-8801", "Java实战课"));
    }
}
