package com.worksphere.workspace.controller;

import com.worksphere.workspace.dto.AddMemberRequest;
import com.worksphere.workspace.dto.ChangeMemberRoleRequest;
import com.worksphere.workspace.dto.WorkspaceMemberResponse;
import com.worksphere.workspace.service.WorkspaceMemberService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/members")
public class WorkspaceMemberController {

    private final WorkspaceMemberService workspaceMemberService;

    public WorkspaceMemberController(
            WorkspaceMemberService workspaceMemberService
    ) {
        this.workspaceMemberService = workspaceMemberService;
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceMemberResponse>> getMembers(
            @PathVariable Long workspaceId
    ) {
        return ResponseEntity.ok(
                workspaceMemberService.getMembers(workspaceId)
        );
    }

    @PostMapping
    public ResponseEntity<WorkspaceMemberResponse> addMember(
            @PathVariable Long workspaceId,
            @Valid @RequestBody AddMemberRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                workspaceMemberService.addMember(
                        workspaceId,
                        request,
                        authentication
                )
        );
    }

    @PatchMapping("/{memberId}/role")
    public ResponseEntity<WorkspaceMemberResponse> changeMemberRole(
            @PathVariable Long workspaceId,
            @PathVariable Long memberId,
            @Valid @RequestBody ChangeMemberRoleRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                workspaceMemberService.changeMemberRole(
                        workspaceId,
                        memberId,
                        request,
                        authentication
                )
        );
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long workspaceId,
            @PathVariable Long memberId,
            Authentication authentication
    ) {
        workspaceMemberService.removeMember(
                workspaceId,
                memberId,
                authentication
        );

        return ResponseEntity.noContent().build();
    }
}
