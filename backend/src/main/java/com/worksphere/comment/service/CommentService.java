
package com.worksphere.comment.service;

import com.worksphere.activity.dto.ActivityRequest;
import com.worksphere.activity.entity.ActivityType;
import com.worksphere.activity.service.ActivityService;
import com.worksphere.comment.dto.CommentRequest;
import com.worksphere.comment.dto.CommentResponse;
import com.worksphere.comment.entity.Comment;
import com.worksphere.comment.repository.CommentRepository;
import com.worksphere.issue.entity.Issue;
import com.worksphere.issue.repository.IssueRepository;
import com.worksphere.notification.dto.NotificationRequest;
import com.worksphere.notification.entity.NotificationType;
import com.worksphere.notification.service.NotificationService;
import com.worksphere.task.entity.Task;
import com.worksphere.task.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final ActivityService activityService;
    private final NotificationService notificationService;
    private final TaskRepository taskRepository;
    private final IssueRepository issueRepository;

    public CommentService(
            CommentRepository commentRepository,
            ActivityService activityService,
            NotificationService notificationService,
            TaskRepository taskRepository,
            IssueRepository issueRepository) {

        this.commentRepository = commentRepository;
        this.activityService = activityService;
        this.notificationService = notificationService;
        this.taskRepository = taskRepository;
        this.issueRepository = issueRepository;
    }

    // CREATE COMMENT
    public CommentResponse createComment(CommentRequest request) {

        validateCommentTarget(request);

        Comment comment = Comment.builder()
                .content(request.getContent())
                .userId(request.getUserId())
                .taskId(request.getTaskId())
                .issueId(request.getIssueId())
                .build();

        Comment savedComment =
                commentRepository.save(comment);

        // COMMENT ACTIVITY
        ActivityRequest.ActivityRequestBuilder activityBuilder =
                ActivityRequest.builder()
                        .actorUserId(savedComment.getUserId())
                        .type(ActivityType.COMMENT_ADDED)
                        .description("Comment added");

        if (savedComment.getTaskId() != null) {
            activityBuilder.taskId(savedComment.getTaskId());
        }

        if (savedComment.getIssueId() != null) {
            activityBuilder.issueId(savedComment.getIssueId());
        }

        activityService.createActivity(
                activityBuilder.build()
        );

        // COMMENT NOTIFICATION
        createCommentNotification(savedComment);

        return mapToResponse(savedComment);
    }

    // GET ALL COMMENTS
    public List<CommentResponse> getAllComments() {

        return commentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET COMMENT BY ID
    public CommentResponse getCommentById(Long id) {

        Comment comment =
                commentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Comment not found"));

        return mapToResponse(comment);
    }

    // GET COMMENTS BY TASK
    public List<CommentResponse> getCommentsByTask(
            Long taskId) {

        return commentRepository
                .findByTaskId(taskId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET COMMENTS BY ISSUE
    public List<CommentResponse> getCommentsByIssue(
            Long issueId) {

        return commentRepository
                .findByIssueId(issueId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // UPDATE COMMENT
    public CommentResponse updateComment(
            Long id,
            CommentRequest request) {

        Comment comment =
                commentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Comment not found"));

        if (request.getContent() == null ||
                request.getContent().isBlank()) {

            throw new RuntimeException(
                    "Comment content cannot be empty");
        }

        comment.setContent(request.getContent());

        Comment updatedComment =
                commentRepository.save(comment);

        // COMMENT UPDATED ACTIVITY
        ActivityRequest.ActivityRequestBuilder activityBuilder =
                ActivityRequest.builder()
                        .actorUserId(request.getUserId())
                        .type(ActivityType.COMMENT_UPDATED)
                        .description("Comment updated");

        if (updatedComment.getTaskId() != null) {
            activityBuilder.taskId(
                    updatedComment.getTaskId()
            );
        }

        if (updatedComment.getIssueId() != null) {
            activityBuilder.issueId(
                    updatedComment.getIssueId()
            );
        }

        activityService.createActivity(
                activityBuilder.build()
        );

        return mapToResponse(updatedComment);
    }

    // DELETE COMMENT
    public void deleteComment(Long id) {

        Comment comment =
                commentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Comment not found"));

        // COMMENT DELETED ACTIVITY
        ActivityRequest.ActivityRequestBuilder activityBuilder =
                ActivityRequest.builder()
                        .actorUserId(comment.getUserId())
                        .type(ActivityType.COMMENT_DELETED)
                        .description("Comment deleted");

        if (comment.getTaskId() != null) {
            activityBuilder.taskId(
                    comment.getTaskId()
            );
        }

        if (comment.getIssueId() != null) {
            activityBuilder.issueId(
                    comment.getIssueId()
            );
        }

        activityService.createActivity(
                activityBuilder.build()
        );

        commentRepository.deleteById(id);
    }

    // CREATE COMMENT NOTIFICATION
    private void createCommentNotification(
            Comment comment) {

        Long recipientUserId = null;
        String targetTitle = null;

        // COMMENT ON TASK
        if (comment.getTaskId() != null) {

            Task task =
                    taskRepository.findById(
                            comment.getTaskId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Task not found with id: "
                                            + comment.getTaskId()));

            recipientUserId =
                    task.getAssignedUserId();

            targetTitle = task.getTitle();
        }

        // COMMENT ON ISSUE
        else if (comment.getIssueId() != null) {

            Issue issue =
                    issueRepository.findById(
                            comment.getIssueId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Issue not found with id: "
                                            + comment.getIssueId()));

            recipientUserId =
                    issue.getAssignedUserId();

            targetTitle = issue.getTitle();
        }

        /*
         * No assigned user means there is nobody
         * to notify.
         */
        if (recipientUserId == null) {
            return;
        }

        /*
         * Don't notify the comment author
         * if they are the assigned user.
         */
        if (recipientUserId.equals(comment.getUserId())) {
            return;
        }

        NotificationRequest notificationRequest =
                NotificationRequest.builder()
                        .userId(recipientUserId)
                        .type(NotificationType.COMMENT_ADDED)
                        .title("New Comment")
                        .message(
                                "A new comment was added on: "
                                        + targetTitle
                        )
                        .taskId(comment.getTaskId())
                        .issueId(comment.getIssueId())
                        .build();

        notificationService.createNotification(
                notificationRequest
        );
    }

    // VALIDATE COMMENT TARGET
    private void validateCommentTarget(
            CommentRequest request) {

        boolean hasTask =
                request.getTaskId() != null;

        boolean hasIssue =
                request.getIssueId() != null;

        if (hasTask && hasIssue) {

            throw new RuntimeException(
                    "Comment cannot belong to both Task and Issue");
        }

        if (!hasTask && !hasIssue) {

            throw new RuntimeException(
                    "Comment must belong to a Task or Issue");
        }
    }

    // ENTITY → RESPONSE
    private CommentResponse mapToResponse(
            Comment comment) {

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .userId(comment.getUserId())
                .taskId(comment.getTaskId())
                .issueId(comment.getIssueId())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}



