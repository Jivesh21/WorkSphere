package com.worksphere.analytics.service;

import com.worksphere.activity.entity.Activity;
import com.worksphere.activity.repository.ActivityRepository;
import com.worksphere.analytics.dto.AnalyticsResponse;
import com.worksphere.issue.entity.Issue;
import com.worksphere.issue.entity.IssueStatus;
import com.worksphere.issue.repository.IssueRepository;
import com.worksphere.sprints.entity.Sprint;
import com.worksphere.sprints.entity.SprintStatus;
import com.worksphere.sprints.repository.SprintRepository;
import com.worksphere.task.entity.Task;
import com.worksphere.task.entity.TaskStatus;
import com.worksphere.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TaskRepository taskRepository;
    private final IssueRepository issueRepository;
    private final SprintRepository sprintRepository;
    private final ActivityRepository activityRepository;

    public AnalyticsResponse getOverallAnalytics() {

        List<Task> tasks = taskRepository.findAll();
        List<Issue> issues = issueRepository.findAll();
        List<Sprint> sprints = sprintRepository.findAll();
        List<Activity> activities = activityRepository.findAll();

        long todoTasks = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.TODO)
                .count();

        long inProgressTasks = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.IN_PROGRESS)
                .count();

        long inReviewTasks = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.IN_REVIEW)
                .count();

        long completedTasks = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.DONE)
                .count();

        long openIssues = issues.stream()
                .filter(issue -> issue.getStatus() == IssueStatus.OPEN)
                .count();

        long inProgressIssues = issues.stream()
                .filter(issue -> issue.getStatus() == IssueStatus.IN_PROGRESS)
                .count();

        long resolvedIssues = issues.stream()
                .filter(issue -> issue.getStatus() == IssueStatus.RESOLVED)
                .count();

        long closedIssues = issues.stream()
                .filter(issue -> issue.getStatus() == IssueStatus.CLOSED)
                .count();

        long plannedSprints = sprints.stream()
                .filter(sprint -> sprint.getStatus() == SprintStatus.PLANNED)
                .count();

        long activeSprints = sprints.stream()
                .filter(sprint -> sprint.getStatus() == SprintStatus.ACTIVE)
                .count();

        long completedSprints = sprints.stream()
                .filter(sprint -> sprint.getStatus() == SprintStatus.COMPLETED)
                .count();

        long cancelledSprints = sprints.stream()
                .filter(sprint -> sprint.getStatus() == SprintStatus.CANCELLED)
                .count();

        return AnalyticsResponse.builder()
                .totalTasks((long) tasks.size())
                .todoTasks(todoTasks)
                .inProgressTasks(inProgressTasks)
                .inReviewTasks(inReviewTasks)
                .completedTasks(completedTasks)

                .totalIssues((long) issues.size())
                .openIssues(openIssues)
                .inProgressIssues(inProgressIssues)
                .resolvedIssues(resolvedIssues)
                .closedIssues(closedIssues)

                .totalSprints((long) sprints.size())
                .plannedSprints(plannedSprints)
                .activeSprints(activeSprints)
                .completedSprints(completedSprints)
                .cancelledSprints(cancelledSprints)

                .totalActivities((long) activities.size())

                .build();
    }
}
