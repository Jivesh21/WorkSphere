package com.worksphere.workspace.controller;

import com.worksphere.workspace.dto.CreateWorkspaceRequest;
import com.worksphere.workspace.dto.TransferOwnershipRequest;
import com.worksphere.workspace.dto.UpdateWorkspaceRequest;
import com.worksphere.workspace.dto.WorkspaceResponse;
import com.worksphere.workspace.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceResponse>> getUserWorkspaces(
            Authentication authentication
    ) {
        return ResponseEntity.ok(workspaceService.getUserWorkspaces(authentication));
    }

    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(
            @Valid @RequestBody CreateWorkspaceRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workspaceService.createWorkspace(request, authentication));
    }

    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceResponse> getWorkspace(
            @PathVariable Long workspaceId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                workspaceService.getWorkspace(workspaceId, authentication)
        );
    }

    @PutMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceResponse> updateWorkspace(
            @PathVariable Long workspaceId,
            @Valid @RequestBody UpdateWorkspaceRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                workspaceService.updateWorkspace(workspaceId, request, authentication)
        );
    }

    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<Void> deleteWorkspace(
            @PathVariable Long workspaceId,
            Authentication authentication
    ) {
        workspaceService.deleteWorkspace(workspaceId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{workspaceId}/transfer-ownership")
    public ResponseEntity<WorkspaceResponse> transferOwnership(
            @PathVariable Long workspaceId,
            @Valid @RequestBody TransferOwnershipRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                workspaceService.transferOwnership(workspaceId, request, authentication)
        );
    }
}
