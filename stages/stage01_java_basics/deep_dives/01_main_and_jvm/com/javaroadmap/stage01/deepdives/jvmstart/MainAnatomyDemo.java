package com.javaroadmap.stage01.deepdives.jvmstart;

/**
 * 深化课 01：main 方法与"从源码到输出"的全过程。
 *
 * 场景：你每天都在点 Run，但 IDE 替你藏掉了三件事——编译、类加载、找 main。
 * 心智模型：javac 把 .java 翻译成平台无关的 .class；java 命令启动 JVM，
 * 在 classpath 里按完整类名找到 .class，加载后调用它的 main，程序结束后 JVM 退出。
 *
 * Observe：先预测下面两个运行方式各打印什么，再运行验证——
 *   1) java -cp out com.javaroadmap.stage01.deepdives.jvmstart.MainAnatomyDemo
 *   2) 同上，但在末尾追加参数： hello 42
 *
 * Modify：把 main 的参数 String[] args 改名 anything 试试（应无影响），
 *         再删掉 static 运行（观察报错信息与 docs/跨平台问题排查.md 第 5 条是否一致）。
 */
public class MainAnatomyDemo {

    // public：JVM 要能从任何地方调用它。
    // static：调用 main 时还没有任何对象存在，它必须属于类本身而不是某个对象。
    // void：main 自身不返回结果；程序的状态通过输出、文件等副作用体现。
    // String[] args：启动命令里跟在类名后面的参数，由 JVM 装进这个字符串数组。
    public static void main(String[] args) {
        System.out.println("main 被调用了，args 长度 = " + args.length);

        for (int i = 0; i < args.length; i++) {
            System.out.println("args[" + i + "] = " + args[i]);
        }

        // 为什么下标写 args.length 而不是 args.length - 1？——i < length 已经保证了 i 最大只到 length - 1。
        // 如果写成 i <= args.length，最后一次循环就会越界（见 03_array_memory 深化课）。
    }
}
