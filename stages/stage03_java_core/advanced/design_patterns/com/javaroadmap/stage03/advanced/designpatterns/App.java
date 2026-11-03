package com.javaroadmap.stage03.advanced.designpatterns;

/**
 * 设计模式的基本思想：面向接口、组合优于继承、固定流程留扩展点。
 * 以策略模式与模板方法为例。对应《On Java 8》第 25 章（设计模式）的思想部分。
 */
public class App {

    // 策略模式：把“可变算法”抽成接口，运行期按组合切换
    interface CompressionStrategy {
        String compress(String file);
    }

    static class ZipStrategy implements CompressionStrategy {
        @Override
        public String compress(String file) {
            return "zip:" + file + ".zip";
        }
    }

    static class GzipStrategy implements CompressionStrategy {
        @Override
        public String compress(String file) {
            return "gzip:" + file + ".gz";
        }
    }

    static class Archiver {
        private CompressionStrategy strategy; // 组合而非继承

        Archiver(CompressionStrategy strategy) {
            this.strategy = strategy;
        }

        void setStrategy(CompressionStrategy strategy) {
            this.strategy = strategy;
        }

        String archive(String file) {
            return strategy.compress(file);
        }
    }

    // 模板方法：父类固定流程骨架，子类只填扩展点
    abstract static class ReportGenerator {
        final String generate() { // final 防止子类改写流程
            return collectData() + " -> " + format();
        }

        abstract String collectData();

        abstract String format();
    }

    static class SalesReport extends ReportGenerator {
        @Override
        String collectData() {
            return "销售数据";
        }

        @Override
        String format() {
            return "表格";
        }
    }

    public static void main(String[] args) {
        Archiver archiver = new Archiver(new ZipStrategy());
        System.out.println(archiver.archive("report.txt"));
        archiver.setStrategy(new GzipStrategy());
        System.out.println(archiver.archive("report.txt"));

        ReportGenerator report = new SalesReport();
        System.out.println(report.generate());
        System.out.println("要点：识别“变化的部分”，把它抽成接口用组合注入；流程固定则用模板方法留扩展点。");
    }
}
