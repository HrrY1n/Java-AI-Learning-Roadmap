package com.javaroadmap.ostep.ostep_cpu_scheduling;

/**
 * 教学示例：CPU 调度：FIFO、SJF、RR 与多级反馈
 * 来源：操作系统导论（本地中文版）第 7-10 章
 * 纯教学模拟：三个作业假设同时到达（arrive=0），在单 CPU 上依次运行。
 * 输出每个策略的完成时间、周转时间和响应时间，便于与手算预测核对。
 * 这是作业模型模拟，不是操作系统调度器，也不测量真实 CPU。
 */
public final class App {
    /** burst：该作业需要占用 CPU 的时间片数量（教学单位，不是毫秒）。 */
    private record Job(String name, int arrive, int burst) {}

    private static final int QUANTUM = 4;

    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== CPU 调度：FIFO、SJF、RR 与多级反馈 ===");
        Job[] jobs = {
            new Job("A", 0, 8),
            new Job("B", 0, 4),
            new Job("C", 0, 1)
        };
        System.out.println("作业：A(8) B(4) C(1)，全部在时刻 0 到达；RR 时间片=" + QUANTUM);
        simulateFifo(jobs);
        simulateSjf(jobs);
        simulateRoundRobin(jobs);
        System.out.println("提示：三种指标（周转/响应）无法同时最优，请把上表与你的预测对照。");
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }

    /** FIFO：按到达顺序依次运行到结束。 */
    private static void simulateFifo(Job[] jobs) {
        System.out.println("--- FIFO（按到达顺序）---");
        int now = 0;
        double turnaroundSum = 0;
        double responseSum = 0;
        for (Job job : jobs) {
            int start = now; // 非抢占：此刻轮到它，立即开始
            now += job.burst();
            printMetrics(job, job.arrive(), now, start);
            turnaroundSum += now - job.arrive();
            responseSum += start - job.arrive();
        }
        System.out.println("平均周转 " + turnaroundSum / jobs.length
            + "，平均响应 " + responseSum / jobs.length);
    }

    /** SJF：同时到达时先运行最短作业（教学假设：调度器已知 burst）。 */
    private static void simulateSjf(Job[] jobs) {
        System.out.println("--- SJF（最短优先，已知作业长度）---");
        Job[] sorted = jobs.clone();
        java.util.Arrays.sort(sorted, java.util.Comparator.comparingInt(Job::burst));
        int now = 0;
        double turnaroundSum = 0;
        double responseSum = 0;
        for (Job job : sorted) {
            int start = now;
            now += job.burst();
            printMetrics(job, job.arrive(), now, start);
            turnaroundSum += now - job.arrive();
            responseSum += start - job.arrive();
        }
        System.out.println("平均周转 " + turnaroundSum / jobs.length
            + "，平均响应 " + responseSum / jobs.length);
    }

    /** RR：每个作业每次最多运行 QUANTUM，时间片用完即排到队尾。 */
    private static void simulateRoundRobin(Job[] jobs) {
        System.out.println("--- RR（时间片 " + QUANTUM + "）---");
        java.util.Deque<int[]> queue = new java.util.ArrayDeque<>();
        for (int i = 0; i < jobs.length; i++) queue.addLast(new int[] {i, jobs[i].burst()});
        int now = 0;
        int[] firstStart = new int[jobs.length];
        java.util.Arrays.fill(firstStart, -1);
        int[] completion = new int[jobs.length];
        while (!queue.isEmpty()) {
            int[] entry = queue.removeFirst();
            int index = entry[0];
            int remaining = entry[1];
            if (firstStart[index] == -1) firstStart[index] = now;
            int run = Math.min(QUANTUM, remaining);
            now += run;
            System.out.println("  [" + now + "] 运行 " + jobs[index].name() + " " + run + " 个时间片");
            if (run < remaining) {
                queue.addLast(new int[] {index, remaining - run});
            } else {
                completion[index] = now;
            }
        }
        double turnaroundSum = 0;
        double responseSum = 0;
        for (int i = 0; i < jobs.length; i++) {
            printMetrics(jobs[i], jobs[i].arrive(), completion[i], firstStart[i]);
            turnaroundSum += completion[i] - jobs[i].arrive();
            responseSum += firstStart[i] - jobs[i].arrive();
        }
        System.out.println("平均周转 " + turnaroundSum / jobs.length + "，平均响应 " + responseSum / jobs.length);
    }

    private static void printMetrics(Job job, int arrive, int completion, int firstStart) {
        System.out.println("  " + job.name() + "：完成 " + completion
            + "，周转 " + (completion - arrive)
            + "，响应 " + (firstStart - arrive));
    }
}
