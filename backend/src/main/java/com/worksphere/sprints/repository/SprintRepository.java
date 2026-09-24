package com.worksphere.sprints.repository;

import com.worksphere.sprints.entity.Sprint;
import com.worksphere.sprints.entity.SprintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, Long> {

    List<Sprint> findByProjectId(Long projectId);

    List<Sprint> findByStatus(SprintStatus status);
}
