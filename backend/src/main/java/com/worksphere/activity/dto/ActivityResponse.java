package com.worksphere.activity.dto;

import com.worksphere.activity.entity.ActivityType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponse {

    private Long id;

    private Long actorUserId;

    private ActivityType type;

    private String description;

    private Long projectId;

    private Long taskId;

    private Long issueId;

    private Long sprintId;

    private LocalDateTime createdAt;
}