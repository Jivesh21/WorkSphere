package com.worksphere.workspace.service;

import com.worksphere.common.exception.ResourceNotFoundException;
import com.worksphere.common.exception.UnauthorizedException;
import com.worksphere.workspace.entity.Workspace;
import com.worksphere.workspace.entity.WorkspaceMember;
import com.worksphere.workspace.entity.WorkspaceRole;
import com.worksphere.workspace.repository.WorkspaceMemberRepository;
import com.worksphere.workspace.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;

@Service
public class WorkspaceAuthorizationService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public WorkspaceAuthorizationService(
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository
    ) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    public Workspace verifyWorkspaceAccess(Long workspaceId, Long userId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        boolean isMember = workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId);
        boolean isOwner = workspace.getOwner() != null && workspace.getOwner().getId().equals(userId);

        if (!isMember && !isOwner) {
            throw new UnauthorizedException("You are not a member of this workspace");
        }

        return workspace;
    }

    public WorkspaceMember requireMembership(Long workspaceId, Long userId) {
        workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        return workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this workspace"));
    }

    public Workspace requireMemberManagementPermission(Long workspaceId, Long userId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this workspace"));

        if (member.getRole() != WorkspaceRole.OWNER && member.getRole() != WorkspaceRole.ADMIN) {
            throw new UnauthorizedException("You do not have permission to manage workspace members");
        }

        return workspace;
    }
}
