package com.worksphere.notification.dto;

import com.worksphere.notification.entity.NotificationType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {

    private Long userId;

    private NotificationType type;

    private String title;

    private String message;

    private Long taskId;

    private Long issueId;

    private Long projectId;

    private Long sprintId;
}
