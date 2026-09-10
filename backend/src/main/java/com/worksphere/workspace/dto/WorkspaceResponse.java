package com.worksphere.workspace.dto;

import java.time.Instant;

public class WorkspaceResponse {

    private Long id;
    private String name;
    private String description;
    private Long ownerId;
    private Instant createdAt;
    private Instant updatedAt;

    public WorkspaceResponse() {
    }

    public WorkspaceResponse(
            Long id,
            String name,
            String description,
            Long ownerId,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.ownerId = ownerId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
