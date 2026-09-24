package com.worksphere.notification.service;

import com.worksphere.notification.dto.NotificationRequest;
import com.worksphere.notification.dto.NotificationResponse;
import com.worksphere.notification.entity.Notification;
import com.worksphere.notification.entity.NotificationStatus;
import com.worksphere.notification.entity.NotificationType;
import com.worksphere.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // CREATE NOTIFICATION
    public NotificationResponse createNotification(
            NotificationRequest request) {

        // Validation
        if (request.getUserId() == null) {
            throw new RuntimeException(
                    "Notification recipient user ID is required");
        }

        if (request.getType() == null) {
            throw new RuntimeException(
                    "Notification type is required");
        }

        if (request.getTitle() == null ||
                request.getTitle().isBlank()) {

            throw new RuntimeException(
                    "Notification title is required");
        }

        if (request.getMessage() == null ||
                request.getMessage().isBlank()) {

            throw new RuntimeException(
                    "Notification message is required");
        }

        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .taskId(request.getTaskId())
                .issueId(request.getIssueId())
                .projectId(request.getProjectId())
                .sprintId(request.getSprintId())
                .status(NotificationStatus.UNREAD)
                .build();

        Notification savedNotification =
                notificationRepository.save(notification);

        return mapToResponse(savedNotification);
    }

    // GET ALL NOTIFICATIONS
    public List<NotificationResponse> getAllNotifications() {

        return notificationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET NOTIFICATION BY ID
    public NotificationResponse getNotificationById(Long id) {

        Notification notification =
                notificationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found with id: "
                                                + id));

        return mapToResponse(notification);
    }

    // GET NOTIFICATIONS BY USER
    public List<NotificationResponse> getNotificationsByUser(
            Long userId) {

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET UNREAD NOTIFICATIONS
    public List<NotificationResponse> getUnreadNotifications(
            Long userId) {

        return notificationRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(
                        userId,
                        NotificationStatus.UNREAD
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // MARK NOTIFICATION AS READ
    public NotificationResponse markAsRead(Long id) {

        Notification notification =
                notificationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found with id: "
                                                + id));

        notification.setStatus(NotificationStatus.READ);
        notification.setReadAt(LocalDateTime.now());

        Notification updatedNotification =
                notificationRepository.save(notification);

        return mapToResponse(updatedNotification);
    }

    // DELETE NOTIFICATION
    public void deleteNotification(Long id) {

        if (!notificationRepository.existsById(id)) {

            throw new RuntimeException(
                    "Notification not found with id: " + id);
        }

        notificationRepository.deleteById(id);
    }

    // CREATE TASK NOTIFICATION
    public void createTaskNotification(
            Long userId,
            Long taskId,
            Long projectId,
            String title,
            String message,
            NotificationType type) {

        NotificationRequest request =
                NotificationRequest.builder()
                        .userId(userId)
                        .type(type)
                        .title(title)
                        .message(message)
                        .taskId(taskId)
                        .projectId(projectId)
                        .build();

        createNotification(request);
    }

    // ENTITY → RESPONSE
    private NotificationResponse mapToResponse(
            Notification notification) {

        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .taskId(notification.getTaskId())
                .issueId(notification.getIssueId())
                .projectId(notification.getProjectId())
                .sprintId(notification.getSprintId())
                .status(notification.getStatus())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
}
