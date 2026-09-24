package com.worksphere.issue.repository;

import com.worksphere.issue.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    List<Issue> findByProjectId(Long projectId);

    List<Issue> findByAssignedUserId(Long assignedUserId);
}
