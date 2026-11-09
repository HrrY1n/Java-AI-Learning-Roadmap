package com.javaroadmap.stage03.collections.day01arraylist;

import java.util.ArrayList;

/**
 * 知识点：ArrayList——可自动扩容的列表。
 *
 * 心智模型：数组是"固定长度的格子"，ArrayList 是"会自动换更大格子的数组"。
 * get/size 是 O(1)（数组直达），中间插入删除是 O(n)（整体搬移）。
 *
 * Observe：先预测三段输出，再运行核对。
 * Modify：把 add 的顺序换一换，看 get(0) 变成谁；把 get(3) 改进来试试越界。
 */
public class App {
    public static void main(String[] args) {
        // 泛型参数 <String> 约定"这个列表只装字符串"：add(123) 在编译期就被拒绝。
        ArrayList<String> names = new ArrayList<String>();

        names.add("小明");
        names.add("小红");
        names.add("小刚");

        // get(0) 是直达格子，不是"找第一个"——顺序由 add 的先后决定。
        System.out.println("第一个名字：" + names.get(0));
        System.out.println("列表长度：" + names.size());

        // 下标 for 遍历是安全的删除姿势；千万不要在 for-each 里 names.remove(...)
        // ——那会抛 ConcurrentModificationException（见预测题 S03A6）。
        // 按值删除还有重载陷阱：remove(1) 删的是"下标 1"，不是"值 1"（见 S03A2）。
        for (int i = 0; i < names.size(); i++) {
            System.out.println("姓名：" + names.get(i));
        }
    }
}
