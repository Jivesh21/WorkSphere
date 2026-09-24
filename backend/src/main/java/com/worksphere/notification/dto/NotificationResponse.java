package com.worksphere.notification.dto;

import com.worksphere.notification.entity.NotificationStatus;
import com.worksphere.notification.entity.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long id;

    private Long userId;

    private NotificationType type;

    private String title;

    private String message;

    private Long taskId;

    private Long issueId;

    private Long projectId;

    private Long sprintId;

    private NotificationStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime readAt;
}