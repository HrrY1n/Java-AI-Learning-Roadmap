-- 可重复执行：仅清理本阶段演示/测试表，不删库、不碰其它库
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS lab_enrollments;
DROP TABLE IF EXISTS lab_courses;
DROP TABLE IF EXISTS lab_students;
DROP TABLE IF EXISTS lab_index_bench;
DROP TABLE IF EXISTS evo_students;
SET FOREIGN_KEY_CHECKS = 1;
