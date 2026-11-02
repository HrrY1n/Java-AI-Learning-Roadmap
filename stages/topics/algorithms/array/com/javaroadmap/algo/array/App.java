package com.javaroadmap.algo.array;

/**
 * 数组原理：连续内存空间与随机访问
 * 对应《Hello 算法》第 4 章 4.1 节
 *
 * 核心原理：
 * 1. 数组在内存中占据连续的物理地址空间。
 * 2. 寻址公式：address(i) = base_address + i * element_size
 * 3. 性能权衡：
 *    - 随机访问：O(1)
 *    - 中间插入/删除：需要搬移后续全部元素，时间复杂度 O(n)
 */
public class App {

    // 在指定索引处插入元素（模拟底层动态扩容前的搬移）
    public static void insert(int[] arr, int size, int index, int element) {
        if (index < 0 || index > size || size >= arr.length) {
            throw new IndexOutOfBoundsException("插入位置非法或容量已满");
        }
        // 从后往前逐位后移
        for (int i = size; i > index; i--) {
            arr[i] = arr[i - 1];
        }
        arr[index] = element;
    }

    // 删除指定索引处的元素
    public static void remove(int[] arr, int size, int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("删除位置非法");
        }
        // 从前往后逐位前移覆盖
        for (int i = index; i < size - 1; i++) {
            arr[i] = arr[i + 1];
        }
        arr[size - 1] = 0; // 清理尾部
    }

    public static void main(String[] args) {
        System.out.println("=== 数组原理与内存操作 ===");
        int[] buffer = new int[6];
        buffer[0] = 10;
        buffer[1] = 20;
        buffer[2] = 30;
        int size = 3;

        System.out.println("初始随机访问 index=1：" + buffer[1]);

        // 在 index=1 插入 15
        insert(buffer, size, 1, 15);
        size++;
        System.out.println("插入后 index=1：" + buffer[1] + "，原元素后移至 index=2：" + buffer[2]);

        // 删除 index=1
        remove(buffer, size, 1);
        size--;
        System.out.println("删除后恢复 index=1：" + buffer[1]);

        System.out.println("设计启示：高频查询、固定容量首选数组；高频首尾插入删除需评估链表。");
    }
}
