CREATE TABLE management_students (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    admission_no VARCHAR(60) NOT NULL,
    name VARCHAR(140) NOT NULL,
    parent_name VARCHAR(140) NOT NULL,
    address TEXT NOT NULL,
    class_name VARCHAR(80) NOT NULL,
    section VARCHAR(40) NOT NULL,
    attendance INTEGER NOT NULL DEFAULT 100,
    fee_status VARCHAR(30) NOT NULL,
    annual_fee NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_management_students_admission UNIQUE (school_id, admission_no)
);

CREATE TABLE management_teachers (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    employee_no VARCHAR(60) NOT NULL,
    name VARCHAR(140) NOT NULL,
    subject VARCHAR(120) NOT NULL,
    classes VARCHAR(255) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_management_teachers_employee UNIQUE (school_id, employee_no)
);

CREATE TABLE management_exams (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    name VARCHAR(140) NOT NULL,
    class_name VARCHAR(80) NOT NULL,
    status VARCHAR(60) NOT NULL,
    result_cards VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE management_notifications (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    title VARCHAR(180) NOT NULL,
    class_name VARCHAR(80) NOT NULL,
    person VARCHAR(160) NOT NULL,
    status VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_management_students_school_class ON management_students (school_id, class_name, section);
CREATE INDEX idx_management_teachers_school ON management_teachers (school_id);
CREATE INDEX idx_management_exams_school_class ON management_exams (school_id, class_name);
CREATE INDEX idx_management_notifications_school_class ON management_notifications (school_id, class_name);

INSERT INTO management_students (id, school_id, admission_no, name, parent_name, address, class_name, section, attendance, fee_status, annual_fee, amount_paid)
VALUES
    ('31000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'ADM-1001', 'Aarav Mehta', 'Rohit Mehta', '12 Nehru Nagar, Jaipur', 'Class 8', 'A', 96, 'Paid', 54000, 54000),
    ('31000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'ADM-1002', 'Nisha Rao', 'Meera Rao', '45 Lakshmi Road, Pune', 'Class 8', 'B', 91, 'Pending', 54000, 30000),
    ('31000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'ADM-1003', 'Kabir Shah', 'Amit Shah', '8 MG Road, Ahmedabad', 'Class 9', 'A', 88, 'Overdue', 62400, 24000),
    ('31000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'ADM-1004', 'Sara Khan', 'Farah Khan', '21 Park Street, Kolkata', 'Class 10', 'C', 94, 'Paid', 69600, 69600),
    ('31000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'ADM-1005', 'Ishaan Patel', 'Bhavesh Patel', '77 Satellite Road, Ahmedabad', 'Class 11', 'Science', 89, 'Pending', 86400, 43200);

INSERT INTO management_teachers (id, school_id, employee_no, name, subject, classes, phone)
VALUES
    ('32000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'EMP-201', 'Priya Menon', 'Mathematics', 'Class 8A, Class 9A', '+91 98765 01010'),
    ('32000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'EMP-202', 'Rahul Verma', 'Physics', 'Class 9A, Class 10C', '+91 98765 02020'),
    ('32000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'EMP-203', 'Anita Das', 'English', 'Class 8B, Class 10C', '+91 98765 03030'),
    ('32000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'EMP-204', 'Sandeep Iyer', 'Accountancy', 'Class 11 Commerce, Class 12 Commerce', '+91 98765 04040');

INSERT INTO management_exams (id, school_id, name, class_name, status, result_cards)
VALUES
    ('33000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Half Yearly', 'Class 8', 'Marks entry open', '42 generated'),
    ('33000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Unit Test 2', 'Class 9', 'Scheduled', 'Pending'),
    ('33000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Pre-Board Practical', 'Class 10', 'Draft', 'Pending'),
    ('33000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Commerce Term Exam', 'Class 11', 'Published', '36 generated');

INSERT INTO management_notifications (id, school_id, title, class_name, person, status)
VALUES
    ('34000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Fee reminder to Class 8B', 'Class 8', 'Nisha Rao', 'Queued for SMS and email'),
    ('34000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Attendance alert to guardians', 'Class 9', 'Kabir Shah', 'Sent today'),
    ('34000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Exam schedule published', 'Class 10', 'Sara Khan', 'In-app notification active'),
    ('34000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Transport fee reminder', 'Class 11', 'Ishaan Patel', 'Queued for SMS');
