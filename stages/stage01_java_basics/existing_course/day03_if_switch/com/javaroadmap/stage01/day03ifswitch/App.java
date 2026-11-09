package com.javaroadmap.stage01.day03ifswitch;

/**
 * 知识点：if 判断、switch 选择与逻辑运算符。
 *
 * 心智模型：if-else 从上到下找第一个满足条件的分支；switch 按值选入口。
 * 每条路径都是一条需要单独验证的道路——修改一个条件，验证一次。
 * Observe：先预测 score=95、day=3 各走哪个分支，再运行核对；
 * 然后做课程"修改一个条件"的两个实验（score 边界 / 删一个 break）。
 */
public class App {
    public static void main(String[] args) {
        int score = 95;

        // 分支从上到下只走第一条满足的：95 >= 90 命中后，后面的分支不再判断。
        if (score >= 90) {
            System.out.println("优秀");
        } else if (score >= 60) {
            // 边界实验：把 95 改成 60 和 59，体会 >= 60 与 > 60 的差别。
            System.out.println("及格");
        } else {
            System.out.println("不及格");
        }

        // && 短路：左边为 false 时右边不执行——越界访问根本不会发生
        //（预测题 A8 验证的正是这个机制；换成单个 & 试试，会抛越界异常）。
        int[] scores = new int[2];
        if (scores.length > 2 && scores[2] >= 60) {
            System.out.println("不会走到这里");
        }
        System.out.println("短路保护生效：越界访问被跳过");

        // switch 按值选入口；break 负责跳出，删掉一个 break 试试"掉"进下一个 case。
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
