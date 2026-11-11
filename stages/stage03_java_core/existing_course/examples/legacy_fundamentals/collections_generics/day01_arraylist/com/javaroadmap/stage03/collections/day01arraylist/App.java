package com.javaroadmap.stage03.collections.day01arraylist;

import java.util.ArrayList;
import java.util.List;

/**
 * 知识点：ArrayList、包装类重载陷阱与边遍历边删的正确姿势。
 *
 * Observe：预测 (1) remove(1) vs remove(Integer.valueOf(1))、(2) 正向删漏元素、(3) 包装类 == 比较的结果。
 */
public class App {
    public static void main(String[] args) {
        // 面向接口编程 + 菱形语法 <>（Java 7+）：左边写 List，将来换实现类不必大改调用代码。
        List<String> names = new ArrayList<>();
        names.add("小明");
        names.add("小红");
        names.add("小刚");

        System.out.println("第一个名字：" + names.get(0));
        System.out.println("列表长度：" + names.size());
        for (int i = 0; i < names.size(); i++) {
            System.out.println("姓名：" + names.get(i));
        }

        // 1. remove(int index) vs remove(Object o) 重载陷阱（见预测题 S03A2）：
        List<Integer> nums = new ArrayList<>();
        nums.add(10);
        nums.add(1);
        nums.add(30);
        nums.remove(1); // 精确匹配 int：删除的是下标 1（值为 1），若列表是 [10,20,30] 则删 20！
        System.out.println("remove(1) 删下标后：" + nums);
        nums.remove(Integer.valueOf(10)); // 传入 Integer 对象：按值删除
        System.out.println("remove(Integer.valueOf(10)) 按值删后：" + nums);

        // 2. 边遍历边删：若用普通正向 for(i=0; i<size; i++) 且删后不 i--，连续匹配元素会漏删！
        List<String> buggy = new ArrayList<>(List.of("A", "X", "X", "B"));
        for (int i = 0; i < buggy.size(); i++) {
            if ("X".equals(buggy.get(i))) {
                buggy.remove(i); // 删掉下标 1 的 X 后，后面紧邻的 X 往前挪到了下标 1，但 i++ 跳到了 2！
            }
        }
        System.out.println("正向删除未回退 i-- 导致漏删：" + buggy);

        // 正确安全写法（JDK 8+ 推荐 removeIf，或倒序遍历 / Iterator.remove()）：
        List<String> safe = new ArrayList<>(List.of("A", "X", "X", "B"));
        safe.removeIf(item -> "X".equals(item));
        System.out.println("removeIf 安全删除：" + safe);

        // 3. 包装类缓存陷阱（IntegerCache 默认 -128~127，上界可由 -XX:AutoBoxCacheMax 调整）：
        //    缓存外的对象身份不属于规范承诺，比较包装类值一律用 equals，不要用 ==。
        Integer c1 = 100, c2 = 100;
        Integer b1 = 200, b2 = 200;
        System.out.println("Integer 100 == 100（命中缓存，规范保证）：" + (c1 == c2));
        System.out.println("Integer 200 == 200（默认配置下不同对象，勿依赖此结论）：" + (b1 == b2));
        System.out.println("Integer 200 equals 200：" + b1.equals(b2));
    }
}
