package com.javaroadmap.stage03.deepdives.genericswhy;

import java.util.ArrayList;
import java.util.List;

/**
 * 深化课 02：泛型——为什么集合都要带尖括号。
 *
 * 场景：day01 的 ArrayList<String>、day04 自制的 Box<T> 都用了尖括号。
 * 本课用"不用泛型的世界"作对照，解释泛型解决的两个问题：
 *   1) 取出来的东西类型未知，必须强转且容易错；
 *   2) 类型错误被推迟到运行时才爆炸。
 *
 * 心智模型：泛型是"给容器贴的类型标签"。
 *   List<String> 里只装 String——写错类型在编译期就被拒绝；
 *   标签只存在于编译期，运行时全部消失（类型擦除，P1 了解即可）。
 *
 * Observe：先预测编译结果与输出，再运行。
 */
public class GenericsWhyDemo {
    public static void main(String[] args) {
        // 第一段：没有泛型的旧写法（raw type），什么都能塞。
        ArrayList rawList = new ArrayList();
        rawList.add("字符串");
        rawList.add(42);                       // 编译器无法阻止：标签不存在
        Object first = rawList.get(0);
        // 取出来只知道是 Object，用之前必须强转——转错就是运行时 ClassCastException。
        String s = (String) first;
        System.out.println("1) raw 取出并强转：" + s);

        // 第二段：有泛型——类型约定写进代码，错误当场暴露。
        List<String> names = new ArrayList<String>();
        names.add("小明");
        // names.add(42);    // 取消注释：编译失败。错误从"运行时崩溃"提前到"写代码的瞬间"
        String got = names.get(0);             // 不用强转：编译器知道里面是 String
        System.out.println("2) 泛型取出：" + got);

        // 第三段：泛型方法——一个方法适配多种类型，标签当参数传递。
        System.out.println("3) " + pickFirst(names, "<空>"));
        List<Integer> nums = new ArrayList<Integer>();
        nums.add(7);
        System.out.println("4) " + pickFirst(nums, -1));
    }

    // <T> 声明"这个方法有个类型标签 T"；返回 T 意味着"返回的东西和你给的列表装的同一类"。
    static <T> T pickFirst(List<T> list, T fallback) {
        if (list.isEmpty()) {
            return fallback;                   // 空列表给兜底值，避免 null（见异常深化课）
        }
        return list.get(0);
    }
}
