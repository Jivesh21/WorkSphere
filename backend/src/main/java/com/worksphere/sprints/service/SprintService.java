
package com.worksphere.sprints.service;

import com.worksphere.activity.dto.ActivityRequest;
import com.worksphere.activity.entity.ActivityType;
import com.worksphere.activity.service.ActivityService;
import com.worksphere.sprints.dto.SprintRequest;
import com.worksphere.sprints.dto.SprintResponse;
import com.worksphere.sprints.entity.Sprint;
import com.worksphere.sprints.entity.SprintStatus;
import com.worksphere.sprints.repository.SprintRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ActivityService activityService;

    public SprintService(
            SprintRepository sprintRepository,
            ActivityService activityService) {

        this.sprintRepository = sprintRepository;
        this.activityService = activityService;
    }

    // CREATE SPRINT
    public SprintResponse createSprint(
            SprintRequest request) {

        validateDates(request);

        Sprint sprint = Sprint.builder()
                .name(request.getName())
                .goal(request.getGoal())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus())
                .projectId(request.getProjectId())
                .build();

        Sprint savedSprint =
                sprintRepository.save(sprint);

        // SPRINT CREATED ACTIVITY
        ActivityRequest activityRequest =
                ActivityRequest.builder()
                        .actorUserId(request.getActorUserId())
                        .type(ActivityType.SPRINT_CREATED)
                        .description(
                                "Sprint created: "
                                        + savedSprint.getName()
                        )
                        .projectId(
                                savedSprint.getProjectId()
                        )
                        .sprintId(
                                savedSprint.getId()
                        )
                        .build();

        activityService.createActivity(
                activityRequest
        );

        return mapToResponse(savedSprint);
    }

    // GET ALL SPRINTS
    public List<SprintResponse> getAllSprints() {

        return sprintRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET SPRINT BY ID
    public SprintResponse getSprintById(
            Long id) {

        Sprint sprint =
                sprintRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Sprint not found"));

        return mapToResponse(sprint);
    }

    // GET SPRINTS BY PROJECT
    public List<SprintResponse> getSprintsByProject(
            Long projectId) {

        return sprintRepository
                .findByProjectId(projectId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET SPRINTS BY STATUS
    public List<SprintResponse> getSprintsByStatus(
            SprintStatus status) {

        return sprintRepository
                .findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // UPDATE SPRINT
    public SprintResponse updateSprint(
            Long id,
            SprintRequest request) {

        validateDates(request);

        Sprint sprint =
                sprintRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Sprint not found"));

        SprintStatus oldStatus =
                sprint.getStatus();

        sprint.setName(request.getName());
        sprint.setGoal(request.getGoal());
        sprint.setStartDate(request.getStartDate());
        sprint.setEndDate(request.getEndDate());
        sprint.setStatus(request.getStatus());
        sprint.setProjectId(request.getProjectId());

        Sprint updatedSprint =
                sprintRepository.save(sprint);

        // SPRINT STARTED
        if (oldStatus != SprintStatus.ACTIVE
                && updatedSprint.getStatus()
                == SprintStatus.ACTIVE) {

            ActivityRequest activityRequest =
                    ActivityRequest.builder()
                            .actorUserId(
                                    request.getActorUserId()
                            )
                            .type(
                                    ActivityType.SPRINT_STARTED
                            )
                            .description(
                                    "Sprint started: "
                                            + updatedSprint.getName()
                            )
                            .projectId(
                                    updatedSprint.getProjectId()
                            )
                            .sprintId(
                                    updatedSprint.getId()
                            )
                            .build();

            activityService.createActivity(
                    activityRequest
            );
        }

        // SPRINT COMPLETED
        else if (oldStatus != SprintStatus.COMPLETED
                && updatedSprint.getStatus()
                == SprintStatus.COMPLETED) {

            ActivityRequest activityRequest =
                    ActivityRequest.builder()
                            .actorUserId(
                                    request.getActorUserId()
                            )
                            .type(
                                    ActivityType.SPRINT_COMPLETED
                            )
                            .description(
                                    "Sprint completed: "
                                            + updatedSprint.getName()
                            )
                            .projectId(
                                    updatedSprint.getProjectId()
                            )
                            .sprintId(
                                    updatedSprint.getId()
                            )
                            .build();

            activityService.createActivity(
                    activityRequest
            );
        }

        return mapToResponse(updatedSprint);
    }

    // DELETE SPRINT
    public void deleteSprint(Long id) {

        if (!sprintRepository.existsById(id)) {

            throw new RuntimeException(
                    "Sprint not found");
        }

        sprintRepository.deleteById(id);
    }

    // VALIDATE DATES
    private void validateDates(
            SprintRequest request) {

        if (request.getStartDate() == null
                || request.getEndDate() == null) {

            throw new RuntimeException(
                    "Start date and end date are required");
        }

        if (request.getEndDate()
                .isBefore(request.getStartDate())) {

            throw new RuntimeException(
                    "End date cannot be before start date");
        }
    }

    // ENTITY → RESPONSE
    private SprintResponse mapToResponse(
            Sprint sprint) {

        return SprintResponse.builder()
                .id(sprint.getId())
                .name(sprint.getName())
                .goal(sprint.getGoal())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .status(sprint.getStatus())
                .projectId(sprint.getProjectId())
                .createdAt(sprint.getCreatedAt())
                .updatedAt(sprint.getUpdatedAt())
                .build();
    }
}


