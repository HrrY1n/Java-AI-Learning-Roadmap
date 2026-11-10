package com.javaroadmap.stage03.answers;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * 练习"优秀名单双版本"参考答案：Stream 版与 for 版语义完全等价。
 *
 * 对照关系（for 行 ↔ 流水线阶段）：
 *   for 里 if (score >= 90) continue  ↔  filter(score -> score >= 90)
 *   挑出 name                          ↔  map(names[i]) / 无需（过滤下标后取名）
 *   收集进 result 列表                  ↔  collect(Collectors.toList())
 * Stream 版没有外部可变变量：中间过程不存在"累积中的列表"。
 */
public class ExcellentStatsLabAnswer {

    /** 演示数据：把两个数组换成题目用例中的取值再运行核对。 */
    static final String[] NAMES = {"张三", "小红", "小刚", "小雪"};
    static final int[] SCORES = {88, 95, 55, 90};

    public static void main(String[] args) {
        System.out.println("Stream 版：" + listExcellentStream());
        System.out.println("for 版：" + listExcellentFor());
    }

    /** Stream 版：filter 保留"分数 >= 90"的下标，映射成姓名后收集；无外部可变变量。 */
    static List<String> listExcellentStream() {
        return IntStream.range(0, SCORES.length)
                .filter(i -> SCORES[i] >= 90)
                .mapToObj(i -> NAMES[i])
                .collect(Collectors.toList());
    }

    /** for 版：与 Stream 版同一条语义路径，注意空数组直接得到空列表。 */
    static List<String> listExcellentFor() {
        List<String> result = new ArrayList<String>();
        for (int i = 0; i < SCORES.length; i++) {
            if (SCORES[i] >= 90) {
                result.add(NAMES[i]);
            }
        }
        return result;
    }
}
