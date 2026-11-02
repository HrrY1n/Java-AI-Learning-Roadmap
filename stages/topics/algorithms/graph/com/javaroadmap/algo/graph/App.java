package com.javaroadmap.algo.graph;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 图的邻接表存储与 BFS/DFS 遍历
 * 对应《Hello 算法》第 9 章
 */
public class App {

    static void dfs(Map<String, List<String>> graph, String cur, List<String> visited, StringBuilder out) {
        visited.add(cur);
        out.append(cur).append(' ');
        for (String next : graph.get(cur)) {
            if (!visited.contains(next)) {
                dfs(graph, next, visited, out);
            }
        }
    }

    public static void main(String[] args) {
        // 无向图：A-B、A-C、B-D、C-D、D-E
        Map<String, List<String>> graph = new LinkedHashMap<>();
        graph.put("A", new ArrayList<>(List.of("B", "C")));
        graph.put("B", new ArrayList<>(List.of("A", "D")));
        graph.put("C", new ArrayList<>(List.of("A", "D")));
        graph.put("D", new ArrayList<>(List.of("B", "C", "E")));
        graph.put("E", new ArrayList<>(List.of("D")));

        // 广度优先：借助队列逐层扩散
        StringBuilder bfs = new StringBuilder();
        Deque<String> queue = new ArrayDeque<>();
        List<String> visitedBfs = new ArrayList<>();
        queue.add("A");
        visitedBfs.add("A");
        while (!queue.isEmpty()) {
            String cur = queue.poll();
            bfs.append(cur).append(' ');
            for (String next : graph.get(cur)) {
                if (!visitedBfs.contains(next)) {
                    visitedBfs.add(next);
                    queue.add(next);
                }
            }
        }

        // 深度优先：沿一条路径走到底再回溯
        StringBuilder dfsPath = new StringBuilder();
        dfs(graph, "A", new ArrayList<>(), dfsPath);

        System.out.println("广度优先 BFS：" + bfs.toString().trim());
        System.out.println("深度优先 DFS：" + dfsPath.toString().trim());
        System.out.println("核心机制：邻接表用 Map+List 存边；BFS 借助队列逐层扩散，DFS 沿一条路径走到底再回溯。");
    }
}
