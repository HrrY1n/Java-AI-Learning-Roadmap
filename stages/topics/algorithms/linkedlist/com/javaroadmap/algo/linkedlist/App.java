package com.javaroadmap.algo.linkedlist;

/**
 * 链表原理：离散节点与引用关联
 * 对应《Hello 算法》第 4 章 4.2 节
 *
 * 核心原理：
 * 1. 节点（Node）由「数据域」和「引用域」构成，物理存储不连续。
 * 2. 插入/删除只需修改前后节点的引用指针，开销为 O(1)。
 * 3. 访问第 i 个元素必须从头节点逐一遍历（Traverse），时间复杂度为 O(n)。
 */
public class App {

    // 在 n0 节点之后插入新节点 newNode: O(1)
    public static void insertAfter(ListNode n0, ListNode newNode) {
        ListNode nextNode = n0.next;
        newNode.next = nextNode;
        n0.next = newNode;
    }

    // 删除 n0 节点之后的直接后继: O(1)
    public static void removeAfter(ListNode n0) {
        if (n0.next == null) return;
        ListNode target = n0.next;
        n0.next = target.next;
        target.next = null; // 辅助垃圾回收
    }

    public static void main(String[] args) {
        System.out.println("=== 单向链表设计与指针变迁 ===");
        // 构建初始链表：1 -> 3 -> 4
        ListNode head = new ListNode(1);
        head.next = new ListNode(3);
        head.next.next = new ListNode(4);

        System.out.println("初始链表第二节点：" + head.next.val);

        // 在 head 之后插入 2：1 -> 2 -> 3 -> 4
        insertAfter(head, new ListNode(2));
        System.out.println("插入后第二节点变为：" + head.next.val + "，第三节点仍是：" + head.next.next.val);

        // 删除刚插入的 2：1 -> 3 -> 4
        removeAfter(head);
        System.out.println("删除后恢复第二节点：" + head.next.val);

        System.out.println("权衡总结：链表无预分配空间与搬移代价，但每个节点伴随指针内存开销且不利于 CPU 缓存命中。");
    }
}
