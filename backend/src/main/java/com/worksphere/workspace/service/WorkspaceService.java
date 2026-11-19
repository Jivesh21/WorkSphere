package com.worksphere.workspace.service;

import com.worksphere.common.exception.ConflictException;
import com.worksphere.common.exception.ResourceNotFoundException;
import com.worksphere.security.CurrentUserService;
import com.worksphere.user.entity.User;
import com.worksphere.user.repository.UserRepository;
import com.worksphere.workspace.dto.CreateWorkspaceRequest;
import com.worksphere.workspace.dto.TransferOwnershipRequest;
import com.worksphere.workspace.dto.UpdateWorkspaceRequest;
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
     * Retrieves all workspaces the current user is a member of.
     */
    @Transactional(readOnly = true)
    public java.util.List<WorkspaceResponse> getUserWorkspaces(Authentication authentication) {
        Long currentUserId = currentUserService.getCurrentUserId(authentication);
        java.util.List<WorkspaceMember> memberships = workspaceMemberRepository.findByUserId(currentUserId);
        return memberships.stream()
                .map(WorkspaceMember::getWorkspace)
                .distinct()
                .map(this::toResponse)
                .toList();
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

    /**
     * Updates workspace metadata (name, description).
     * Caller must have OWNER or ADMIN role in the workspace.
     */
    @Transactional
    public WorkspaceResponse updateWorkspace(
            Long workspaceId,
            UpdateWorkspaceRequest request,
            Authentication authentication
    ) {
        Long currentUserId = currentUserService.getCurrentUserId(authentication);
        Workspace workspace = workspaceAuthorizationService.requireMemberManagementPermission(workspaceId, currentUserId);

        workspace.setName(request.getName().trim());
        workspace.setDescription(request.getDescription());

        Workspace saved = workspaceRepository.save(workspace);
        return toResponse(saved);
    }

    /**
     * Deletes a workspace and cleans up all member records.
     * Only the workspace OWNER can delete the workspace.
     */
    @Transactional
    public void deleteWorkspace(Long workspaceId, Authentication authentication) {
        Long currentUserId = currentUserService.getCurrentUserId(authentication);
        Workspace workspace = workspaceAuthorizationService.requireWorkspaceOwner(workspaceId, currentUserId);

        workspaceMemberRepository.deleteByWorkspaceId(workspaceId);
        workspaceRepository.delete(workspace);
    }

    /**
     * Transfers ownership of the workspace to another existing workspace member.
     * Only the current OWNER can transfer ownership.
     * The target member becomes the new OWNER, and the previous owner is assigned ADMIN.
     */
    @Transactional
    public WorkspaceResponse transferOwnership(
            Long workspaceId,
            TransferOwnershipRequest request,
            Authentication authentication
    ) {
        Long currentUserId = currentUserService.getCurrentUserId(authentication);
        Workspace workspace = workspaceAuthorizationService.requireWorkspaceOwner(workspaceId, currentUserId);

        WorkspaceMember currentOwnerMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current owner membership not found"));

        WorkspaceMember targetMember = workspaceMemberRepository.findById(request.getNewOwnerMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Target member not found"));

        if (!targetMember.getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Target member does not belong to this workspace");
        }

        if (targetMember.getId().equals(currentOwnerMember.getId())) {
            throw new ConflictException("User is already the workspace owner");
        }

        // Atomically transfer ownership
        workspace.setOwner(targetMember.getUser());
        targetMember.setRole(WorkspaceRole.OWNER);
        currentOwnerMember.setRole(WorkspaceRole.ADMIN);

        Workspace savedWorkspace = workspaceRepository.save(workspace);
        workspaceMemberRepository.save(targetMember);
        workspaceMemberRepository.save(currentOwnerMember);

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