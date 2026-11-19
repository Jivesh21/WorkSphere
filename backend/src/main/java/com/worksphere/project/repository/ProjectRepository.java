package com.worksphere.project.repository;

import com.worksphere.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);

    Optional<Project> findByCodeIgnoreCase(String code);

    List<Project> findByWorkspaceIdOrderByCreatedAtDesc(Long workspaceId);

    List<Project> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    @Query("SELECT p FROM Project p WHERE p.owner.id = :userId OR (p.workspace IS NOT NULL AND p.workspace.id IN :workspaceIds) ORDER BY p.createdAt DESC")
    List<Project> findAccessibleProjects(@Param("userId") Long userId, @Param("workspaceIds") List<Long> workspaceIds);
}
