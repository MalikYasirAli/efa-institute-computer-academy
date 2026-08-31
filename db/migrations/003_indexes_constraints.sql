-- 003_indexes_constraints.sql

CREATE UNIQUE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_registration_number ON students(registration_number);
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_application_id ON applications(application_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_certificates_certificate_number ON certificates(certificate_number);

CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(LOWER(email));
