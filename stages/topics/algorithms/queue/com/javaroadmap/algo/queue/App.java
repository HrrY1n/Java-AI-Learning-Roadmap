package com.javaroadmap.algo.queue;

/**
 * 队列（Queue）：先进先出（FIFO）与环形数组设计
 * 对应《Hello 算法》第 5 章 5.2 节
 *
 * 核心原理：
 * 1. 队尾入队（Push/Enqueue），队首出队（Pop/Dequeue）。
 * 2. 普通数组出队需要 O(n) 搬移；使用「双指针 + 取模运算」实现环形队列（Circular Array Queue），
 *    使得入队和出队均为 O(1) 均摊常数复杂度。
 *
 * 判空判满方案说明：环形队列有两种主流判满方案。
 * 本实现采用「size 计数法」——额外维护 size 字段，容量全部可用（capacity 个槽位可存 capacity 个元素），
 * 判空为 size == 0、判满为 size == capacity；空队列操作直接抛出 IllegalStateException，
 * 不使用 -1 之类的返回值哨兵，避免与合法元素值混淆。
 * 另一种常见方案是「预留空位法」——牺牲一个槽位，用 (rear + 1) % capacity == front 判满，
 * 网站交互图解采用该方案演示，两者都是正确的环形队列实现，注意不要混为一谈。
 */
public class App {

    public static class CircularQueue {
        private final int[] data;
        private int front; // 队首指针
        private int size;  // 队列当前长度
        private final int capacity;

        public CircularQueue(int capacity) {
            this.capacity = capacity;
            this.data = new int[capacity];
            this.front = 0;
            this.size = 0;
        }

        public void push(int val) {
            if (size == capacity) {
                throw new IllegalStateException("队列已满");
            }
            int rear = (front + size) % capacity;
            data[rear] = val;
            size++;
        }

        public int pop() {
            if (isEmpty()) {
                throw new IllegalStateException("队列为空");
            }
            int val = data[front];
            front = (front + 1) % capacity;
            size--;
            return val;
        }

        public int peek() {
            if (isEmpty()) {
                throw new IllegalStateException("队列为空");
            }
            return data[front];
        }

        public boolean isEmpty() {
            return size == 0;
        }

        public int size() {
            return size;
        }
    }

    public static void main(String[] args) {
        System.out.println("=== 环形数组队列原理与实现 ===");
        CircularQueue queue = new CircularQueue(4);
        queue.push(100);
        queue.push(200);
        queue.push(300);

        System.out.println("队首 peek：" + queue.peek());
        System.out.println("出队 pop：" + queue.pop());
        System.out.println("当前队列长度：" + queue.size());

        // 环形回绕入队
        queue.push(400);
        queue.push(500);
        System.out.println("回绕后队首出队：" + queue.pop());
        System.out.println("最终队列长度：" + queue.size());

        // 边界观察：队满与队空都通过异常显式暴露，而不是返回 -1 之类的哨兵值
        CircularQueue boundary = new CircularQueue(2);
        boundary.push(1);
        boundary.push(2);
        try {
            boundary.push(3);
        } catch (IllegalStateException e) {
            System.out.println("队满保护（size == capacity）：" + e.getMessage());
        }
        boundary.pop();
        boundary.pop();
        try {
            boundary.peek();
        } catch (IllegalStateException e) {
            System.out.println("队空保护（size == 0）：" + e.getMessage());
        }

        System.out.println("核心思考：环形指针利用模运算复用数组前端空闲空间，解决假溢出问题。");
    }
}
