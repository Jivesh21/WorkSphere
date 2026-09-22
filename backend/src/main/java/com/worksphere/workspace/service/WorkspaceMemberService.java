package com.worksphere.workspace.service;

import com.worksphere.common.exception.ConflictException;
import com.worksphere.common.exception.ResourceNotFoundException;
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

import java.util.List;

@Service
public class WorkspaceMemberService {

    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;

    public WorkspaceMemberService(
            WorkspaceMemberRepository workspaceMemberRepository,
            UserRepository userRepository,
            WorkspaceRepository workspaceRepository
    ) {
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
    }

    public List<WorkspaceMemberResponse> getMembers(Long workspaceId) {

        List<WorkspaceMember> members =
                workspaceMemberRepository.findByWorkspaceId(workspaceId);

        return members.stream()
                .map(member -> new WorkspaceMemberResponse(
                        member.getId(),
                        member.getUser().getId(),
                        member.getUser().getName(),
                        member.getUser().getEmail(),
                        member.getRole(),
                        member.getJoinedAt()
                ))
                .toList();
    }

    public WorkspaceMemberResponse addMember(
            Long workspaceId,
            AddMemberRequest request,
            Authentication authentication
    ) {

        Long currentUserId = getCurrentUserId(authentication);

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Workspace not found"));

        checkMemberManagementPermission(workspaceId, currentUserId);

        User user = userRepository.findByEmail(request.getEmail())
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

        return new WorkspaceMemberResponse(
                savedMember.getId(),
                savedMember.getUser().getId(),
                savedMember.getUser().getName(),
                savedMember.getUser().getEmail(),
                savedMember.getRole(),
                savedMember.getJoinedAt()
        );
    }

    public WorkspaceMemberResponse changeMemberRole(
            Long workspaceId,
            Long memberId,
            ChangeMemberRoleRequest request,
            Authentication authentication
    ) {

        Long currentUserId = getCurrentUserId(authentication);

        workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Workspace not found"));

        checkMemberManagementPermission(workspaceId, currentUserId);

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

        return new WorkspaceMemberResponse(
                updatedMember.getId(),
                updatedMember.getUser().getId(),
                updatedMember.getUser().getName(),
                updatedMember.getUser().getEmail(),
                updatedMember.getRole(),
                updatedMember.getJoinedAt()
        );
    }

    public void removeMember(
            Long workspaceId,
            Long memberId,
            Authentication authentication
    ) {

        Long currentUserId = getCurrentUserId(authentication);

        workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Workspace not found"));

        checkMemberManagementPermission(workspaceId, currentUserId);

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

    private Long getCurrentUserId(Authentication authentication) {

        return ((com.worksphere.security.CustomUserDetails)
                authentication.getPrincipal()).getUserId();
    }

    private void checkMemberManagementPermission(
            Long workspaceId,
            Long currentUserId
    ) {

        WorkspaceMember member =
                workspaceMemberRepository
                        .findByWorkspaceIdAndUserId(
                                workspaceId,
                                currentUserId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "You are not a member of this workspace"
                                ));

        if (member.getRole() != WorkspaceRole.OWNER
                && member.getRole() != WorkspaceRole.ADMIN) {

            throw new com.worksphere.common.exception.UnauthorizedException(
                    "You do not have permission to manage workspace members"
            );
        }
    }
}
