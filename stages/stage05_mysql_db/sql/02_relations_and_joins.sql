-- 第 2 课：关系模型（1:N 与 M:N 中间表）、外键与多表连接
-- 依赖于 01_constraints.sql 中已创建的 lab_students

DROP TABLE IF EXISTS lab_enrollments;
DROP TABLE IF EXISTS lab_courses;

CREATE TABLE lab_courses (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    course_code VARCHAR(32) NOT NULL,
    title       VARCHAR(80) NOT NULL,
    credits     INT         NOT NULL DEFAULT 2,
    PRIMARY KEY (id),
    UNIQUE KEY uk_course_code (course_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE lab_enrollments (
    id         BIGINT   NOT NULL AUTO_INCREMENT,
    student_id BIGINT   NOT NULL,
    course_id  BIGINT   NOT NULL,
    grade      INT      NULL,
    enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_student_course (student_id, course_id),
    CONSTRAINT fk_enroll_student FOREIGN KEY (student_id) REFERENCES lab_students(id) ON DELETE RESTRICT,
    CONSTRAINT fk_enroll_course  FOREIGN KEY (course_id)  REFERENCES lab_courses(id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO lab_courses (course_code, title, credits) VALUES
    ('JAVA101', 'Java 核心与并发', 4),
    ('DB201',   'MySQL 与数据建模', 3),
    ('NET301',  '计算机网络基础',   2);

-- 小明选 Java + MySQL；小红选 Java；小刚尚未选任何课（用于对比 INNER JOIN vs LEFT JOIN）
INSERT INTO lab_enrollments (student_id, course_id, grade)
SELECT s.id, c.id, CASE WHEN s.student_no = 'S2026001' AND c.course_code = 'JAVA101' THEN 91 ELSE 85 END
FROM lab_students s
JOIN lab_courses c ON (s.student_no = 'S2026001' AND c.course_code IN ('JAVA101', 'DB201'))
                   OR (s.student_no = 'S2026002' AND c.course_code = 'JAVA101');

-- 对比 1：INNER JOIN 漏掉未选课的"小刚"
SELECT s.name, c.course_code, e.grade
FROM lab_students s
INNER JOIN lab_enrollments e ON s.id = e.student_id
INNER JOIN lab_courses c ON e.course_id = c.id
ORDER BY s.id, c.id;

-- 对比 2：LEFT JOIN 保留所有学生（小刚的课程为 NULL）；若把过滤条件错放进 WHERE c.course_code = 'JAVA101' 会退化成内连接！
SELECT s.name, COALESCE(c.course_code, '(未选课)') AS course_code, e.grade
FROM lab_students s
LEFT JOIN lab_enrollments e ON s.id = e.student_id
LEFT JOIN lab_courses c ON e.course_id = c.id
ORDER BY s.id, c.id;
