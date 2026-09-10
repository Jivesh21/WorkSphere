package com.worksphere.workspace.repository;

import com.worksphere.workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {

    Optional<Workspace> findByIdAndOwnerId(Long workspaceId, Long ownerId);
}
