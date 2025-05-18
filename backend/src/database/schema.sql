-- DROP TABLES IF NEEDED
DROP TABLE IF EXISTS grade_grades;
DROP TABLE IF EXISTS grade_pentashih_santri;
DROP TABLE IF EXISTS grade_pentashih;
DROP TABLE IF EXISTS grade_subjects;
DROP TABLE IF EXISTS grade_categories;

-- Grade Categories
CREATE TABLE grade_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Grade Subjects
CREATE TABLE grade_subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  id_category INT NOT NULL,
  has_hafalan BOOLEAN DEFAULT false,
  has_setoran BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_category) REFERENCES grade_categories(id) ON DELETE CASCADE
);

-- Grade Pentashih
CREATE TABLE grade_pentashih (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_pentashih INT NOT NULL, -- Reference to santri ID acting as pentashih
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_pentashih) REFERENCES santri(id) ON DELETE CASCADE
);

-- Grade Pentashih Santri (Mapping table between pentashih and santri)
CREATE TABLE grade_pentashih_santri (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_pentashih INT NOT NULL,
  id_santri INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_pentashih) REFERENCES grade_pentashih(id) ON DELETE CASCADE,
  FOREIGN KEY (id_santri) REFERENCES santri(id) ON DELETE CASCADE,
  UNIQUE KEY uk_pentashih_santri (id_pentashih, id_santri)
);

-- Grade Grades
CREATE TABLE grade_grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_santri INT NOT NULL,
  id_pentashih INT NOT NULL,
  id_category INT NOT NULL,
  id_subject INT NOT NULL,
  hafalan ENUM('belum', 'proses', 'sudah') DEFAULT 'belum',
  setoran ENUM('belum', 'proses', 'sudah') DEFAULT 'belum',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_santri) REFERENCES santri(id) ON DELETE CASCADE,
  FOREIGN KEY (id_pentashih) REFERENCES santri(id) ON DELETE NO ACTION,
  FOREIGN KEY (id_category) REFERENCES grade_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (id_subject) REFERENCES grade_subjects(id) ON DELETE CASCADE,
  UNIQUE KEY uk_santri_subject (id_santri, id_subject)
);

-- Sample data
INSERT INTO grade_categories (name) VALUES 
  ('Al-Qur\'an'),
  ('Fiqih'),
  ('Aqidah'),
  ('Akhlak');

INSERT INTO grade_subjects (name, id_category, has_hafalan, has_setoran) VALUES 
  ('Juz 1', 1, true, true),
  ('Juz 2', 1, true, true),
  ('Fiqih Ibadah', 2, true, false),
  ('Fiqih Muamalah', 2, true, false),
  ('Tauhid', 3, true, true),
  ('Akhlakul Karimah', 4, false, true); 