CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE schools (
    id UUID PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    code VARCHAR(40) NOT NULL UNIQUE,
    address TEXT,
    phone VARCHAR(40),
    email VARCHAR(160),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    full_name VARCHAR(140) NOT NULL,
    email VARCHAR(160) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_users_school_email UNIQUE (school_id, email)
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE classes (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    name VARCHAR(80) NOT NULL,
    grade_level INTEGER NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_classes_school_name_year UNIQUE (school_id, name, academic_year)
);

CREATE TABLE sections (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(40) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 40,
    CONSTRAINT uq_sections_class_name UNIQUE (class_id, name)
);

CREATE TABLE subjects (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    code VARCHAR(40) NOT NULL,
    name VARCHAR(120) NOT NULL,
    CONSTRAINT uq_subjects_school_code UNIQUE (school_id, code)
);

CREATE TABLE students (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    user_id UUID UNIQUE REFERENCES users(id),
    admission_number VARCHAR(60) NOT NULL,
    class_id UUID REFERENCES classes(id),
    section_id UUID REFERENCES sections(id),
    date_of_birth DATE,
    gender VARCHAR(30),
    guardian_name VARCHAR(140),
    guardian_phone VARCHAR(40),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_students_school_admission UNIQUE (school_id, admission_number)
);

CREATE TABLE teachers (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    user_id UUID UNIQUE REFERENCES users(id),
    employee_number VARCHAR(60) NOT NULL,
    phone VARCHAR(40),
    qualification VARCHAR(160),
    joining_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_teachers_school_employee UNIQUE (school_id, employee_number)
);

CREATE TABLE staff_profiles (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    user_id UUID UNIQUE REFERENCES users(id),
    employee_number VARCHAR(60) NOT NULL,
    department VARCHAR(120),
    designation VARCHAR(120),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT uq_staff_school_employee UNIQUE (school_id, employee_number)
);

CREATE TABLE teacher_subjects (
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    section_id UUID REFERENCES sections(id),
    PRIMARY KEY (teacher_id, subject_id, class_id, section_id)
);

CREATE TABLE attendance (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    student_id UUID NOT NULL REFERENCES students(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    section_id UUID NOT NULL REFERENCES sections(id),
    attendance_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL,
    remarks VARCHAR(255),
    marked_by UUID REFERENCES users(id),
    marked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_attendance_student_date UNIQUE (student_id, attendance_date)
);

CREATE TABLE fee_structures (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    name VARCHAR(120) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    due_day INTEGER NOT NULL,
    frequency VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fee_assignments (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    student_id UUID NOT NULL REFERENCES students(id),
    fee_structure_id UUID NOT NULL REFERENCES fee_structures(id),
    due_date DATE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    CONSTRAINT uq_fee_assignment UNIQUE (student_id, fee_structure_id, due_date)
);

CREATE TABLE payments (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    fee_assignment_id UUID NOT NULL REFERENCES fee_assignments(id),
    amount NUMERIC(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    method VARCHAR(40) NOT NULL,
    receipt_number VARCHAR(80) NOT NULL,
    received_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_payment_receipt UNIQUE (school_id, receipt_number)
);

CREATE TABLE exams (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    name VARCHAR(120) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    starts_on DATE NOT NULL,
    ends_on DATE NOT NULL
);

CREATE TABLE results (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    exam_id UUID NOT NULL REFERENCES exams(id),
    student_id UUID NOT NULL REFERENCES students(id),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    marks_obtained NUMERIC(6, 2) NOT NULL,
    max_marks NUMERIC(6, 2) NOT NULL,
    grade VARCHAR(10),
    entered_by UUID REFERENCES users(id),
    entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_result_exam_student_subject UNIQUE (exam_id, student_id, subject_id)
);

CREATE TABLE documents (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    student_id UUID REFERENCES students(id),
    teacher_id UUID REFERENCES teachers(id),
    object_key VARCHAR(255) NOT NULL,
    file_name VARCHAR(180) NOT NULL,
    content_type VARCHAR(120) NOT NULL,
    size_bytes BIGINT NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    recipient_user_id UUID REFERENCES users(id),
    channel VARCHAR(30) NOT NULL,
    title VARCHAR(160) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    provider_message_id VARCHAR(160),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    actor_user_id UUID REFERENCES users(id),
    action VARCHAR(120) NOT NULL,
    resource VARCHAR(120) NOT NULL,
    resource_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_school_email ON users (school_id, email);
CREATE INDEX idx_students_school_class_section ON students (school_id, class_id, section_id);
CREATE INDEX idx_attendance_school_date_class ON attendance (school_id, attendance_date, class_id, section_id);
CREATE INDEX idx_payments_school_date ON payments (school_id, payment_date);
CREATE INDEX idx_results_school_student ON results (school_id, student_id);
CREATE INDEX idx_notifications_recipient ON notifications (school_id, recipient_user_id, status);
CREATE INDEX idx_audit_logs_school_created ON audit_logs (school_id, created_at);

INSERT INTO schools (id, name, code, address, phone, email)
VALUES ('11111111-1111-1111-1111-111111111111', 'Demo Public School', 'DEMO', 'Main Campus', '+1-555-0100', 'office@demo.school');

INSERT INTO roles (id, name)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'ADMIN'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'TEACHER'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'STUDENT'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'STAFF');

INSERT INTO users (id, school_id, full_name, email, password_hash, status)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Demo Admin',
    'admin@demo.school',
    '$2y$12$wosggaJs.FxkPHKvw1azB.N7vywSCF2V/Xr8vhqgX1m/YMFR02zYW',
    'ACTIVE'
);

INSERT INTO user_roles (user_id, role_id)
VALUES ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1');

