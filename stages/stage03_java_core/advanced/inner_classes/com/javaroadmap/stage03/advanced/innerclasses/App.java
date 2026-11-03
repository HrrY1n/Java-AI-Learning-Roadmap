package com.javaroadmap.stage03.advanced.innerclasses;

/**
 * 内部类：成员内部类、静态嵌套类与匿名类。
 * 对应《On Java 8》第 11 章（内部类）。
 */
public class App {

    // 外部类持有私有状态，内部类可以直接访问
    static class CoffeeMachine {
        private int water = 100;

        // 成员内部类：非 static，持有外部类引用
        class Brewer {
            String brew() {
                water -= 10;
                return "一杯咖啡，剩余水量 " + water;
            }
        }

        // 静态嵌套类：不持有外部类引用，行为上更像独立的辅助类型
        static class Cleaner {
            String clean() {
                return "清洗完成（静态嵌套类，无需外部实例）";
            }
        }
    }

    public static void main(String[] args) {
        CoffeeMachine machine = new CoffeeMachine();
        CoffeeMachine.Brewer brewer = machine.new Brewer();
        System.out.println(brewer.brew());
        System.out.println(brewer.brew());

        CoffeeMachine.Cleaner cleaner = new CoffeeMachine.Cleaner();
        System.out.println(cleaner.clean());

        // 匿名类：实现接口的一次性内联实现，回调场景常见
        Runnable beep = new Runnable() {
            @Override
            public void run() {
                System.out.println("匿名类：咖啡好了，请取餐");
            }
        };
        beep.run();
        System.out.println("要点：内部类能访问外部类私有成员；不需要外部引用时优先静态嵌套类。");
    }
}
