package com.javaroadmap.csapp.csapp_memory_hierarchy;

/**
 * 教学示例：存储层次与缓存友好访问
 * 来源：CS:APP（第 3 版 Global Edition）Chapter 6
 * 对同一个矩阵分别做行优先与列优先求和：行优先按内存连续方向访问，
 * 列优先每次跳一整行。只观察趋势，不声称精确缓存命中数据。
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

        // 列优先：内层沿 r 变化，每次访问相距一行（约 2KB），更难命中缓存。
        long colStart = System.nanoTime();
        long colSum = 0;
        for (int c = 0; c < matrix[0].length; c++)
            for (int r = 0; r < matrix.length; r++)
                colSum += matrix[r][c];
        long colElapsed = System.nanoTime() - colStart;

        System.out.println("行遍历求和：" + rowSum + "，耗时纳秒：" + rowElapsed);
        System.out.println("列遍历求和：" + colSum + "，耗时纳秒：" + colElapsed);
        System.out.println("提示：两个和必须相等（同一批数据）；单次耗时只用于观察，不能作为可靠 benchmark。");
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }
}
