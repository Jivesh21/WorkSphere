package com.worksphere.issue.service;

import com.worksphere.activity.dto.ActivityRequest;
import com.worksphere.activity.entity.ActivityType;
import com.worksphere.activity.service.ActivityService;
import com.worksphere.issue.dto.IssueRequest;
import com.worksphere.issue.dto.IssueResponse;
import com.worksphere.issue.entity.Issue;
import com.worksphere.issue.repository.IssueRepository;
import com.worksphere.notification.dto.NotificationRequest;
import com.worksphere.notification.entity.NotificationType;
import com.worksphere.notification.service.NotificationService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final ActivityService activityService;
    private final NotificationService notificationService;

    public IssueService(
            IssueRepository issueRepository,
            ActivityService activityService,
            NotificationService notificationService) {

        this.issueRepository = issueRepository;
        this.activityService = activityService;
        this.notificationService = notificationService;
    }

    // CREATE
    public IssueResponse createIssue(IssueRequest request) {

        Issue issue = Issue.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .status(request.getStatus())
                .priority(request.getPriority())
                .projectId(request.getProjectId())
                .assignedUserId(request.getAssignedUserId())
                .build();

        Issue savedIssue = issueRepository.save(issue);

        // ISSUE CREATED ACTIVITY
        ActivityRequest activityRequest = ActivityRequest.builder()
                .actorUserId(request.getActorUserId())
                .type(ActivityType.ISSUE_CREATED)
                .description("Issue created: " + savedIssue.getTitle())
                .projectId(savedIssue.getProjectId())
                .build();

        activityService.createActivity(activityRequest);

        // ISSUE ASSIGNED NOTIFICATION
        if (savedIssue.getAssignedUserId() != null) {

            NotificationRequest notificationRequest =
                    NotificationRequest.builder()
                            .userId(savedIssue.getAssignedUserId())
                            .type(NotificationType.ISSUE_ASSIGNED)
                            .title("Issue Assigned")
                            .message("You have been assigned an issue: "
                                    + savedIssue.getTitle())
                            .issueId(savedIssue.getId())
                            .projectId(savedIssue.getProjectId())
                            .build();

            notificationService.createNotification(
                    notificationRequest
            );
        }

        return mapToResponse(savedIssue);
    }

    // GET ALL
    public List<IssueResponse> getAllIssues() {

        return issueRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET BY ID
    public IssueResponse getIssueById(Long id) {

        Issue issue = issueRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Issue not found"));

        return mapToResponse(issue);
    }

    // GET BY PROJECT
    public List<IssueResponse> getIssuesByProject(Long projectId) {

        return issueRepository.findByProjectId(projectId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // UPDATE
    public IssueResponse updateIssue(
            Long id,
            IssueRequest request) {

        Issue issue = issueRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Issue not found"));

        // Store old values before updating
        var oldStatus = issue.getStatus();
        Long oldAssignedUserId = issue.getAssignedUserId();

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setType(request.getType());
        issue.setStatus(request.getStatus());
        issue.setPriority(request.getPriority());
        issue.setProjectId(request.getProjectId());
        issue.setAssignedUserId(request.getAssignedUserId());

        Issue updatedIssue = issueRepository.save(issue);

        // STATUS CHANGED
        if (oldStatus != updatedIssue.getStatus()
                && updatedIssue.getStatus() != null) {

            ActivityRequest activityRequest =
                    ActivityRequest.builder()
                            .actorUserId(request.getActorUserId())
                            .type(ActivityType.ISSUE_STATUS_CHANGED)
                            .description("Issue status changed: "
                                    + updatedIssue.getTitle())
                            .projectId(updatedIssue.getProjectId())
                            .build();

            activityService.createActivity(activityRequest);

            // STATUS CHANGE NOTIFICATION
            if (updatedIssue.getAssignedUserId() != null) {

                NotificationRequest notificationRequest =
                        NotificationRequest.builder()
                                .userId(updatedIssue.getAssignedUserId())
                                .type(NotificationType.ISSUE_STATUS_CHANGED)
                                .title("Issue Status Changed")
                                .message("The status of issue '"
                                        + updatedIssue.getTitle()
                                        + "' has been changed.")
                                .issueId(updatedIssue.getId())
                                .projectId(updatedIssue.getProjectId())
                                .build();

                notificationService.createNotification(
                        notificationRequest
                );
            }

        } else {

            // NORMAL ISSUE UPDATE
            ActivityRequest activityRequest =
                    ActivityRequest.builder()
                            .actorUserId(request.getActorUserId())
                            .type(ActivityType.ISSUE_UPDATED)
                            .description("Issue updated: "
                                    + updatedIssue.getTitle())
                            .projectId(updatedIssue.getProjectId())
                            .build();

            activityService.createActivity(activityRequest);
        }

        // NEW ASSIGNEE
        if (updatedIssue.getAssignedUserId() != null
                && !updatedIssue.getAssignedUserId()
                .equals(oldAssignedUserId)) {

            NotificationRequest notificationRequest =
                    NotificationRequest.builder()
                            .userId(updatedIssue.getAssignedUserId())
                            .type(NotificationType.ISSUE_ASSIGNED)
                            .title("Issue Assigned")
                            .message("You have been assigned an issue: "
                                    + updatedIssue.getTitle())
                            .issueId(updatedIssue.getId())
                            .projectId(updatedIssue.getProjectId())
                            .build();

            notificationService.createNotification(
                    notificationRequest
            );
        }

        return mapToResponse(updatedIssue);
    }

    // DELETE
    public void deleteIssue(Long id) {

        if (!issueRepository.existsById(id)) {
            throw new RuntimeException("Issue not found");
        }

        issueRepository.deleteById(id);
    }

    // ENTITY → RESPONSE
    private IssueResponse mapToResponse(Issue issue) {

        return IssueResponse.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .type(issue.getType())
                .status(issue.getStatus())
                .priority(issue.getPriority())
                .projectId(issue.getProjectId())
                .assignedUserId(issue.getAssignedUserId())
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .build();
    }
}
