# my_practices：我的独立练习区（Stage 04）

这个目录属于**你**：用来保存你自己独立写的并发练习与源码修改副本。参考答案与示例源码保持原样，不在此目录填写完整参考代码。

## 使用约定

1. 每个练习从网站编程实验室下载或按约定建独立包目录，例如：
   `my_practices/thread_order/com/javaroadmap/lab/stage04/threadorder/ThreadOrderLab.java`
2. 保持与网站导出骨架一致的 `package` 与 `public class` 命名，才能直接用 `npm run verify:practice` 校验并导入证据。
3. 并发程序每次运行时先观察再下结论：不要把“某一次未加锁刚好得到正确总和”当成线程安全证明。

## 验收方式

三道结构化练习（线程启动与阶段汇合 / 线程安全计数器 / 线程池任务执行与优雅关闭）的完整题面与渐进提示见 [practice/s04-exercises.md](../practice/s04-exercises.md)。
