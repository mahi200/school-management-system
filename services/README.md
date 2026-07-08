# Service Modules

The system starts with a working `auth-service` and these planned service boundaries:

- `student-service`
- `teacher-service`
- `attendance-service`
- `fees-service`
- `notification-service`

Each future service should keep the same package shape used by `auth-service`:

```text
adapter/in/web
adapter/out/persistence
application/dto
application/mapper
application/service
domain/model
domain/repository
infrastructure/config
```

Do not add these placeholder services to `docker-compose.yml` until their health checks and migrations are implemented, so `docker compose up --build` remains a single-command working local stack.

