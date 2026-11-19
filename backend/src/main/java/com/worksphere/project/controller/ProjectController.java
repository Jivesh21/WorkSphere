package com.worksphere.project.controller;

import com.worksphere.common.response.ApiResponse;
import com.worksphere.project.dto.ProjectRequest;
import com.worksphere.project.dto.ProjectResponse;
import com.worksphere.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Projects", description = "Project management endpoints")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    @Operation(summary = "Get all accessible projects")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjects(
            @RequestParam(required = false) Long workspaceId,
            Authentication authentication
    ) {
        List<ProjectResponse> projects = projectService.getProjects(workspaceId, authentication);
        return ResponseEntity.ok(ApiResponse.ok("Projects retrieved successfully", projects));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        ProjectResponse project = projectService.getProjectById(id, authentication);
        return ResponseEntity.ok(ApiResponse.ok("Project retrieved successfully", project));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_PROJECT')")
    @Operation(summary = "Create a new project (Requires CREATE_PROJECT authority)")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody ProjectRequest request,
            Authentication authentication
    ) {
        ProjectResponse project = projectService.createProject(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Project created successfully", project));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('UPDATE_PROJECT')")
    @Operation(summary = "Update an existing project (Requires UPDATE_PROJECT authority)")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request,
            Authentication authentication
    ) {
        ProjectResponse project = projectService.updateProject(id, request, authentication);
        return ResponseEntity.ok(ApiResponse.ok("Project updated successfully", project));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_PROJECT')")
    @Operation(summary = "Delete a project (Requires DELETE_PROJECT authority)")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable Long id,
            Authentication authentication
    ) {
        projectService.deleteProject(id, authentication);
        return ResponseEntity.ok(ApiResponse.ok("Project deleted successfully", null));
    }
}
