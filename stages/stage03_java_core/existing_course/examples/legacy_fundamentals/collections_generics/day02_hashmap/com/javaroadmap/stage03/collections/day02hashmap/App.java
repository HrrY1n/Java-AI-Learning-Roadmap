package com.javaroadmap.stage03.collections.day02hashmap;

import java.util.HashMap;
import java.util.Map;

/**
 * 参考示例 / Concept Card：HashMap 按 key 查找。
 * Scenario：如果每次按姓名查成绩都遍历列表，数据越多，查找步骤通常越多。
 * Mental model：key 经过 hash 定位到桶，再比较 key 找到 value；这里假设姓名唯一。
 * Observe：预测查询不存在的 key 会得到什么，以及遍历顺序是否等于插入顺序。
 * Modify：再次 put 同一个姓名并运行，观察旧 value 如何变化。
 * Exercise：独立用 Map 统计一段文本的词频。
 */
public class App {
    public static void main(String[] args) {
        // 需求是“按姓名直接找成绩”，所以用姓名作 key，避免每次线性扫描整个列表。
        HashMap<String, Integer> scores = new HashMap<String, Integer>();

        scores.put("小明", 90);
        scores.put("小红", 95);
        scores.put("小刚", 82);

        System.out.println("小明的分数：" + scores.get("小明"));

        if (scores.containsKey("小红")) {
            System.out.println("找到了小红");
        }

        for (String name : scores.keySet()) {
            System.out.println(name + " -> " + scores.get(name));
        }

        // 遍历三方式：keySet+get（取值要二次查找）、entrySet（一次拿到键值对）、values（只要值）。
        // "键和值都要"时 entrySet 是惯用写法。
        for (Map.Entry<String, Integer> entry : scores.entrySet()) {
            System.out.println("entry：" + entry.getKey() + "/" + entry.getValue());
        }

        // 取不到的键要有兜底：getOrDefault 返回默认值，避免 null 拆箱崩溃（预测题 S03A1）。
        System.out.println("李雷的分数（默认 0）：" + scores.getOrDefault("李雷", 0));

        // HashMap 不承诺 keySet 的遍历顺序；需要稳定顺序时应重新选择结构或显式排序。
    }
}
