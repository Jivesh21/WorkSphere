package com.worksphere.workspace.dto;

import com.worksphere.workspace.entity.WorkspaceRole;

import java.time.Instant;

public class WorkspaceMemberResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private WorkspaceRole role;
    private Instant joinedAt;

    public WorkspaceMemberResponse() {
    }

    public WorkspaceMemberResponse(
            Long id,
            Long userId,
            String userName,
            String userEmail,
            WorkspaceRole role,
            Instant joinedAt
    ) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public WorkspaceRole getRole() {
        return role;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }
}
