package com.worksphere.workspace.service;

import com.worksphere.common.exception.BadRequestException;
import com.worksphere.common.exception.ConflictException;
import com.worksphere.common.exception.ResourceNotFoundException;
import com.worksphere.security.CurrentUserService;
import com.worksphere.user.entity.User;
import com.worksphere.user.repository.UserRepository;
import com.worksphere.workspace.dto.AddMemberRequest;
import com.worksphere.workspace.dto.ChangeMemberRoleRequest;
import com.worksphere.workspace.dto.WorkspaceMemberResponse;
import com.worksphere.workspace.entity.Workspace;
import com.worksphere.workspace.entity.WorkspaceMember;
import com.worksphere.workspace.entity.WorkspaceRole;
import com.worksphere.workspace.repository.WorkspaceMemberRepository;
import com.worksphere.workspace.repository.WorkspaceRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WorkspaceMemberService {

    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceAuthorizationService workspaceAuthorizationService;
    private final CurrentUserService currentUserService;

    public WorkspaceMemberService(
            WorkspaceMemberRepository workspaceMemberRepository,
            UserRepository userRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceAuthorizationService workspaceAuthorizationService,
            CurrentUserService currentUserService
    ) {
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceAuthorizationService = workspaceAuthorizationService;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<WorkspaceMemberResponse> getMembers(Long workspaceId, Authentication authentication) {
        Long currentUserId = currentUserService.getCurrentUserId(authentication);
        workspaceAuthorizationService.verifyWorkspaceAccess(workspaceId, currentUserId);

        List<WorkspaceMember> members =
                workspaceMemberRepository.findByWorkspaceId(workspaceId);

        return members.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public WorkspaceMemberResponse addMember(
            Long workspaceId,
            AddMemberRequest request,
            Authentication authentication
    ) {
        Long currentUserId = currentUserService.getCurrentUserId(authentication);
        Workspace workspace = workspaceAuthorizationService.requireMemberManagementPermission(workspaceId, currentUserId);

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(
                workspaceId,
                user.getId()
        )) {
            throw new ConflictException(
                    "User is already a member of this workspace"
            );
        }

        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspace(workspace);
        member.setUser(user);
        member.setRole(WorkspaceRole.WORKER);

        WorkspaceMember savedMember =
                workspaceMemberRepository.save(member);

        return toResponse(savedMember);
    }

    @Transactional
    public WorkspaceMemberResponse changeMemberRole(
            Long workspaceId,
            Long memberId,
            ChangeMemberRoleRequest request,
            Authentication authentication
    ) {
        Long currentUserId = currentUserService.getCurrentUserId(authentication);
        workspaceAuthorizationService.requireMemberManagementPermission(workspaceId, currentUserId);

        if (request.getRole() == WorkspaceRole.OWNER) {
            throw new BadRequestException("Cannot assign OWNER role");
        }

        WorkspaceMember member =
                workspaceMemberRepository.findById(memberId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Workspace member not found"
                                ));

        if (!member.getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException(
                    "Workspace member not found"
            );
        }

        if (member.getRole() == WorkspaceRole.OWNER) {
            throw new ConflictException(
                    "Owner role cannot be changed"
            );
        }

        member.setRole(request.getRole());

        WorkspaceMember updatedMember =
                workspaceMemberRepository.save(member);

        return toResponse(updatedMember);
    }

    @Transactional
    public void removeMember(
            Long workspaceId,
            Long memberId,
            Authentication authentication
    ) {
        Long currentUserId = currentUserService.getCurrentUserId(authentication);
        workspaceAuthorizationService.requireMemberManagementPermission(workspaceId, currentUserId);

        WorkspaceMember member =
                workspaceMemberRepository.findById(memberId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Workspace member not found"
                                ));

        if (!member.getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException(
                    "Workspace member not found"
            );
        }

        if (member.getRole() == WorkspaceRole.OWNER) {
            throw new ConflictException(
                    "Workspace owner cannot be removed"
            );
        }

        workspaceMemberRepository.delete(member);
    }

    private WorkspaceMemberResponse toResponse(WorkspaceMember member) {
        return new WorkspaceMemberResponse(
                member.getId(),
                member.getUser().getId(),
                member.getUser().getName(),
                member.getUser().getEmail(),
                member.getRole(),
                member.getJoinedAt()
        );
    }
}
