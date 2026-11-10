package com.javaroadmap.stage03.advanced.equalshashcode;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * equals/hashCode 契约与两大真实故障现场：
 * 1) 只重写 equals 不重写 hashCode → HashSet 先按 hashCode 找桶，桶都错了根本调不到 equals！
 * 2) 可变字段做 key/放入 HashSet 后再修改 → hashCode 变了，新位置找不着、旧位置删不掉（内存泄漏）。
 */
public class App {

    // 未重写 equals/hashCode：比较的是引用
    static class PointRaw {
        final int x;
        final int y;

        PointRaw(int x, int y) {
            this.x = x;
            this.y = y;
        }
    }

    // 反例一：只重写 equals 不重写 hashCode（继承了 Object 的地址哈希，不同对象大概率进不同桶）
    static class PointEqualsOnly {
        final int x;
        final int y;

        PointEqualsOnly(int x, int y) {
            this.x = x;
            this.y = y;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof PointEqualsOnly)) return false;
            PointEqualsOnly p = (PointEqualsOnly) o;
            return x == p.x && y == p.y;
        }
    }

    // 反例二：字段可变且参与 hashCode——放入 HashSet 后改字段，对象就“失踪”了
    static class MutableKey {
        int code;

        MutableKey(int code) {
            this.code = code;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof MutableKey)) return false;
            return code == ((MutableKey) o).code;
        }

        @Override
        public int hashCode() {
            return Objects.hash(code);
        }
    }

    // 正确重写 equals 与 hashCode：两方法成对出现，且尽量用不可变（final）字段参与计算
    static class Point {
        final int x;
        final int y;

        Point(int x, int y) {
            this.x = x;
            this.y = y;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Point)) return false;
            Point p = (Point) o;
            return x == p.x && y == p.y;
        }

        @Override
        public int hashCode() {
            return Objects.hash(x, y);
        }
    }

    public static void main(String[] args) {
        Set<PointRaw> rawSet = new HashSet<>();
        rawSet.add(new PointRaw(1, 2));
        System.out.println("未重写 equals，集合里查询 new PointRaw(1, 2)："
                + rawSet.contains(new PointRaw(1, 2)));

        // 反例一实测：equals 返回 true，但因为没重写 hashCode，HashSet 查不到！
        Set<PointEqualsOnly> halfSet = new HashSet<>();
        halfSet.add(new PointEqualsOnly(1, 2));
        System.out.println("只重写 equals 未重写 hashCode 查询 (1, 2)："
                + halfSet.contains(new PointEqualsOnly(1, 2)));

        // 反例二实测：放进 HashSet 后修改参与 hashCode 的字段，对象再也查不到也删不掉
        Set<MutableKey> mutableSet = new HashSet<>();
        MutableKey key = new MutableKey(10);
        mutableSet.add(key);
        key.code = 99;
        System.out.println("修改可变字段后 contains(key)：" + mutableSet.contains(key)
                + "，集合 size 仍是：" + mutableSet.size());

        Set<Point> pointSet = new HashSet<>();
        pointSet.add(new Point(1, 2));
        System.out.println("重写 equals/hashCode 后查询 (1, 2)："
                + pointSet.contains(new Point(1, 2)));

        Point a = new Point(3, 4);
        Point b = new Point(3, 4);
        System.out.println("equals 相等：" + a.equals(b));
        System.out.println("hashCode 相同：" + (a.hashCode() == b.hashCode()));
        System.out.println("契约要点：equals 相等则 hashCode 必须相同；反之不要求。");
    }
}
