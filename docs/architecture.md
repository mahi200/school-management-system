# Architecture

## System Context

```mermaid
flowchart LR
  User["Admin / Teacher / Student / Staff"] --> Web["React Frontend"]
  Web --> Nginx["Nginx Reverse Proxy"]
  Nginx --> Auth["auth-service"]
  Nginx --> Student["student-service"]
  Nginx --> Teacher["teacher-service"]
  Nginx --> Attendance["attendance-service"]
  Nginx --> Fees["fees-service"]
  Nginx --> Notification["notification-service"]
  Auth --> DB[("PostgreSQL")]
  Student --> DB
  Teacher --> DB
  Attendance --> DB
  Fees --> DB
  Notification --> DB
  Student --> MinIO[("MinIO")]
  Teacher --> Kafka[("Kafka")]
  Attendance --> Kafka
  Fees --> Kafka
  Notification --> Kafka
```

## Backend Hexagonal Layout

```mermaid
flowchart TB
  Controller["Controller Layer<br/>REST endpoints, validation"] --> Service["Application Service Layer<br/>use cases, transactions"]
  Service --> Domain["Domain Models<br/>business state and invariants"]
  Service --> Ports["Ports<br/>repository and event interfaces"]
  Ports --> Persistence["Repository Adapters<br/>Spring Data JPA"]
  Ports --> Messaging["Messaging Adapters<br/>Kafka producers/consumers"]
  Ports --> Storage["Storage Adapters<br/>MinIO"]
  Controller --> DTO["DTOs"]
  DTO --> Mapper["MapStruct Mappers"]
  Mapper --> Domain
```

## Modules

- `auth-service`: users, roles, JWT authentication, tenant/school context, audit logs.
- `student-service`: student profiles, class assignment, documents, guardians.
- `teacher-service`: teacher profiles, subjects, class allocations, marks entry.
- `attendance-service`: daily attendance, reports by class/date/student.
- `fees-service`: fee structure, payments, receipts, outstanding reports.
- `notification-service`: email, SMS mock provider, and in-app notifications.

## Multi-School Support

Every tenant-owned table carries `school_id`. Authentication embeds `schoolId`, user id, email, and roles in the JWT. Services must apply school scoping at repository/query boundaries and reject cross-school references.

## Request Flow

```mermaid
sequenceDiagram
  participant C as Client
  participant N as Nginx
  participant A as auth-service
  participant P as PostgreSQL
  C->>N: POST /api/v1/auth/login
  N->>A: Forward request
  A->>P: Load user + roles
  A-->>C: JWT + user profile
  C->>N: GET /api/v1/students Authorization: Bearer token
  N->>Student: Forward request
  Student->>Student: Validate JWT and role
  Student->>P: Query by school_id
  Student-->>C: Paginated response
```

