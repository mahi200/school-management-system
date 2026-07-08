CREATE TABLE management_student_items (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    student_id UUID NOT NULL REFERENCES management_students(id),
    student_name VARCHAR(140) NOT NULL,
    student_admission_no VARCHAR(60) NOT NULL,
    class_name VARCHAR(80) NOT NULL,
    item_name VARCHAR(180) NOT NULL,
    item_type VARCHAR(60) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    provided_date VARCHAR(20) NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    status VARCHAR(40) NOT NULL DEFAULT 'Issued',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_management_student_items_school ON management_student_items (school_id);
CREATE INDEX idx_management_student_items_student ON management_student_items (school_id, student_id);
CREATE INDEX idx_management_student_items_class ON management_student_items (school_id, class_name);

INSERT INTO management_student_items (id, school_id, student_id, student_name, student_admission_no, class_name, item_name, item_type, quantity, provided_date, notes, status)
VALUES
    ('34000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '31000000-0000-0000-0000-000000000001', 'Aarav Mehta', 'ADM-1001', 'Class 8', 'Mathematics Textbook', 'Book', 1, '2025-04-01', 'Class 8 syllabus edition', 'Issued'),
    ('34000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '31000000-0000-0000-0000-000000000002', 'Nisha Rao', 'ADM-1002', 'Class 8', 'Summer Uniform Set', 'Dress', 2, '2025-04-05', 'Shirt and skirt', 'Issued'),
    ('34000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', '31000000-0000-0000-0000-000000000003', 'Kabir Shah', 'ADM-1003', 'Class 9', 'Science Lab Manual', 'Book', 1, '2025-04-10', '', 'Issued'),
    ('34000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', '31000000-0000-0000-0000-000000000004', 'Sara Khan', 'ADM-1004', 'Class 10', 'Winter Blazer', 'Dress', 1, '2025-11-15', 'Size M', 'Issued');
