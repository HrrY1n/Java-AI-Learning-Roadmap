-- 第 4 课：索引、B+树与 EXPLAIN 真实对比
-- 用独立压测表 lab_index_bench（不污染学生表），插入 500 行样本演示无索引全表扫描 vs 联合索引命中与失效

DROP TABLE IF EXISTS lab_index_bench;
CREATE TABLE lab_index_bench (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    dept_code  VARCHAR(16) NOT NULL,
    score      INT         NOT NULL,
    username   VARCHAR(32) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
