package com.worksphere.issue.dto;

import com.worksphere.issue.entity.IssuePriority;
import com.worksphere.issue.entity.IssueStatus;
import com.worksphere.issue.entity.IssueType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class IssueResponse {

    private Long id;

    private String title;

    private String description;

    private IssueType type;

    private IssueStatus status;

    private IssuePriority priority;

    private Long projectId;

    private Long assignedUserId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}