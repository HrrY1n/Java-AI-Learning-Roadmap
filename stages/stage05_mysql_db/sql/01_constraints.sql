-- 第 1 课：SQL 基础、数据类型与表约束（目标版本：MySQL 8.0+）
-- 注意：MySQL 8.0.16 起才真正强制执行 CHECK 约束；5.7 及更早版本会静默忽略 CHECK。

-- 先清理引用它的子表（如第 2 课已创建 lab_enrollments），保证本脚本可重复运行
DROP TABLE IF EXISTS lab_enrollments;
DROP TABLE IF EXISTS lab_students;
CREATE TABLE lab_students (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    student_no VARCHAR(32)  NOT NULL,
    name       VARCHAR(64)  NOT NULL,
    score      INT          NOT NULL DEFAULT 0,
    email      VARCHAR(128) NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_student_no (student_no),
    CONSTRAINT chk_score_range CHECK (score >= 0 AND score <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO lab_students (student_no, name, score, email) VALUES
    ('S2026001', '小明', 88, 'xiaoming@school.example'),
    ('S2026002', '小红', 95, 'xiaohong@school.example'),
    ('S2026003', '小刚', 55, NULL);

SELECT id, student_no, name, score, email FROM lab_students ORDER BY id;
