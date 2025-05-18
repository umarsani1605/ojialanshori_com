-- Migration script to move data from old tables to new grade_ prefixed tables

-- Step 1: Insert categories data
INSERT INTO grade_categories (id, name, created_at, updated_at)
SELECT id, name, created_at, updated_at FROM categories;

-- Step 2: Insert subjects data 
INSERT INTO grade_subjects (id, name, id_category, has_hafalan, has_setoran, created_at, updated_at)
SELECT id, name, id_category, has_hafalan, has_setoran, created_at, updated_at FROM subjects;

-- Step 3: Insert pentashih data
-- First create unique pentashih records
INSERT INTO grade_pentashih (id_pentashih)
SELECT DISTINCT id_pentashih FROM pentashih;

-- Step 4: Insert pentashih_santri mapping
INSERT INTO grade_pentashih_santri (id_pentashih, id_santri)
SELECT gp.id, p.id_santri 
FROM pentashih p
JOIN grade_pentashih gp ON p.id_pentashih = gp.id_pentashih;

-- Step 5: Insert grades data
INSERT INTO grade_grades (id_santri, id_pentashih, id_category, id_subject, hafalan, setoran, created_at, updated_at)
SELECT id_santri, id_pentashih, id_category, id_subject, hafalan, setoran, created_at, updated_at 
FROM grades;

-- Step 6: Reset auto increment values to prevent conflicts
ALTER TABLE grade_categories AUTO_INCREMENT = 1000;
ALTER TABLE grade_subjects AUTO_INCREMENT = 1000;
ALTER TABLE grade_pentashih AUTO_INCREMENT = 1000;
ALTER TABLE grade_pentashih_santri AUTO_INCREMENT = 1000;
ALTER TABLE grade_grades AUTO_INCREMENT = 1000; 