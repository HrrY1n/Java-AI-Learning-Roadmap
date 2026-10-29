package com.javaroadmap.stage03.deepdives.lambdastream;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 深化课 05：Lambda 与 Stream——"描述要什么"而不是"一步步怎么拿"。
 *
 * 场景：day01~03 学了语法。本课建立两个心智模型：
 *   Lambda = "一段可传递的行为"，是单方法接口的简写；
 *   Stream = "一条流水线"，source -> 中间操作（惰性，不执行）-> 终止操作（一次性执行）。
 * 与普通循环对照着理解：循环描述"怎么拿"，Stream 描述"要什么"。
 *
 * Observe：先预测输出，再运行；重点预测"不调用终止操作时 filter 执行没有"。
 */
public class LambdaStreamDemo {
    public static void main(String[] args) {
        List<String> names = new ArrayList<String>();
        names.add("小明");
        names.add("张三丰");
        names.add("小红");

        // 第一段：Lambda 是"行为参数"。接口 Calculator 在 day01 已见过；这里换成更常用的场景：
        // 把"怎么比较两个名字"作为参数传给方法。
        String longer = pickBy(names, "张三丰", (a, b) -> a.length() >= b.length() ? a : b);
        System.out.println("1) 较长的名字：" + longer);

        // 第二段：Stream 流水线。中间操作不执行，终止操作触发整条链。
        List<String> result = names.stream()
                .filter(n -> n.length() >= 2)          // 中间：留下长度>=2 的
                .map(n -> "学生:" + n)                  // 中间：一一转换
                .collect(Collectors.toList());         // 终止：此刻整条链才开始跑
        System.out.println("2) " + result);

        // 第三段：验证"惰性"——只搭流水线不接终止操作，peek 不会输出任何东西。
        System.out.println("3) 搭一条不接终点的流水线（下面没有 peek 输出是正常的）：");
        names.stream()
                .peek(n -> System.out.println("   经过： " + n))   // peek 专为观察设计
                .filter(n -> n.length() >= 3);         // 没有终止操作 => 整条链从未执行

        // 第四段：聚合终止操作直接给"业务答案"。
        boolean allShort = names.stream().allMatch(n -> n.length() <= 3);
        System.out.println("4) 是否全都不超过 3 个字：" + allShort);
    }

    // 接口只有一个方法 => 可以用 Lambda 实现它的"那个方法"。
    interface Picker {
        String pick(String a, String b);
    }

    static String pickBy(List<String> list, String other, Picker picker) {
        String best = other;
        for (String item : list) {
            best = picker.pick(item, best);    // 行为由调用方注入，方法本身不关心规则
        }
        return best;
    }
}
