package com.javaroadmap.stage01.deepdives.arrays;

/**
 * 深化课 03：数组在内存里的样子、length 与下标边界。
 *
 * 场景：day05 用 scores[0] 取第一个元素，用 scores.length 做循环边界。
 * 心智模型：数组是"一段连续的格子 + 一个长度"。
 *   - 变量 scores 里存的不是格子本身，而是"这段格子从哪里开始"的地址；
 *   - 下标是"从起点偏移几个格子"，所以第一个元素是偏移 0；
 *   - length 是元信息，不占下标：合法下标范围是 0 到 length-1。
 *
 * Observe：先预测每一行输出，再运行。第 4 步需要手动取消注释后重新编译运行，
 * 预测它会打印什么、还是直接崩溃。
 */
public class ArrayMemoryDemo {
    public static void main(String[] args) {
        int[] scores = {90, 85, 76, 100};

        System.out.println("1) length = " + scores.length);

        // 首元素与末元素的规范写法。写 scores[4] 会越界——合法下标只到 length-1。
        System.out.println("2) 第一个 = " + scores[0]);
        System.out.println("3) 最后一个 = " + scores[scores.length - 1]);

        // 取消下面注释再运行：ArrayIndexOutOfBoundsException，
        // 注意报错信息会写明 Index 4 out of bounds for length 4——读它！
        // System.out.println(scores[4]);

        // 变量赋值只复制"起点地址"，两个变量指向同一段格子（详见 Stage 02 引用深化课）。
        int[] another = scores;
        another[0] = 0;
        System.out.println("4) 通过 another 改过之后，scores[0] = " + scores[0]);

        // 遍历边界的三种写法，只有第一种推荐：i < length 让边界条件与 length 直接对应。
        int sum = 0;
        for (int i = 0; i < scores.length; i++) {
            sum += scores[i];
        }
        // 注意：由于上面把 scores[0] 改成了 0，这里是 261 而不是 90+85+76+100=351。
        System.out.println("5) sum = " + sum);
    }
}
