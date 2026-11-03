package com.javaroadmap.stage03.advanced.equalshashcode;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * equals/hashCode 契约：为什么往 HashSet 里放自定义对象“找不回来”。
 * 对应《On Java 8》第 12 章（散列与哈希码）与第 17 章相关讨论。
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

    // 正确重写 equals 与 hashCode：两方法必须成对出现
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
