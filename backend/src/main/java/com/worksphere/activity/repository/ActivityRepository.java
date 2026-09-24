package com.worksphere.activity.repository;

import com.worksphere.activity.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByProjectId(Long projectId);

    List<Activity> findByActorUserId(Long actorUserId);

    List<Activity> findByTaskId(Long taskId);

    List<Activity> findByIssueId(Long issueId);

    List<Activity> findBySprintId(Long sprintId);
}