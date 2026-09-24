package com.worksphere.task.dto;
import com.worksphere.task.entity.TaskPriority;
import com.worksphere.task.entity.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskRequest {

    private String title;

    private String description;

    private TaskStatus status;

    private TaskPriority priority;

    private LocalDate dueDate;

    private Long projectId;

    private Long assignedUserId;

    // User who creates/updates the task
    private Long actorUserId;
}


