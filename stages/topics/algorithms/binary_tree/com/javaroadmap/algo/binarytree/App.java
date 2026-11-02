package com.javaroadmap.algo.binarytree;

import java.util.ArrayDeque;
import java.util.Deque;

/**
 * 二叉树与四种遍历
 * 对应《Hello 算法》第 7 章
 */
public class App {

    static class TreeNode {
        final int val;
        TreeNode left;
        TreeNode right;

        TreeNode(int val) {
            this.val = val;
        }
    }

    // 前序：根 → 左 → 右
    static void preOrder(TreeNode n, StringBuilder out) {
        if (n == null) return;
        out.append(n.val).append(' ');
        preOrder(n.left, out);
        preOrder(n.right, out);
    }

    // 中序：左 → 根 → 右
    static void inOrder(TreeNode n, StringBuilder out) {
        if (n == null) return;
        inOrder(n.left, out);
        out.append(n.val).append(' ');
        inOrder(n.right, out);
    }

    // 后序：左 → 右 → 根
    static void postOrder(TreeNode n, StringBuilder out) {
        if (n == null) return;
        postOrder(n.left, out);
        postOrder(n.right, out);
        out.append(n.val).append(' ');
    }

    // 层序：借助队列逐层扩散（广度优先）
    static void levelOrder(TreeNode root, StringBuilder out) {
        if (root == null) return;
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            TreeNode n = queue.poll();
            out.append(n.val).append(' ');
            if (n.left != null) queue.add(n.left);
            if (n.right != null) queue.add(n.right);
        }
    }

    public static void main(String[] args) {
        //        1
        //       / \
        //      2   3
        //     / \   \
        //    4   5   6
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);
        root.right.right = new TreeNode(6);
        StringBuilder pre = new StringBuilder();
        StringBuilder in = new StringBuilder();
        StringBuilder post = new StringBuilder();
        StringBuilder level = new StringBuilder();
        preOrder(root, pre);
        inOrder(root, in);
        postOrder(root, post);
        levelOrder(root, level);
        System.out.println("前序遍历：" + pre.toString().trim());
        System.out.println("中序遍历：" + in.toString().trim());
        System.out.println("后序遍历：" + post.toString().trim());
        System.out.println("层序遍历：" + level.toString().trim());
        System.out.println("核心机制：递归遍历体现深度优先，层序遍历借助队列实现广度优先。");
    }
}
