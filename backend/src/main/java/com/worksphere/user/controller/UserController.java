package com.worksphere.user.controller;

import com.worksphere.common.response.ApiResponse;
import com.worksphere.user.dto.ChangeUserRoleRequest;
import com.worksphere.user.dto.UserResponse;
import com.worksphere.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "User Management", description = "Admin user and role management")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('MANAGE_USERS') or hasRole('ADMIN')")
    @Operation(summary = "List all users (Admin only)")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved successfully", userService.getAllUsers()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_USERS') or hasRole('ADMIN')")
    @Operation(summary = "Get user by ID (Admin only)")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("User retrieved successfully", userService.getUserById(id)));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasAuthority('MANAGE_USERS') or hasRole('ADMIN')")
    @Operation(summary = "Change user system role (Admin only)")
    public ResponseEntity<ApiResponse<UserResponse>> changeUserRole(
            @PathVariable Long id,
            @Valid @RequestBody ChangeUserRoleRequest request
    ) {
        UserResponse updated = userService.updateUserRole(id, request.getRole());
        return ResponseEntity.ok(ApiResponse.ok("User role updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('MANAGE_USERS') or hasRole('ADMIN')")
    @Operation(summary = "Enable or disable user account (Admin only)")
    public ResponseEntity<ApiResponse<UserResponse>> changeUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled
    ) {
        UserResponse updated = userService.updateUserStatus(id, enabled);
        return ResponseEntity.ok(ApiResponse.ok("User status updated successfully", updated));
    }
}
