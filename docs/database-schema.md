# Database Schema

The schema is normalized for SaaS-ready multi-school operation. Each operational table references `schools(id)` and uses UUID primary keys.

## ER Diagram

```mermaid
erDiagram
  schools ||--o{ users : owns
  roles ||--o{ user_roles : assigned
  users ||--o{ user_roles : has
  schools ||--o{ classes : owns
  classes ||--o{ sections : has
  sections ||--o{ students : contains
  users ||--o| students : profile
  users ||--o| teachers : profile
  teachers ||--o{ teacher_subjects : teaches
  subjects ||--o{ teacher_subjects : assigned
  students ||--o{ attendance : has
  classes ||--o{ attendance : reported_for
  sections ||--o{ attendance : reported_for
  schools ||--o{ fee_structures : defines
  students ||--o{ fee_assignments : owes
  fee_structures ||--o{ fee_assignments : assigned
  fee_assignments ||--o{ payments : paid_by
  classes ||--o{ exams : schedules
  exams ||--o{ results : has
  students ||--o{ results : receives
  subjects ||--o{ results : graded_for
  schools ||--o{ notifications : sends
  users ||--o{ notifications : receives
  users ||--o{ audit_logs : performs
```

## Core Tables

- `schools`: tenant record.
- `users`: login identity, tenant scoped.
- `roles`, `user_roles`: RBAC.
- `students`, `teachers`, `staff_profiles`: people modules.
- `classes`, `sections`, `subjects`: academic structure.
- `attendance`: daily attendance by student/class/section/date.
- `fee_structures`, `fee_assignments`, `payments`: fee setup and tracking.
- `exams`, `results`: assessment and report card base.
- `documents`: MinIO object references.
- `notifications`: in-app/email/SMS notification tracking.
- `audit_logs`: immutable user action trail.

See the executable Flyway migration at [V1__init_schema.sql](/Users/mahi/Desktop/repo/school-management-system/auth-service/src/main/resources/db/migration/V1__init_schema.sql).

