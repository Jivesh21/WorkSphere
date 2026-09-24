package com.worksphere.analytics.controller;

import com.worksphere.analytics.dto.AnalyticsResponse;
import com.worksphere.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<AnalyticsResponse> getOverallAnalytics() {

        return ResponseEntity.ok(
                analyticsService.getOverallAnalytics()
        );
    }
}
