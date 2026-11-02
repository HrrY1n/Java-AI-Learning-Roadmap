package com.javaroadmap.algo.hashtable;

import java.util.ArrayList;
import java.util.List;

/**
 * 哈希表：哈希函数定位 + 拉链法解决冲突
 * 对应《Hello 算法》第 6 章
 */
public class App {

    static class Pair {
        final String key;
        int value;
        Pair(String key, int value) {
            this.key = key;
            this.value = value;
        }
    }

    // 简化哈希表：固定桶数组 + 拉链法
    static class SimpleHashMap {
        private final List<Pair>[] buckets;

        SimpleHashMap(int capacity) {
            buckets = new List[capacity];
            for (int i = 0; i < capacity; i++) {
                buckets[i] = new ArrayList<>();
            }
        }

        int indexFor(String key) {
            return Math.floorMod(key.hashCode(), buckets.length);
        }

        void put(String key, int value) {
            List<Pair> chain = buckets[indexFor(key)];
            for (Pair p : chain) {
                if (p.key.equals(key)) {
                    p.value = value; // 已存在则覆盖更新
                    return;
                }
            }
            chain.add(new Pair(key, value)); // 冲突时追加到同一条链
        }

        Integer get(String key) {
            for (Pair p : buckets[indexFor(key)]) {
                if (p.key.equals(key)) return p.value;
            }
            return null;
        }

        int maxChainLength() {
            int max = 0;
            for (List<Pair> chain : buckets) {
                max = Math.max(max, chain.size());
            }
            return max;
        }
    }

    public static void main(String[] args) {
        SimpleHashMap map = new SimpleHashMap(8);
        map.put("apple", 5);
        map.put("banana", 3);
        map.put("cherry", 9);
        System.out.println("get(apple)：" + map.get("apple"));
        System.out.println("get(banana)：" + map.get("banana"));
        map.put("apple", 6); // 覆盖更新
        System.out.println("覆盖后 get(apple)：" + map.get("apple"));
        System.out.println("get(missing)：" + map.get("missing"));
        System.out.println("最大冲突链长度：" + map.maxChainLength());
        System.out.println("核心机制：哈希函数把键映射到桶下标，冲突用拉链法挂在同一桶内。");
    }
}
