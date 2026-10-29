# my_practices：我的独立练习区

这个目录属于**你**：OOP 方向的综合练习（学生/图书/银行三选一做深）与预测修改练习的代码都放这里，随仓库在两台电脑间同步。验证脚本不检查本目录（未完成不会被当作回归失败）。

## 使用约定

1. 每个练习一个子目录，目录即源码根，package 用 `com.javaroadmap.stage02.practices.<题目名>`：
   ```text
   my_practices/library/com/javaroadmap/stage02/practices/library/Book.java
   my_practices/library/com/javaroadmap/stage02/practices/library/LibraryService.java
   my_practices/library/com/javaroadmap/stage02/practices/library/LibraryApp.java
   ```
2. Entity / Service / App 分三个文件，不要全塞进一个 App（[职责深化课](../deep_dives/06_entity_service/README.md) 的三层判断法）。
3. 完成后在 [真实学习进度](../../../真实学习进度.md) 记录：功能、验证会话（输入→输出）、与参考实现的 Review 结论。

## 验收方式

三个方向的完整需求与验收清单见 [existing_course/exercises/oop_project_exercises.md](../existing_course/exercises/oop_project_exercises.md)。重点是那条硬性规则：**Service 层不出现 Scanner/println**——用"入口可整体替换"来检验。
