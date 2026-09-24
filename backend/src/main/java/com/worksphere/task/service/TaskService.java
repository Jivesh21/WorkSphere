
package com.worksphere.task.service;

import com.worksphere.activity.entity.ActivityType;
import com.worksphere.activity.service.ActivityService;
import com.worksphere.notification.entity.NotificationType;
import com.worksphere.notification.service.NotificationService;
import com.worksphere.task.dto.TaskRequest;
import com.worksphere.task.dto.TaskResponse;
import com.worksphere.task.entity.Task;
import com.worksphere.task.entity.TaskStatus;
import com.worksphere.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ActivityService activityService;
    private final NotificationService notificationService;

    // =========================================================
    // CREATE TASK
    // =========================================================

    public TaskResponse createTask(TaskRequest request) {

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .priority(request.getPriority())
                .dueDate(request.getDueDate().atStartOfDay())
                .projectId(request.getProjectId())
                .assignedUserId(request.getAssignedUserId())
                .build();

        Task savedTask = taskRepository.save(task);

        // Activity: Task Created
        activityService.createTaskActivity(
                request.getActorUserId(),
                "Task created: " + savedTask.getTitle(),
                savedTask.getProjectId(),
                savedTask.getId(),
                ActivityType.TASK_CREATED
        );

        // Notification: Task Assigned
        if (savedTask.getAssignedUserId() != null) {

            notificationService.createTaskNotification(
                    savedTask.getAssignedUserId(),
                    savedTask.getId(),
                    savedTask.getProjectId(),
                    "New Task Assigned",
                    "You have been assigned task: "
                            + savedTask.getTitle(),
                    NotificationType.TASK_ASSIGNED
            );
        }

        return mapToResponse(savedTask);
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    public TaskResponse getTaskById(Long id) {

        Task task = taskRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Task not found"));

        return mapToResponse(task);
    }

    // =========================================================
    // GET ALL
    // =========================================================

    public List<TaskResponse> getAllTasks() {

        return taskRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET BY PROJECT
    // =========================================================

    public List<TaskResponse> getTasksByProject(Long projectId) {

        return taskRepository.findByProjectId(projectId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // UPDATE
    // =========================================================

    public TaskResponse updateTask(
            Long id,
            TaskRequest request) {

        Task task = taskRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Task not found"));

        // Store old values
        TaskStatus oldStatus = task.getStatus();
        Long oldAssignedUserId = task.getAssignedUserId();

        // Update fields
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate().atStartOfDay());
        task.setProjectId(request.getProjectId());
        task.setAssignedUserId(request.getAssignedUserId());

        Task updatedTask = taskRepository.save(task);

        // =====================================================
        // STATUS CHANGED
        // =====================================================

        if (oldStatus != updatedTask.getStatus()) {

            activityService.createTaskActivity(
                    request.getActorUserId(),
                    "Task status changed: "
                            + updatedTask.getTitle(),
                    updatedTask.getProjectId(),
                    updatedTask.getId(),
                    ActivityType.TASK_STATUS_CHANGED
            );

            // Notification for status change
            if (updatedTask.getAssignedUserId() != null) {

                notificationService.createTaskNotification(
                        updatedTask.getAssignedUserId(),
                        updatedTask.getId(),
                        updatedTask.getProjectId(),
                        "Task Status Updated",
                        "Task '" + updatedTask.getTitle()
                                + "' status changed to "
                                + updatedTask.getStatus(),
                        NotificationType.TASK_STATUS_CHANGED
                );
            }

        } else {

            // =================================================
            // GENERAL UPDATE
            // =================================================

            activityService.createTaskActivity(
                    request.getActorUserId(),
                    "Task updated: "
                            + updatedTask.getTitle(),
                    updatedTask.getProjectId(),
                    updatedTask.getId(),
                    ActivityType.TASK_UPDATED
            );
        }

        // =====================================================
        // NEW ASSIGNMENT
        // =====================================================

        if (updatedTask.getAssignedUserId() != null
                && !updatedTask.getAssignedUserId()
                .equals(oldAssignedUserId)) {

            notificationService.createTaskNotification(
                    updatedTask.getAssignedUserId(),
                    updatedTask.getId(),
                    updatedTask.getProjectId(),
                    "Task Assigned",
                    "You have been assigned task: "
                            + updatedTask.getTitle(),
                    NotificationType.TASK_ASSIGNED
            );
        }

        return mapToResponse(updatedTask);
    }

    // =========================================================
    // DELETE
    // =========================================================

    public void deleteTask(Long id) {

        Task task = taskRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Task not found"));

        taskRepository.delete(task);
    }

    // =========================================================
    // ENTITY → RESPONSE
    // =========================================================

    private TaskResponse mapToResponse(Task task) {

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .projectId(task.getProjectId())
                .assignedUserId(task.getAssignedUserId())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}


