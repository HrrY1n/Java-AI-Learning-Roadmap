package com.javaroadmap.algo.queue;

/**
 * 队列（Queue）：先进先出（FIFO）与环形数组设计
 * 对应《Hello 算法》第 5 章 5.2 节
 *
 * 核心原理：
 * 1. 队尾入队（Push/Enqueue），队首出队（Pop/Dequeue）。
 * 2. 普通数组出队需要 O(n) 搬移；使用「双指针 + 取模运算」实现环形队列（Circular Array Queue），
 *    使得入队和出队均为 O(1) 均摊常数复杂度。
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

        System.out.println("核心思考：环形指针利用模运算复用数组前端空闲空间，解决假溢出问题。");
    }
}
