package com.worksphere.analytics.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponse {

    private Long totalTasks;

    private Long todoTasks;

    private Long inProgressTasks;

    private Long inReviewTasks;

    private Long completedTasks;

    private Long totalIssues;

    private Long openIssues;

    private Long inProgressIssues;

    private Long resolvedIssues;

    private Long closedIssues;

    private Long totalSprints;

    private Long plannedSprints;

    private Long activeSprints;

    private Long completedSprints;

    private Long cancelledSprints;

    private Long totalActivities;
}
