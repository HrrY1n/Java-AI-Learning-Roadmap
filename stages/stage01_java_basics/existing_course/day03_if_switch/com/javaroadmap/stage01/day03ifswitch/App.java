package com.javaroadmap.stage01.day03ifswitch;

/**
 * 知识点：if-else 决策顺序、短路求值与 switch 选择。
 *
 * Observe：预测 score=95、count=0、day=3 各自走哪个分支，再运行核对。
 * Modify：做两项实验——(1) 把 && 换成单个 & 观察除零崩溃；(2) 删掉 case 1 里的 break 再把 day 改 1。
 */
public class App {
    public static void main(String[] args) {
        int score = 95;

        // if-else 从上到下只命中第一条满足的条件：
        // 若把 score >= 60 写在 score >= 90 前面，95 分会被"及格"提前截胡（条件遮蔽陷阱）。
        if (score >= 90) {
            System.out.println("优秀");
        } else if (score >= 60) {
            System.out.println("及格");
        } else {
            System.out.println("不及格");
        }

        // && 短路求值：左边 count > 0 为 false 时，右边 total / count 根本不执行。
        // 即使还没学数组越界，用纯粹的整数除法就能立刻看见短路保护的意义。
        int count = 0;
        int total = 100;
        if (count > 0 && total / count >= 60) {
            System.out.println("平均分及格");
        }
        System.out.println("短路保护生效：跳过除零运算");

        // switch 按精确值选择入口；记得加 break（或使用 Java 14+ 的箭头语法 case 1 -> ...）。
        int day = 3;
        switch (day) {
            case 1:
                System.out.println("星期一");
                break;
            case 2:
                System.out.println("星期二");
                break;
            case 3:
                System.out.println("星期三");
                break;
            default:
                System.out.println("其他日期");
                break;
        }
    }
}
