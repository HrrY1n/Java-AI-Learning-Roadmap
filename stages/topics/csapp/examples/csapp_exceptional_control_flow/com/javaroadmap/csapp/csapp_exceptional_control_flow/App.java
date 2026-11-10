package com.javaroadmap.csapp.csapp_exceptional_control_flow;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 教学示例：CSAPP Chapter 8——异常控制流（ECF）、进程生命周期回收与退出码语义。
 * 来源：《CSAPP, 3rd Global Edition》Chapter 8
 *
 * 与 Java 异常的本质分界：
 * - try/catch 只捕获 JVM 内部的语言级异常；
 * - 子进程非 0 退出码、进程挂起超时与 OS 信号属于操作系统进程控制流，Java 不会替你自动抛异常！
 */
public final class App {
    private App() {}

    static final class ProcessOutcome {
        final int exitCode;
        final boolean timedOut;
        final List<String> outputLines;

        ProcessOutcome(int exitCode, boolean timedOut, List<String> outputLines) {
            this.exitCode = exitCode;
            this.timedOut = timedOut;
            this.outputLines = outputLines;
        }
    }

    /**
     * 受控执行子进程：并发引流合并后的标准输出/错误流（防止管道缓冲区写满死锁），
     * 并用 waitFor(timeout) + destroyForcibly() 避免僵尸或永久挂起。
     */
    static ProcessOutcome runControlled(List<String> command, long timeoutSeconds)
            throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true); // 合并 stderr 到 stdout，减少单读阻塞风险
        Process process = pb.start(); // 触发 OS 创建子进程（类 Unix 下 fork + execve）

        List<String> lines = new ArrayList<>();
        // 必须在 waitFor 之前消费完子进程输出流，否则子进程输出超过 OS 管道缓冲区（通常 64KB）就会阻塞死锁
        Thread reader = new Thread(() -> {
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = br.readLine()) != null) {
                    lines.add(line);
                }
            } catch (IOException ignored) {
                // 进程被强制终止时流关闭属于预期行为
            }
        });
        reader.start();

        boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        boolean timedOut = !finished;
        if (timedOut) {
            process.destroyForcibly(); // 相当于发送终止信号强杀子进程
            process.waitFor();         // 类 Unix 下相当于 waitpid 回收，防止留下僵尸进程
        }
        reader.join(2000);
        int exit = process.exitValue();
        return new ProcessOutcome(exit, timedOut, lines);
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== CSAPP Ch.8：进程控制流、退出码与语言异常分界 ===");

        // 1. 成功命令：exitCode = 0
        ProcessOutcome ok = runControlled(List.of("java", "-version"), 10);
        System.out.println("正常命令 exitCode=" + ok.exitCode + "（0 表示成功），首行输出="
                + (ok.outputLines.isEmpty() ? "(空)" : ok.outputLines.get(0)));

        // 2. 子进程自身失败（传非法参数给 java）：ProcessBuilder 不会抛异常，而是正常返回非 0 exitCode！
        ProcessOutcome badArg = runControlled(List.of("java", "--nonexistent-flag-for-ecf-test"), 10);
        System.out.println("子进程非零退出未抛 Java 异常，必须主动检查：exitCode=" + badArg.exitCode
                + "，是否失败=" + (badArg.exitCode != 0));

        // 3. 启动不存在的可执行程序：操作系统 exec 失败，这时才会由 JVM 转换成 IOException 抛出
        try {
            runControlled(List.of("definitely_missing_executable_v22"), 5);
        } catch (IOException e) {
            System.out.println("系统调用找不到可执行文件才触发 Java IOException：" + e.getClass().getSimpleName());
        }
    }
}
