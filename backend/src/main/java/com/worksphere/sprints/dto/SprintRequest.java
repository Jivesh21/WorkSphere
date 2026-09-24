package com.worksphere.sprints.dto;

import com.worksphere.sprints.entity.SprintStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class SprintRequest {

    private String name;

    private String goal;

    private LocalDate startDate;

    private LocalDate endDate;

    private SprintStatus status;

    private Long projectId;

    private Long actorUserId;
}
