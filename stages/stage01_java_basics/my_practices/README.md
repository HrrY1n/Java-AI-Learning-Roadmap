# my_practices：我的独立练习区

这个目录属于**你**：所有不看答案独立完成的代码都放这里，随仓库在两台电脑间同步。与 `existing_course/` 的关系：

- `existing_course/` 是课程材料与参考实现，验证脚本（`scripts/verify_java.sh` / `.ps1`）会检查它；
- 本目录是你自己的代码，**验证脚本不会检查它**——未完成、实验性的代码在这里不会被当作"回归失败"。

## 使用约定

1. 每个练习建一个子目录（如 `score_statistics/`），目录即源码根，内部按 package 建目录：
   ```text
   my_practices/score_statistics/com/javaroadmap/stage01/practices/scorestatistics/ScoreStats.java
   ```
   package 用 `com.javaroadmap.stage01.practices.<题目名>`（小写无下划线），保证 IDEA 整体构建不与其他课冲突。
2. 完成后在 [真实学习进度](../../../真实学习进度.md) 记一行：做了什么、验证命令、结果、踩的坑。
3. 长期未完成的练习可以保留半成品——它反映真实状态，不要删除伪装完成。

## 验收方式

结构化练习文档（[existing_course/exercises](../existing_course/exercises/basic_syntax_exercises.md)）里每个练习都带验收清单与自检命令，按清单逐条勾。验收是手工动作：**你的代码通过验收 ≠ 仓库验证脚本通过**，两者互不替代。
