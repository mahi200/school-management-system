package com.school.auth.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    private UUID id;

    @Column(name = "school_id", nullable = false)
    private UUID schoolId;

    @Column(name = "actor_user_id")
    private UUID actorUserId;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String resource;

    @Column(name = "resource_id")
    private UUID resourceId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected AuditLog() {
    }

    public AuditLog(UUID id, UUID schoolId, UUID actorUserId, String action, String resource, UUID resourceId, Instant createdAt) {
        this.id = id;
        this.schoolId = schoolId;
        this.actorUserId = actorUserId;
        this.action = action;
        this.resource = resource;
        this.resourceId = resourceId;
        this.createdAt = createdAt;
    }
}

