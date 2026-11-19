package com.worksphere.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectRequest {

    @NotBlank(message = "Project name is required")
    @Size(max = 100, message = "Project name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "Project code is required")
    @Pattern(regexp = "^[A-Za-z0-9][A-Za-z0-9-]{1,7}$", message = "Project key must be 2–8 alphanumeric characters or hyphens")
    private String code;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    private String status;

    private String icon;

    private String accent;

    private LocalDate dueDate;

    private String health;

    private Long workspaceId;
}
