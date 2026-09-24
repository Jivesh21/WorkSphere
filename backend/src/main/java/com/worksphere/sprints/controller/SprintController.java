package com.worksphere.sprints.controller;

import com.worksphere.sprints.dto.SprintRequest;
import com.worksphere.sprints.dto.SprintResponse;
import com.worksphere.sprints.entity.SprintStatus;
import com.worksphere.sprints.service.SprintService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    // CREATE
    @PostMapping
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
    public ResponseEntity<List<SprintResponse>> getAllSprints() {

        return ResponseEntity.ok(
                sprintService.getAllSprints()
        );
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<SprintResponse> getSprintById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                sprintService.getSprintById(id)
        );
    }

    // GET BY PROJECT
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<SprintResponse>> getSprintsByProject(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                sprintService.getSprintsByProject(projectId)
        );
    }

    // GET BY STATUS
    @GetMapping("/status/{status}")
    public ResponseEntity<List<SprintResponse>> getSprintsByStatus(
            @PathVariable SprintStatus status) {

        return ResponseEntity.ok(
                sprintService.getSprintsByStatus(status)
        );
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<SprintResponse> updateSprint(
            @PathVariable Long id,
            @RequestBody SprintRequest request) {

        return ResponseEntity.ok(
                sprintService.updateSprint(id, request)
        );
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(
            @PathVariable Long id) {

        sprintService.deleteSprint(id);

        return ResponseEntity.noContent().build();
    }
}
