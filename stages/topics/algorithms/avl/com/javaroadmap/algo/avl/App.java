package com.javaroadmap.algo.avl;

/**
 * 平衡二叉搜索树（AVL）：插入后检查平衡因子，失衡就旋转修复。
 * 对应《Hello 算法》7.5 节。
 *
 * 场景：BST 在顺序插入时会退化成链表（上一课的边界）；AVL 用旋转
 * 保证任意节点左右子树高度差不超过 1，查找稳定在 O(log n)。
 */
public class App {

    static class Node {
        int val;
        int height; // 以该节点为根的子树高度，叶子为 1
        Node left, right;

        Node(int val) {
            this.val = val;
            this.height = 1;
        }
    }

    static int height(Node n) {
        return n == null ? 0 : n.height;
    }

    static void update(Node n) {
        n.height = 1 + Math.max(height(n.left), height(n.right));
    }

    // 平衡因子 = 左子树高 - 右子树高；AVL 要求每个节点 |bf| <= 1
    static int balanceFactor(Node n) {
        return n == null ? 0 : height(n.left) - height(n.right);
    }

    // 右旋：左子树过高时，让左孩子顶替自己
    static Node rotateRight(Node y) {
        Node x = y.left;
        y.left = x.right;
        x.right = y;
        update(y);
        update(x);
        return x;
    }

    // 左旋：右子树过高时的镜像操作
    static Node rotateLeft(Node x) {
        Node y = x.right;
        x.right = y.left;
        y.left = x;
        update(x);
        update(y);
        return y;
    }

    static Node insert(Node node, int val) {
        if (node == null) return new Node(val);
        if (val < node.val) node.left = insert(node.left, val);
        else if (val > node.val) node.right = insert(node.right, val);
        else return node; // 相等值不插入

        update(node);
        int bf = balanceFactor(node);
        if (bf > 1 && val < node.left.val) return rotateRight(node); // LL
        if (bf < -1 && val > node.right.val) return rotateLeft(node); // RR
        if (bf > 1) { // LR：先左旋变成 LL，再右旋
            node.left = rotateLeft(node.left);
            return rotateRight(node);
        }
        if (bf < -1) { // RL：先右旋变成 RR，再左旋
            node.right = rotateRight(node.right);
            return rotateLeft(node);
        }
        return node;
    }

    static void inorder(Node node, StringBuilder out) {
        if (node == null) return;
        inorder(node.left, out);
        out.append(node.val).append(' ');
        inorder(node.right, out);
    }

    public static void main(String[] args) {
        Node root = null;
        for (int v = 1; v <= 7; v++) root = insert(root, v); // 恰是 BST 退化的输入
        StringBuilder out = new StringBuilder();
        inorder(root, out);
        System.out.println("顺序插入 1..7 后中序=" + out.toString().trim());
        System.out.println("树高=" + height(root) + "（普通 BST 退化成 7，AVL 稳定在 3）");
        System.out.println("根节点=" + root.val + "（旋转把中段值 4 顶成了根）");
    }
}
