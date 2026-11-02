package com.javaroadmap.algo.stack;

/**
 * 栈（Stack）：后进先出（LIFO）
 * 对应《Hello 算法》第 5 章 5.1 节
 *
 * 经典应用：
 * 1. 函数调用栈（JVM Call Stack）
 * 2. 撤销操作（Undo / Redo）
 * 3. 语法分析与括号匹配
 */
public class App {

    // 简单数组栈实现
    public static class ArrayStack {
        private final int[] data;
        private int top;

        public ArrayStack(int capacity) {
            this.data = new int[capacity];
            this.top = -1;
        }

        public void push(int val) {
            if (top >= data.length - 1) {
                throw new IllegalStateException("栈已满");
            }
            data[++top] = val;
        }

        public int pop() {
            if (isEmpty()) {
                throw new IllegalStateException("栈为空");
            }
            return data[top--];
        }

        public int peek() {
            if (isEmpty()) {
                throw new IllegalStateException("栈为空");
            }
            return data[top];
        }

        public boolean isEmpty() {
            return top == -1;
        }

        public int size() {
            return top + 1;
        }
    }

    // 括号匹配检查
    public static boolean isValidParentheses(String s) {
        char[] stack = new char[s.length()];
        int top = -1;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '(' || c == '[' || c == '{') {
                stack[++top] = c;
            } else {
                if (top == -1) return false;
                char open = stack[top--];
                if (c == ')' && open != '(') return false;
                if (c == ']' && open != '[') return false;
                if (c == '}' && open != '{') return false;
            }
        }
        return top == -1;
    }

    public static void main(String[] args) {
        System.out.println("=== 栈（Stack）原理与应用 ===");
        ArrayStack stack = new ArrayStack(5);
        stack.push(10);
        stack.push(20);
        stack.push(30);

        System.out.println("栈顶元素 peek：" + stack.peek());
        System.out.println("出栈元素 pop：" + stack.pop());
        System.out.println("当前栈大小：" + stack.size());

        // 括号匹配验证
        String validExpr = "{[()]}";
        String invalidExpr = "{[(])}";
        System.out.println("括号合法性 {[()]}：" + isValidParentheses(validExpr));
        System.out.println("括号合法性 {[(])}：" + isValidParentheses(invalidExpr));

        System.out.println("核心特征：入栈出栈皆在单端操作，时间复杂度稳定 O(1)。");
    }
}
