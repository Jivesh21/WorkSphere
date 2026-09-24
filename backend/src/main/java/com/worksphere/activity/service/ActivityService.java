package com.worksphere.activity.service;

import com.worksphere.activity.dto.ActivityRequest;
import com.worksphere.activity.dto.ActivityResponse;
import com.worksphere.activity.entity.Activity;
import com.worksphere.activity.entity.ActivityType;
import com.worksphere.activity.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;

    // Create Activity
    public ActivityResponse createActivity(ActivityRequest request) {

        if (request.getActorUserId() == null) {
            throw new RuntimeException("Actor user ID is required");
        }

        if (request.getType() == null) {
            throw new RuntimeException("Activity type is required");
        }

        if (request.getDescription() == null ||
                request.getDescription().isBlank()) {
            throw new RuntimeException("Activity description is required");
        }

        Activity activity = Activity.builder()
                .actorUserId(request.getActorUserId())
                .type(request.getType())
                .description(request.getDescription())
                .projectId(request.getProjectId())
                .taskId(request.getTaskId())
                .issueId(request.getIssueId())
                .sprintId(request.getSprintId())
                .build();

        Activity savedActivity = activityRepository.save(activity);

        return mapToResponse(savedActivity);
    }

    // Get all activities
    public List<ActivityResponse> getAllActivities() {

        return activityRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get activity by ID
    public ActivityResponse getActivityById(Long id) {

        Activity activity = activityRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Activity not found with id: " + id));

        return mapToResponse(activity);
    }

    // Get activities by project
    public List<ActivityResponse> getActivitiesByProject(Long projectId) {

        return activityRepository.findByProjectId(projectId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get activities by user
    public List<ActivityResponse> getActivitiesByUser(Long userId) {

        return activityRepository.findByActorUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get activities by task
    public List<ActivityResponse> getActivitiesByTask(Long taskId) {

        return activityRepository.findByTaskId(taskId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get activities by issue
    public List<ActivityResponse> getActivitiesByIssue(Long issueId) {

        return activityRepository.findByIssueId(issueId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get activities by sprint
    public List<ActivityResponse> getActivitiesBySprint(Long sprintId) {

        return activityRepository.findBySprintId(sprintId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Delete activity
    public void deleteActivity(Long id) {

        if (!activityRepository.existsById(id)) {
            throw new RuntimeException("Activity not found with id: " + id);
        }

        activityRepository.deleteById(id);
    }
    public void createTaskActivity(
            Long actorUserId,
            String description,
            Long projectId,
            Long taskId,
            ActivityType type) {

        ActivityRequest request = ActivityRequest.builder()
                .actorUserId(actorUserId)
                .type(type)
                .description(description)
                .projectId(projectId)
                .taskId(taskId)
                .build();

        createActivity(request);
    }

    // Entity -> Response
    private ActivityResponse mapToResponse(Activity activity) {

        return ActivityResponse.builder()
                .id(activity.getId())
                .actorUserId(activity.getActorUserId())
                .type(activity.getType())
                .description(activity.getDescription())
                .projectId(activity.getProjectId())
                .taskId(activity.getTaskId())
                .issueId(activity.getIssueId())
                .sprintId(activity.getSprintId())
                .createdAt(activity.getCreatedAt())
                .build();
    }

}
