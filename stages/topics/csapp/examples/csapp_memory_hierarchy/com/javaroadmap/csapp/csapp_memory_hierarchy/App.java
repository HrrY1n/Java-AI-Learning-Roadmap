package com.javaroadmap.csapp.csapp_memory_hierarchy;

/**
 * 教学示例：存储层次与缓存友好访问
 * 来源：CS:APP（第 3 版 Global Edition）
 * 仅用于课程观察；不声称测量真实 CPU、OS 调度或公网网络。
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 存储层次与缓存友好访问 ===");
        int[][] matrix = new int[512][512];
        for (int r = 0; r < matrix.length; r++)
            for (int c = 0; c < matrix[r].length; c++)
                matrix[r][c] = (r * matrix[r].length + c) % 101;
        long rowStart = System.nanoTime();
        long rowSum = 0;
        for (int[] row : matrix) for (int value : row) rowSum += value;
        long rowElapsed = System.nanoTime() - rowStart;
        System.out.println("行遍历求和：" + rowSum + "，耗时纳秒：" + rowElapsed);
        System.out.println("提示：单次耗时只用于观察，不能作为可靠 benchmark。");
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }
}
