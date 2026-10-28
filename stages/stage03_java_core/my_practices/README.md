# my_practices：我的独立练习区

这个目录属于**你**：Stage 03 的四个扩展练习（删除/改分/优秀筛选/email 持久化）基于 `existing_course/src/` 的学生系统扩展——**先把整个 `student` 包复制到这里再改**，参考实现保持原样（它的回归由 `scripts/verify_java.sh` 保护）。

## 使用约定

1. 复制方式：把 `existing_course/src/main/java/com/javaroadmap/stage03/student/` 复制为
   `my_practices/student_persistence/com/javaroadmap/stage03/practices/studentpersistence/`，并把包声明同步改名（`com.javaroadmap.stage03.practices.studentpersistence`，注意 `common` 与 `exception` 的 import 也要跟随调整，或一并复制这两个包）。
2. 运行方式不变：目录即源码根，`javac -encoding UTF-8 -d out` + FQCN。
3. 文件版练习会在工作目录产生 `data/students.txt`——这是运行数据，提交前删除或移走（不入库）。
4. 完成后在 [真实学习进度](../../../真实学习进度.md) 记录：练习号、坏行/边界用例的实际处理结果。

## 验收方式

四个练习的完整需求与验收清单见 [existing_course/exercises/collection_exception_io_exercises.md](../existing_course/exercises/collection_exception_io_exercises.md)。每个练习都有"错误输入"与"边界示例"，验收时逐个真实运行——**不要只用正常数据验证**。
