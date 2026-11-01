package com.worksphere.workspace.service;

import com.worksphere.common.exception.ResourceNotFoundException;
import com.worksphere.security.CurrentUserService;
import com.worksphere.user.entity.User;
import com.worksphere.user.repository.UserRepository;
import com.worksphere.workspace.dto.CreateWorkspaceRequest;
import com.worksphere.workspace.dto.WorkspaceResponse;
import com.worksphere.workspace.entity.Workspace;
import com.worksphere.workspace.entity.WorkspaceMember;
import com.worksphere.workspace.entity.WorkspaceRole;
import com.worksphere.workspace.repository.WorkspaceMemberRepository;
import com.worksphere.workspace.repository.WorkspaceRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final WorkspaceAuthorizationService workspaceAuthorizationService;
    private final CurrentUserService currentUserService;

    public WorkspaceService(
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            UserRepository userRepository,
            WorkspaceAuthorizationService workspaceAuthorizationService,
            CurrentUserService currentUserService
    ) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
        this.workspaceAuthorizationService = workspaceAuthorizationService;
        this.currentUserService = currentUserService;
    }

    /**
     * Retrieves workspace details, ensuring caller is an authorized member or owner of the workspace.
     */
    @Transactional(readOnly = true)
    public WorkspaceResponse getWorkspace(Long workspaceId, Authentication authentication) {
        Long currentUserId = currentUserService.getCurrentUserId(authentication);
        Workspace workspace = workspaceAuthorizationService.verifyWorkspaceAccess(workspaceId, currentUserId);
        return toResponse(workspace);
    }

    /**
     * Creates a workspace and establishes the creator as both the workspace owner
     * and a workspace member with role=OWNER atomically.
     *
     * Invariant:
     * - Every workspace has exactly one OWNER membership.
     * - Workspace.owner and the WorkspaceMember with role=OWNER refer to the same user.
     */
    @Transactional
    public WorkspaceResponse createWorkspace(CreateWorkspaceRequest request, Authentication authentication) {
        Long currentUserId = currentUserService.getCurrentUserId(authentication);
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Workspace workspace = new Workspace();
        workspace.setName(request.getName().trim());
        workspace.setDescription(request.getDescription());
        workspace.setOwner(currentUser);

        Workspace savedWorkspace = workspaceRepository.save(workspace);

        WorkspaceMember ownerMember = new WorkspaceMember();
        ownerMember.setWorkspace(savedWorkspace);
        ownerMember.setUser(currentUser);
        ownerMember.setRole(WorkspaceRole.OWNER);

        workspaceMemberRepository.save(ownerMember);

        return toResponse(savedWorkspace);
    }

    private WorkspaceResponse toResponse(Workspace workspace) {
        return new WorkspaceResponse(
                workspace.getId(),
                workspace.getName(),
                workspace.getDescription(),
                workspace.getOwner().getId(),
                workspace.getCreatedAt(),
                workspace.getUpdatedAt()
        );
    }
}