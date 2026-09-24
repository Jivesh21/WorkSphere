package com.worksphere.task.dto;

import com.worksphere.task.entity.TaskPriority;
import com.worksphere.task.entity.TaskStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TaskResponse {

    private Long id;

    private String title;

    private String description;

    private TaskStatus status;

    private TaskPriority priority;

    private LocalDateTime dueDate;

    private Long projectId;

    private Long assignedUserId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
