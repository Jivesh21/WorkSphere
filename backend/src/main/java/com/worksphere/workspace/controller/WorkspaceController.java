package com.worksphere.workspace.controller;

import com.worksphere.workspace.dto.WorkspaceResponse;
import com.worksphere.workspace.service.WorkspaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceResponse> getWorkspace(
            @PathVariable Long workspaceId
    ) {
        return ResponseEntity.ok(
                workspaceService.getWorkspace(workspaceId)
        );
    }
}
