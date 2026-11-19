package com.worksphere.project.service;

import com.worksphere.activity.dto.ActivityRequest;
import com.worksphere.activity.entity.ActivityType;
import com.worksphere.activity.service.ActivityService;
import com.worksphere.common.exception.ConflictException;
import com.worksphere.common.exception.ResourceNotFoundException;
import com.worksphere.common.exception.UnauthorizedException;
import com.worksphere.project.dto.ProjectRequest;
import com.worksphere.project.dto.ProjectResponse;
import com.worksphere.project.entity.Project;
import com.worksphere.project.entity.ProjectHealth;
import com.worksphere.project.entity.ProjectStatus;
import com.worksphere.project.repository.ProjectRepository;
import com.worksphere.security.CurrentUserService;
import com.worksphere.task.entity.Task;
import com.worksphere.task.entity.TaskStatus;
import com.worksphere.task.repository.TaskRepository;
import com.worksphere.user.entity.User;
import com.worksphere.user.repository.UserRepository;
import com.worksphere.workspace.entity.Workspace;
import com.worksphere.workspace.entity.WorkspaceMember;
import com.worksphere.workspace.entity.WorkspaceRole;
import com.worksphere.workspace.repository.WorkspaceMemberRepository;
import com.worksphere.workspace.repository.WorkspaceRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ActivityService activityService;
    private final CurrentUserService currentUserService;

    public ProjectService(
            ProjectRepository projectRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            UserRepository userRepository,
            TaskRepository taskRepository,
            ActivityService activityService,
            CurrentUserService currentUserService
    ) {
        this.projectRepository = projectRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.activityService = activityService;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjects(Long workspaceId, Authentication authentication) {
        Long currentUserId = currentUserService.getCurrentUserId(authentication);

        List<Project> projects;
        if (workspaceId != null) {
            verifyWorkspaceMembership(workspaceId, currentUserId);
            projects = projectRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
        } else {
            List<WorkspaceMember> memberships = workspaceMemberRepository.findByUserId(currentUserId);
            List<Long> workspaceIds = memberships.stream()
                    .map(m -> m.getWorkspace().getId())
                    .toList();

            if (!workspaceIds.isEmpty()) {
                projects = projectRepository.findAccessibleProjects(currentUserId, workspaceIds);
            } else {
                projects = projectRepository.findByOwnerIdOrderByCreatedAtDesc(currentUserId);
            }
        }

        return projects.stream()
                .map(this::enrichProjectResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long projectId, Authentication authentication) {
        Long currentUserId = currentUserService.getCurrentUserId(authentication);
        Project project = findAndVerifyProjectAccess(projectId, currentUserId);
        return enrichProjectResponse(project);
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request, Authentication authentication) {
        Long currentUserId = currentUserService.getCurrentUserId(authentication);
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String normalizedCode = request.getCode().trim().toUpperCase();
        if (projectRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new ConflictException("Project with code '" + normalizedCode + "' already exists");
        }

        Workspace workspace = null;
        if (request.getWorkspaceId() != null) {
            workspace = verifyWorkspaceMembership(request.getWorkspaceId(), currentUserId);
        } else {
            // If no workspace specified, check if user has a workspace to link to
            List<WorkspaceMember> memberships = workspaceMemberRepository.findByUserId(currentUserId);
            if (!memberships.isEmpty()) {
                workspace = memberships.get(0).getWorkspace();
            }
        }

        Project project = Project.builder()
                .name(request.getName().trim())
                .code(normalizedCode)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .status(parseStatus(request.getStatus()))
                .icon(request.getIcon() != null && !request.getIcon().isBlank() ? request.getIcon().trim() : "folder")
                .accent(request.getAccent() != null && !request.getAccent().isBlank() ? request.getAccent().trim() : "violet")
                .dueDate(request.getDueDate())
                .health(parseHealth(request.getHealth()))
                .workspace(workspace)
                .owner(currentUser)
                .build();

        Project savedProject = projectRepository.save(project);

        // Record Activity
        try {
            activityService.createActivity(ActivityRequest.builder()
                    .actorUserId(currentUserId)
                    .type(ActivityType.PROJECT_CREATED)
                    .description("Project created: " + savedProject.getName() + " (" + savedProject.getCode() + ")")
                    .projectId(savedProject.getId())
                    .build());
        } catch (Exception ignored) {
            // Activity creation should not block project creation
        }

        return enrichProjectResponse(savedProject);
    }

    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectRequest request, Authentication authentication) {
        Long currentUserId = currentUserService.getCurrentUserId(authentication);
        Project project = findAndVerifyProjectManagement(projectId, currentUserId);

        String normalizedCode = request.getCode().trim().toUpperCase();
        if (projectRepository.existsByCodeIgnoreCaseAndIdNot(normalizedCode, projectId)) {
            throw new ConflictException("Project with code '" + normalizedCode + "' already exists");
        }

        project.setName(request.getName().trim());
        project.setCode(normalizedCode);
        project.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        project.setStatus(parseStatus(request.getStatus()));
        if (request.getIcon() != null && !request.getIcon().isBlank()) {
            project.setIcon(request.getIcon().trim());
        }
        if (request.getAccent() != null && !request.getAccent().isBlank()) {
            project.setAccent(request.getAccent().trim());
        }
        project.setDueDate(request.getDueDate());
        project.setHealth(parseHealth(request.getHealth()));

        if (request.getWorkspaceId() != null && (project.getWorkspace() == null || !project.getWorkspace().getId().equals(request.getWorkspaceId()))) {
            Workspace workspace = verifyWorkspaceMembership(request.getWorkspaceId(), currentUserId);
            project.setWorkspace(workspace);
        }

        Project updatedProject = projectRepository.save(project);

        // Record Activity
        try {
            activityService.createActivity(ActivityRequest.builder()
                    .actorUserId(currentUserId)
                    .type(ActivityType.PROJECT_UPDATED)
                    .description("Project updated: " + updatedProject.getName())
                    .projectId(updatedProject.getId())
                    .build());
        } catch (Exception ignored) {
        }

        return enrichProjectResponse(updatedProject);
    }

    @Transactional
    public void deleteProject(Long projectId, Authentication authentication) {
        Long currentUserId = currentUserService.getCurrentUserId(authentication);
        Project project = findAndVerifyProjectDeletion(projectId, currentUserId);

        projectRepository.delete(project);

        try {
            activityService.createActivity(ActivityRequest.builder()
                    .actorUserId(currentUserId)
                    .type(ActivityType.PROJECT_DELETED)
                    .description("Project deleted: " + project.getName() + " (" + project.getCode() + ")")
                    .projectId(projectId)
                    .build());
        } catch (Exception ignored) {
        }
    }

    private ProjectResponse enrichProjectResponse(Project project) {
        List<Task> tasks = taskRepository.findByProjectId(project.getId());
        int totalTasks = tasks.size();
        int completedTasks = (int) tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE)
                .count();

        return ProjectResponse.from(project, totalTasks, completedTasks);
    }

    private Project findAndVerifyProjectAccess(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getOwner().getId().equals(userId)) {
            return project;
        }

        if (project.getWorkspace() != null) {
            boolean isMember = workspaceMemberRepository.existsByWorkspaceIdAndUserId(project.getWorkspace().getId(), userId);
            boolean isWorkspaceOwner = project.getWorkspace().getOwner() != null && project.getWorkspace().getOwner().getId().equals(userId);
            if (isMember || isWorkspaceOwner) {
                return project;
            }
        }

        throw new UnauthorizedException("You do not have access to this project");
    }

    private Project findAndVerifyProjectManagement(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getOwner().getId().equals(userId)) {
            return project;
        }

        if (project.getWorkspace() != null) {
            Optional<WorkspaceMember> memberOpt = workspaceMemberRepository.findByWorkspaceIdAndUserId(project.getWorkspace().getId(), userId);
            if (memberOpt.isPresent()) {
                WorkspaceRole role = memberOpt.get().getRole();
                if (role == WorkspaceRole.OWNER || role == WorkspaceRole.ADMIN) {
                    return project;
                }
            }
        }

        throw new UnauthorizedException("You do not have permission to modify this project");
    }

    private Project findAndVerifyProjectDeletion(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getOwner().getId().equals(userId)) {
            return project;
        }

        if (project.getWorkspace() != null) {
            boolean isWorkspaceOwner = project.getWorkspace().getOwner() != null && project.getWorkspace().getOwner().getId().equals(userId);
            if (isWorkspaceOwner) {
                return project;
            }
        }

        throw new UnauthorizedException("Only the project owner or workspace owner can delete this project");
    }

    private Workspace verifyWorkspaceMembership(Long workspaceId, Long userId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        boolean isMember = workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId);
        boolean isOwner = workspace.getOwner() != null && workspace.getOwner().getId().equals(userId);

        if (!isMember && !isOwner) {
            throw new UnauthorizedException("You are not a member of this workspace");
        }

        return workspace;
    }

    private ProjectStatus parseStatus(String statusStr) {
        if (statusStr == null || statusStr.isBlank()) {
            return ProjectStatus.PLANNING;
        }
        String normalized = statusStr.trim().toUpperCase().replace(" ", "_");
        try {
            return ProjectStatus.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return ProjectStatus.PLANNING;
        }
    }

    private ProjectHealth parseHealth(String healthStr) {
        if (healthStr == null || healthStr.isBlank()) {
            return null;
        }
        String normalized = healthStr.trim().toUpperCase().replace(" ", "_");
        try {
            return ProjectHealth.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
