package com.worksphere.project.dto;

import com.worksphere.project.entity.Project;
import com.worksphere.project.entity.ProjectHealth;
import com.worksphere.project.entity.ProjectStatus;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectResponse {

    private Long id;
    private String name;
    private String code;
    private String description;
    private String status;
    private String icon;
    private String accent;
    private String dueDate;
    private String health;
    private Long workspaceId;
    private Long ownerId;
    private Integer progress;
    private Integer completedTasks;
    private Integer totalTasks;
    private Instant createdAt;
    private Instant updatedAt;

    public static ProjectResponse from(Project project, int totalTasks, int completedTasks) {
        int progress = totalTasks > 0 ? (int) Math.round(((double) completedTasks / totalTasks) * 100) : 0;

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .code(project.getCode())
                .description(project.getDescription())
                .status(formatStatus(project.getStatus()))
                .icon(project.getIcon())
                .accent(project.getAccent())
                .dueDate(project.getDueDate() != null ? project.getDueDate().toString() : null)
                .health(formatHealth(project.getHealth()))
                .workspaceId(project.getWorkspace() != null ? project.getWorkspace().getId() : null)
                .ownerId(project.getOwner() != null ? project.getOwner().getId() : null)
                .progress(progress)
                .completedTasks(completedTasks)
                .totalTasks(totalTasks)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    public static String formatStatus(ProjectStatus status) {
        if (status == null) {
            return "Planning";
        }
        return switch (status) {
            case ACTIVE -> "Active";
            case PLANNING -> "Planning";
            case COMPLETED -> "Completed";
        };
    }

    public static String formatHealth(ProjectHealth health) {
        if (health == null) {
            return null;
        }
        return switch (health) {
            case ON_TRACK -> "On track";
            case AT_RISK -> "At risk";
        };
    }
}
