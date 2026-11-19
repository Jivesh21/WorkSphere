package com.worksphere.workspace.repository;

import com.worksphere.workspace.entity.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {

    List<WorkspaceMember> findByWorkspaceId(Long workspaceId);

    void deleteByWorkspaceId(Long workspaceId);

    List<WorkspaceMember> findByUserId(Long userId);

    boolean existsByWorkspaceIdAndUserId(Long workspaceId, Long userId);

    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(
            Long workspaceId,
            Long userId
    );
}
