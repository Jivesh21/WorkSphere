package com.worksphere.activity.controller;

import com.worksphere.activity.dto.ActivityRequest;
import com.worksphere.activity.dto.ActivityResponse;
import com.worksphere.activity.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    // Create activity
    @PostMapping
    public ResponseEntity<ActivityResponse> createActivity(
            @RequestBody ActivityRequest request) {

        return new ResponseEntity<>(
                activityService.createActivity(request),
                HttpStatus.CREATED
        );
    }

    // Get all activities
    @GetMapping
    public ResponseEntity<List<ActivityResponse>> getAllActivities() {

        return ResponseEntity.ok(
                activityService.getAllActivities()
        );
    }

    // Get activity by ID
    @GetMapping("/{id}")
    public ResponseEntity<ActivityResponse> getActivityById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                activityService.getActivityById(id)
        );
    }

    // Get activities by project
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ActivityResponse>> getActivitiesByProject(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                activityService.getActivitiesByProject(projectId)
        );
    }

    // Get activities by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ActivityResponse>> getActivitiesByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                activityService.getActivitiesByUser(userId)
        );
    }

    // Get activities by task
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<ActivityResponse>> getActivitiesByTask(
            @PathVariable Long taskId) {

        return ResponseEntity.ok(
                activityService.getActivitiesByTask(taskId)
        );
    }

    // Get activities by issue
    @GetMapping("/issue/{issueId}")
    public ResponseEntity<List<ActivityResponse>> getActivitiesByIssue(
            @PathVariable Long issueId) {

        return ResponseEntity.ok(
                activityService.getActivitiesByIssue(issueId)
        );
    }

    // Get activities by sprint
    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<List<ActivityResponse>> getActivitiesBySprint(
            @PathVariable Long sprintId) {

        return ResponseEntity.ok(
                activityService.getActivitiesBySprint(sprintId)
        );
    }

    // Delete activity
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(
            @PathVariable Long id) {

        activityService.deleteActivity(id);

        return ResponseEntity.noContent().build();
    }
}
