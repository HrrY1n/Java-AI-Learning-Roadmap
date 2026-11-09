package com.javaroadmap.algo.dsbasics;

/**
 * 数据结构选型基础：从“查找”看结构差异
 * 对应《Hello 算法》第 1 章初识算法与第 3 章数据结构分类
 */
public class App {

    // 数组线性查找（不依赖顺序）：返回找到目标所用比较次数（最坏 n 次）
    static int linearScanCount(int[] data, int target) {
        for (int i = 0; i < data.length; i++) {
            if (data[i] == target) return i + 1;
        }
        return data.length;
    }

    // 理想哈希表：忽略冲突时一次探测即可定位
    static int idealHashProbeCount(int[] data, int target) {
        return 1;
    }

    public static void main(String[] args) {
        int[] data = new int[1000];
        for (int i = 0; i < data.length; i++) {
            data[i] = i * 3 + 7;
        }
        int target = data[987];
        System.out.println("线性查找比较次数：" + linearScanCount(data, target));
        System.out.println("理想哈希表探测次数：" + idealHashProbeCount(data, target));
        System.out.println("选型速查：随机读多→数组；首尾增删多→链表；后进先出→栈；先进先出→队列；按键快速查→哈希表；层级关系→树；优先级→堆；多对多关系→图。");
        System.out.println("结构启示：数据结构的选择直接决定操作次数的增长曲线。");
    }
}
