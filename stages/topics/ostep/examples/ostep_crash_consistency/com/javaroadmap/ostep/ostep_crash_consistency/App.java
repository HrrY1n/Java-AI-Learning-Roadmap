package com.javaroadmap.ostep.ostep_crash_consistency;

/**
 * 教学示例：崩溃一致性：FSCK 与预写日志
 * 来源：操作系统导论（本地中文版）第 42 章
 * 纯内存教学模拟：文件更新要写“数据块 D”和“元数据块 M”两个块，
 * 写入过程中任何一步都可能崩溃。本模拟枚举每个崩溃点，
 * 对比三种协议恢复后的文件状态：不一致 / 丢失更新 / 正确。
 * 这不是真实文件系统，也不访问磁盘。
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 崩溃一致性：FSCK 与预写日志 ===");
        noJournalMetadataFirst();
        noJournalDataFirst();
        writeAheadLog();
        System.out.println("提示：只有协议三在任何崩溃点都保证“旧值或新值，绝不出现垃圾”。");
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }

    /**
     * 协议一：无日志，先写元数据 M 再写数据 D（危险顺序）。
     * 崩溃点 1 时 M 已指向新块而 D 还是旧内容，恢复后读到垃圾。
     */
    private static void noJournalMetadataFirst() {
        System.out.println("--- 协议一：无日志，先元数据后数据（危险）---");
        String[][] states = {
            {"D=旧", "M=指旧块", "文件=旧值（一致，但写入丢失）"},
            {"D=旧", "M=指新块", "文件=垃圾（不一致！元数据指向未写的数据块）"},
            {"D=新", "M=指新块", "文件=新值（一致）"}
        };
        printCrashTable(states);
    }

    /**
     * 协议二：无日志，先写数据 D 再写元数据 M（顺序正确但没有保护）。
     * 任何崩溃点最多丢失这次更新，不会出现垃圾。
     */
    private static void noJournalDataFirst() {
        System.out.println("--- 协议二：无日志，先数据后元数据（一致但无保护）---");
        String[][] states = {
            {"D=旧", "M=指旧块", "文件=旧值（一致，写入丢失）"},
            {"D=新", "M=指旧块", "文件=旧值（一致，写入丢失）"},
            {"D=新", "M=指新块", "文件=新值（一致）"}
        };
        printCrashTable(states);
    }

    /**
     * 协议三：预写日志。写序：BEGIN -> 记录意图 -> COMMIT -> 应用 D -> 应用 M。
     * 恢复规则：日志中有 COMMIT 就重放到完成，否则整体丢弃。
     */
    private static void writeAheadLog() {
        System.out.println("--- 协议三：预写日志（先日志后数据）---");
        String[] steps = {"写 BEGIN", "写 WRITE(D,M) 意图", "写 COMMIT", "应用 D", "应用 M"};
        for (int crashPoint = 0; crashPoint <= steps.length; crashPoint++) {
            String outcome;
            if (crashPoint < 3) {
                outcome = "恢复：日志无 COMMIT，整体丢弃 -> 文件=旧值（一致）";
            } else {
                outcome = "恢复：日志已有 COMMIT，重放到完成 -> 文件=新值（一致）";
            }
            System.out.println("  崩溃于第 " + crashPoint + " 步后"
                + (crashPoint > 0 ? "（已完成：" + steps[crashPoint - 1] + "）" : "（尚未开始）")
                + " -> " + outcome);
        }
    }

    private static void printCrashTable(String[][] states) {
        String[] steps = {"写 M", "写 D"};
        for (int crashPoint = 0; crashPoint < states.length; crashPoint++) {
            String done = crashPoint == 0 ? "尚未开始" : "已完成：" + steps[crashPoint - 1];
            System.out.println("  崩溃于第 " + crashPoint + " 步后（" + done + "）"
                + " 状态[" + states[crashPoint][0] + ", " + states[crashPoint][1] + "] -> "
                + states[crashPoint][2]);
        }
    }
}
