# Signup & User Creation Functionality

## Overview

The school management system has **one signup/registration mechanism** — the public
`POST /api/v1/auth/register` endpoint, exposed by the `auth-service`. There is
**no separate admin-side "create user" endpoint** in the management API at this
time. Registration is done entirely through this single public endpoint.

---

## 1. Self-Registration Flow (Public API)

### Endpoint

```
POST /api/v1/auth/register
```

**Visibility:** Public (no authentication required). Asserted in
`SecurityConfig.java` — `/api/v1/auth/register` is in the `permitAll()` set.

### Request Body (RegisterRequest)

```typescript
{
  "schoolCode": "DEMO",           // string, required — school tenant code
  "fullName": "Jane Smith",       // string, required — max 140 chars
  "email": "jane@example.com",    // string, required — valid email format
  "password": "securePass123",    // string, required — 8-120 chars
  "roles": ["TEACHER"]            // array of RoleName enums, required, non-empty
}
```

**RoleName enum values:** `ADMIN`, `TEACHER`, `STUDENT`, `STAFF`

### Business Logic (AuthService.register)

The service method does the following **in a single transaction**:

| Step | Action |
|---|---|
| 1. | Look up the `School` by `schoolCode` (case-insensitive). Throws `NotFoundException` if the school doesn't exist. |
| 2. | Check for duplicate email within the school. Throws `ConflictException` if a user with the same email already exists under that school code. |
| 3. | Resolve each requested `Role` from the database by name. Throws `NotFoundException` if any role doesn't exist. |
| 4. | Create a new `User` entity with: `UUID.randomUUID()`, status = `ACTIVE`, BCrypt-hashed password. |
| 5. | Persist the user. |
| 6. | Write an `AuditLog` entry with action `"USER_REGISTERED"`. |
| 7. | Issue a JWT token pair and return it immediately — the user is **signed in right after registration**. |

### Response (AuthResponse)

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresAt": "2026-05-21T06:58:00Z",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "schoolId": "a1b2c3d4-...",
    "schoolCode": "DEMO",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "roles": ["TEACHER"],
    "status": "ACTIVE"
  }
}
```

**Note:** The password is **never** returned in any response.

---

## 2. User Entity Model

| Field | Type | Details |
|---|---|---|
| `id` | UUID | Primary key, generated at creation |
| `school` | `@ManyToOne` (User ↔ School) | Links the user to their school tenant |
| `fullName` | String | Up to 140 chars |
| `email` | String | Lowercased and trimmed before saving |
| `passwordHash` | String | BCrypt-encoded (strength: 12 rounds) |
| `status` | Enum (`ACTIVE` / `DISABLED`) | All new users start as `ACTIVE` |
| `roles` | `@ManyToMany` via `user_roles` join table | EAGER fetched |
| `createdAt` | Instant | Set at creation |
| `updatedAt` | Instant | Set at creation and on updates |

---

## 3. What Does NOT Exist

- **No admin-level user management CRUD** in the management API
  (`/api/v1/management`). The management controller handles students, teachers,
  exams, and notifications — but not `User` entities (the auth-domain users).
- **No "invite user" or "create user for someone else" flow.** Every user must
  register themselves via the public endpoint.
- **No frontend registration page.** The `LoginPage.tsx` has no "create account"
  link or registration form. Registration must be done via direct API call
  (curl, Postman, Swagger UI, or a custom frontend page).
- **No email verification / password reset flow.** Users are activated instantly
  with no email confirmation step.

---

## 4. How to Register (Currently)

Since there's no UI for it, registration can be done via:

**curl**
```bash
curl -X POST http://localhost/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "schoolCode": "DEMO",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "password": "securePass123",
    "roles": ["TEACHER"]
  }'
```

**Swagger UI**
Navigate to `/swagger-ui/index.html` on the running application and use the
`auth-controller / register` endpoint.

---

## 5. Seed Data

The seed users (created by Flyway migrations `V1` / `V2`) use fixed UUIDs and
are pre-registered. The demo login credentials are:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.school` | `Admin@12345` |

School code for demo data: **`DEMO`**

---

## 6. Audit Trail

Every registration creates an `AuditLog` entry:

| Field | Value |
|---|---|
| `action` | `"USER_REGISTERED"` |
| `entityType` | `"users"` |
| `entityId` | The newly created user's UUID |
| `schoolId` | The school the user belongs to |
| `performedBy` | The user's own ID (self-registration) |

---

## 7. Security Considerations

| Concern | Implementation |
|---|---|
| Rate limiting | `RateLimitFilter` runs before the auth filter — applies to all requests, including `/register` |
| Password strength | BCrypt-12 |
| Input validation | Jakarta Validation (`@NotBlank`, `@Email`, `@Size(min=8, max=120)`, `@NotEmpty roles`) |
| Duplicate prevention | Scoped per school: email uniqueness is checked within `schoolCode` |
| Password in responses | Never returned |
| School scoping | Every user belongs to exactly one school; the `school_id` foreign key enforces this at the DB level |

---

## 8. Future Improvements (Not Implemented)

- Frontend registration page (form with school code, name, email, password, role selector)
- Admin "invite user" / "create user on behalf of" endpoint in the management API
- Email verification flow
- Password reset / forgot password
- OAuth2 / social login integration
