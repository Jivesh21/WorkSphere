package com.worksphere.sprints.controller;

import com.worksphere.sprints.dto.SprintRequest;
import com.worksphere.sprints.dto.SprintResponse;
import com.worksphere.sprints.entity.SprintStatus;
import com.worksphere.sprints.service.SprintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Sprints", description = "Sprint planning endpoints")
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    // CREATE
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROJECT_MANAGER') or hasRole('TEAM_LEAD')")
    @Operation(summary = "Create sprint (Requires ADMIN, PROJECT_MANAGER, or TEAM_LEAD)")
    public ResponseEntity<SprintResponse> createSprint(
            @RequestBody SprintRequest request) {

        SprintResponse response =
                sprintService.createSprint(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // GET ALL
    @GetMapping
    @Operation(summary = "Get all sprints")
    public ResponseEntity<List<SprintResponse>> getAllSprints() {

        return ResponseEntity.ok(
                sprintService.getAllSprints()
        );
    }

    // GET BY ID
    @GetMapping("/{id}")
    @Operation(summary = "Get sprint by ID")
    public ResponseEntity<SprintResponse> getSprintById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                sprintService.getSprintById(id)
        );
    }

    // GET BY PROJECT
    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get sprints by project")
    public ResponseEntity<List<SprintResponse>> getSprintsByProject(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                sprintService.getSprintsByProject(projectId)
        );
    }

    // GET BY STATUS
    @GetMapping("/status/{status}")
    @Operation(summary = "Get sprints by status")
    public ResponseEntity<List<SprintResponse>> getSprintsByStatus(
            @PathVariable SprintStatus status) {

        return ResponseEntity.ok(
                sprintService.getSprintsByStatus(status)
        );
    }

    // UPDATE
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROJECT_MANAGER') or hasRole('TEAM_LEAD')")
    @Operation(summary = "Update sprint (Requires ADMIN, PROJECT_MANAGER, or TEAM_LEAD)")
    public ResponseEntity<SprintResponse> updateSprint(
            @PathVariable Long id,
            @RequestBody SprintRequest request) {

        return ResponseEntity.ok(
                sprintService.updateSprint(id, request)
        );
    }

    // DELETE
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROJECT_MANAGER')")
    @Operation(summary = "Delete sprint (Requires ADMIN or PROJECT_MANAGER)")
    public ResponseEntity<Void> deleteSprint(
            @PathVariable Long id) {

        sprintService.deleteSprint(id);

        return ResponseEntity.noContent().build();
    }
}
