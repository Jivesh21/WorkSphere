package com.worksphere.issue.dto;

import com.worksphere.issue.entity.IssuePriority;
import com.worksphere.issue.entity.IssueStatus;
import com.worksphere.issue.entity.IssueType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IssueRequest {

    private String title;

    private String description;

    private IssueType type;

    private IssueStatus status;

    private IssuePriority priority;

    private Long projectId;

    private Long assignedUserId;

    private Long actorUserId;
}
