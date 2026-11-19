package com.worksphere.analytics.controller;

import com.worksphere.analytics.dto.AnalyticsResponse;
import com.worksphere.analytics.service.AnalyticsService;
import com.worksphere.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Analytics", description = "Workspace and project analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_ANALYTICS')")
    @Operation(summary = "Get overall analytics (Requires VIEW_ANALYTICS permission)")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getOverallAnalytics() {
        return ResponseEntity.ok(ApiResponse.ok("Analytics retrieved successfully", analyticsService.getOverallAnalytics()));
    }
}
