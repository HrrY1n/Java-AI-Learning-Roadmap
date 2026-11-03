package com.javaroadmap.algo.bst;

/**
 * 二叉搜索树：任意节点满足"左子树 < 根 < 右子树"。
 * 对应《Hello 算法》7.4 节。
 *
 * 场景：字典/通讯录——查一个词时，比较一次就能淘汰一半候选。
 */
public class App {

    static class Node {
        int val;
        Node left, right;

        Node(int val) {
            this.val = val;
        }
    }

    // 插入：沿"小于走左、大于走右"走到空位挂上（相等值不重复插入）
    static Node insert(Node root, int val) {
        if (root == null) return new Node(val);
        if (val < root.val) root.left = insert(root.left, val);
        else if (val > root.val) root.right = insert(root.right, val);
        return root;
    }

    // 查找：每比较一次淘汰一半，最多走树高步
    static boolean search(Node root, int target) {
        while (root != null) {
            if (target == root.val) return true;
            root = target < root.val ? root.left : root.right;
        }
        return false;
    }

    // 删除：按孩子数量分三种情况；两个孩子时用中序后继（右子树最小值）顶替
    static Node remove(Node root, int val) {
        if (root == null) return null;
        if (val < root.val) {
            root.left = remove(root.left, val);
            return root;
        }
        if (val > root.val) {
            root.right = remove(root.right, val);
            return root;
        }
        if (root.left == null) return root.right; // 叶子或只有右孩子
        if (root.right == null) return root.left; // 只有左孩子
        Node successor = root.right;              // 两个孩子：找右子树最左节点
        while (successor.left != null) successor = successor.left;
        root.val = successor.val;
        root.right = remove(root.right, successor.val);
        return root;
    }

    static int height(Node root) {
        if (root == null) return 0;
        return 1 + Math.max(height(root.left), height(root.right));
    }

    static void inorder(Node root, StringBuilder out) {
        if (root == null) return;
        inorder(root.left, out);
        out.append(root.val).append(' ');
        inorder(root.right, out);
    }

    static Node build(int... values) {
        Node root = null;
        for (int v : values) root = insert(root, v);
        return root;
    }

    static void show(String label, Node root) {
        StringBuilder out = new StringBuilder();
        inorder(root, out);
        System.out.println(label + "中序=" + out.toString().trim() + "，树高=" + height(root));
    }

    public static void main(String[] args) {
        Node root = build(7, 3, 9, 1, 5, 8, 10);
        show("建树后：", root);
        System.out.println("查找 5：" + search(root, 5) + "；查找 6：" + search(root, 6));

        root = remove(root, 1); // 情况一：叶子，直接摘掉
        show("删除叶子 1：", root);
        root = remove(root, 9); // 情况三：有 8、10 两个孩子
        show("删除两孩子的 9：", root);

        // 边界：按顺序插入会让树退化成"链表"，查找从 O(log n) 退到 O(n)
        Node degenerated = build(1, 2, 3, 4, 5, 6, 7);
        show("顺序插入 1..7：", degenerated);
    }
}
