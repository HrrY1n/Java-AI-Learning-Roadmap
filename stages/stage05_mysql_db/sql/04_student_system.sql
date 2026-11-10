-- 连续项目第 3 阶段：演进中的学生管理系统 MySQL 表结构
DROP TABLE IF EXISTS evo_students;
CREATE TABLE evo_students (
    id         INT          NOT NULL,
    student_no VARCHAR(32)  NOT NULL,
    name       VARCHAR(64)  NOT NULL,
    score      INT          NOT NULL,
    email      VARCHAR(128) NOT NULL DEFAULT '-',
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_evo_student_no (student_no),
    CONSTRAINT chk_evo_score CHECK (score >= 0 AND score <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
