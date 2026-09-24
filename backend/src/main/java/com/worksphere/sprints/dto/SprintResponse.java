package com.worksphere.sprints.dto;

import com.worksphere.sprints.entity.SprintStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class SprintResponse {

    private Long id;

    private String name;

    private String goal;

    private LocalDate startDate;

    private LocalDate endDate;

    private SprintStatus status;

    private Long projectId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}