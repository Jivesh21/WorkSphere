package com.worksphere.workspace.dto;

import com.worksphere.workspace.entity.WorkspaceRole;
import jakarta.validation.constraints.NotNull;

public class ChangeMemberRoleRequest {

    @NotNull(message = "Role is required")
    private WorkspaceRole role;

    public ChangeMemberRoleRequest() {
    }

    public WorkspaceRole getRole() {
        return role;
    }

    public void setRole(WorkspaceRole role) {
        this.role = role;
    }
}
