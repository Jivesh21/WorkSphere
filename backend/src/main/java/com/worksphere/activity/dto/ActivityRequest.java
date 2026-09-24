package com.worksphere.activity.dto;

import com.worksphere.activity.entity.ActivityType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityRequest {

    private Long actorUserId;

    private ActivityType type;

    private String description;

    private Long projectId;

    private Long taskId;

    private Long issueId;

    private Long sprintId;
}