package com.javaroadmap.stage03.advanced.enums;

/**
 * 枚举：受限的常量类型，可携带行为。
 * 对应《On Java 8》第 22 章（枚举）。
 */
public class App {

    enum OrderStatus {
        NEW {
            @Override
            boolean canCancel() {
                return true;
            }
        },
        PAID {
            @Override
            boolean canCancel() {
                return true;
            }
        },
        SHIPPED {
            @Override
            boolean canCancel() {
                return false;
            }
        };

        // 每个常量可以有自己的行为实现
        abstract boolean canCancel();
    }

    public static void main(String[] args) {
        for (OrderStatus status : OrderStatus.values()) {
            System.out.println(status + " 可取消：" + status.canCancel());
        }
        OrderStatus current = OrderStatus.valueOf("PAID");
        System.out.println("当前状态：" + current + "，序号：" + current.ordinal());
        System.out.println("要点：枚举是受限但可携带行为的类型，编译器保证取值范围。");
    }
}
