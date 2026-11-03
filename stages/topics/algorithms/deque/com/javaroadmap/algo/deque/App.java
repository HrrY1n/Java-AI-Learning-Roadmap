package com.javaroadmap.algo.deque;

import java.util.ArrayDeque;
import java.util.Deque;

/**
 * 双端队列：两端都能插入与取出。
 * 对应《Hello 算法》5.3 节。
 *
 * 场景：奶茶店排队可以正常排队（尾进头出），也允许"会员插队到最前面"（头进）——
 * 队列只支持两端单向进出，双端队列把"头"和"尾"都开放出来。
 */
public class App {
    public static void main(String[] args) {
        Deque<String> deque = new ArrayDeque<>();

        // 两端都能插入：offerLast 从尾进（像队列），offerFirst 从头进（像插队）
        deque.offerLast("普通顾客A");
        deque.offerLast("普通顾客B");
        deque.offerFirst("会员插队");
        System.out.println("两次尾进、一次头进后：" + deque);

        // 两端都能取出
        System.out.println("从头取出：" + deque.pollFirst());
        System.out.println("从尾取出：" + deque.pollLast());
        System.out.println("剩余：" + deque);

        // 同一个类换个用法就是栈：push/pop 都操作头部
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(1);
        stack.push(2);
        stack.push(3);
        System.out.println("当栈用 pop（后进先出）：" + stack.pop());
        System.out.println("新栈顶 peek：" + stack.peek());

        // 当队列用：尾进头出（先进先出）
        Deque<Integer> queue = new ArrayDeque<>();
        queue.offerLast(1);
        queue.offerLast(2);
        queue.offerLast(3);
        System.out.println("当队列用 poll（先进先出）：" + queue.pollFirst());
    }
}
