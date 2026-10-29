package com.javaroadmap.stage03.deepdives.collectionchoice;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 深化课 01：List / Map / Set——按"怎么访问数据"选择结构。
 *
 * 场景：day01~03 分别学了三个集合。真正的难点是需求来了先选哪个。
 * 判断只看一个问题：数据"怎么被找回来"？
 *   - 按位置/按插入顺序访问、允许重复     -> List
 *   - 按唯一标识直接定位                  -> Map
 *   - 只关心"有没有"、自动去重            -> Set
 *
 * 心智模型：同一个"找小红的成绩"，List 是从头问到尾（问 N 次），
 * Map 是报门牌直达（问 1 次）。数据量越大，差别越不是风格问题而是能力问题。
 *
 * Observe：先预测三段输出，再运行。
 */
public class CollectionChoiceDemo {
    public static void main(String[] args) {
        // 场景A：按顺序展示成绩单（位置有意义、允许同名）→ List。
        List<String> roster = new ArrayList<String>();
        roster.add("小明");
        roster.add("小红");
        roster.add("小明");                    // 同名同姓真实存在，List 允许
        System.out.println("1) 第 2 个是：" + roster.get(1) + "，共 " + roster.size() + " 条");

        // 场景B：按姓名查成绩（键唯一、要快）→ Map。
        Map<String, Integer> scores = new HashMap<String, Integer>();
        scores.put("小明", 90);
        scores.put("小红", 95);
        System.out.println("2) 小红的成绩：" + scores.get("小红"));
        System.out.println("3) 不存在的人：" + scores.get("小刚"));    // 预测：null 还是异常？

        // 场景C：收集"来过图书馆的学号"，重复签到只算一次 → Set。
        Set<String> visitorIds = new HashSet<String>();
        visitorIds.add("S001");
        visitorIds.add("S002");
        visitorIds.add("S001");                // 重复添加被忽略
        System.out.println("4) 到馆人数：" + visitorIds.size());

        // 混合使用是常态：List 保存顺序，Map 加速查找——各干各的活。
        List<String> order = new ArrayList<String>(scores.keySet());
        System.out.println("5) 键的集合转成列表：" + order.size() + " 个键（顺序不保证）");
    }
}
