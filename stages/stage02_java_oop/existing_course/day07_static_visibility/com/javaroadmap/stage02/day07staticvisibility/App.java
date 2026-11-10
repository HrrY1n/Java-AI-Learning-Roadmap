package com.javaroadmap.stage02.day07staticvisibility;

import com.javaroadmap.stage02.otherpkg.ExternalCaller;
import com.javaroadmap.stage02.otherpkg.SubStudent;

/**
 * 知识点：static 初始化时机、跨包四档可见性与对象可达性（GC 初步）。
 *
 * Observe：观察 static 初始化块的打印位置、同包 vs 跨包/子类能碰到的成员，以及多别名下的 GC 可达性。
 * Modify：打开 SubStudent.java 中关于 base.gradeNote 或 internalTag 的注释行，观察 javac 的精确报错。
 */
public class App {
    public static void main(String[] args) {
        // 首次访问 Student.createdCount 触发类加载与 static {} 初始化（早于任何 new）。
        System.out.println("创建前累计人数：" + Student.createdCount);

        Student a = new Student("小明", 88);
        Student b = new Student("小红", 95);
        System.out.println("创建两人后累计人数：" + Student.createdCount);
        System.out.println("同包访问受保护与包私有成员：" + a.gradeNote + " / tag=" + a.internalTag);
        System.out.println(PackageOnlyHelper.packageTip());

        // 跨包调用者与跨包子类实测（SubStudent 继承自 Student，也会使 createdCount +1 变为 3）：
        System.out.println(ExternalCaller.inspectFromOtherPackage(a));
        SubStudent sub = new SubStudent("小军", 76);
        System.out.println(sub.readProtectedViaSub());

        // 对象可达性与 GC：如果还有别的引用 alias 指向同一对象，仅将 a 置 null 对象依然存活！
        Student alias = a;
        a = null;
        System.out.println("a 置 null 后 alias 仍可达：" + alias.describe());
        alias = null; // 至此，原"小明"对象没有任何强引用可达，进入可被 GC 回收状态（何时回收由 JVM 决定）
        System.out.println("a 撤走引用后累计人数仍是：" + Student.createdCount + "（小明、小红、小军共 3 人）");

        System.out.println("调用类级方法：" + Student.passLine());
    }
}
