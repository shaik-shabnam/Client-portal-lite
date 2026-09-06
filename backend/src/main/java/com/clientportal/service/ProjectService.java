package com.clientportal.service;

import com.clientportal.dto.MilestoneDto;
import com.clientportal.dto.ProjectDto;
import com.clientportal.dto.ProjectRequest;
import com.clientportal.entity.Milestone;
import com.clientportal.entity.Project;
import com.clientportal.entity.User;
import com.clientportal.exception.ResourceNotFoundException;
import com.clientportal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final MilestoneRepository milestoneRepository;
    private final TaskRepository taskRepository;
    private final DeliverableRepository deliverableRepository;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<ProjectDto> getAllForUser(User currentUser) {
        List<Project> projects;
        if (currentUser.getRole() == User.Role.ADMIN) {
            projects = projectRepository.findByAdminOrderByCreatedAtDesc(currentUser);
        } else {
            projects = projectRepository.findByClientOrderByCreatedAtDesc(currentUser);
        }
        return projects.stream().map(p -> enrichProjectDto(ProjectDto.from(p), p))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDto getById(Long id, User currentUser) {
        Project project = findProjectOrThrow(id);
        assertAccess(project, currentUser);
        return enrichProjectDto(ProjectDto.from(project), project);
    }

    @Transactional
    public ProjectDto create(ProjectRequest request, User admin) {
        User client = userRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client user", request.getClientId()));

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(parseStatus(request.getStatus(), Project.Status.PLANNING))
                .progressPercent(request.getProgressPercent() != null ? request.getProgressPercent() : 0)
                .admin(admin)
                .client(client)
                .startDate(request.getStartDate())
                .dueDate(request.getDueDate())
                .pinnedResources(request.getPinnedResources())
                .build();

        project = projectRepository.save(project);

        activityLogService.log(project, admin,
                admin.getFullName() + " created project \"" + project.getTitle() + "\"",
                "PROJECT_CREATED", "PROJECT", project.getId());

        notificationService.send(client, project,
                "New Project Assigned",
                "You have been added to project: " + project.getTitle());

        return ProjectDto.from(project);
    }

    @Transactional
    public ProjectDto update(Long id, ProjectRequest request, User currentUser) {
        Project project = findProjectOrThrow(id);
        assertAdminOwner(project, currentUser);

        String oldStatus = project.getStatus().name();

        project.setTitle(request.getTitle());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getStatus() != null) project.setStatus(parseStatus(request.getStatus(), project.getStatus()));
        if (request.getProgressPercent() != null) project.setProgressPercent(request.getProgressPercent());
        if (request.getStartDate() != null) project.setStartDate(request.getStartDate());
        if (request.getDueDate() != null) project.setDueDate(request.getDueDate());
        if (request.getPinnedResources() != null) project.setPinnedResources(request.getPinnedResources());

        project = projectRepository.save(project);

        String newStatus = project.getStatus().name();
        String logMsg = currentUser.getFullName() + " updated project \"" + project.getTitle() + "\"";
        if (!oldStatus.equals(newStatus)) {
            logMsg = currentUser.getFullName() + " changed project status to " + newStatus;
        }

        activityLogService.log(project, currentUser, logMsg,
                "PROJECT_UPDATED", "PROJECT", project.getId());

        notificationService.send(project.getClient(), project,
                "Project Updated",
                "Project \"" + project.getTitle() + "\" has been updated by " + currentUser.getFullName());

        return enrichProjectDto(ProjectDto.from(project), project);
    }

    @Transactional
    public void delete(Long id, User currentUser) {
        Project project = findProjectOrThrow(id);
        assertAdminOwner(project, currentUser);
        projectRepository.delete(project);
    }

    // ── Milestones ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<MilestoneDto> getMilestones(Long projectId, User currentUser) {
        Project project = findProjectOrThrow(projectId);
        assertAccess(project, currentUser);
        return milestoneRepository.findByProjectIdOrderByTargetDateAsc(projectId)
                .stream()
                .map(MilestoneDto::fromWithTasks)
                .collect(Collectors.toList());
    }

    @Transactional
    public MilestoneDto createMilestone(Long projectId, String title,
                                        java.time.LocalDate targetDate, User currentUser) {
        Project project = findProjectOrThrow(projectId);
        assertAdminOwner(project, currentUser);

        Milestone milestone = Milestone.builder()
                .project(project)
                .title(title)
                .targetDate(targetDate)
                .isCompleted(false)
                .build();
        milestone = milestoneRepository.save(milestone);

        activityLogService.log(project, currentUser,
                currentUser.getFullName() + " added milestone \"" + title + "\"",
                "MILESTONE_CREATED", "MILESTONE", milestone.getId());

        return MilestoneDto.from(milestone);
    }

    @Transactional
    public MilestoneDto toggleMilestone(Long milestoneId, User currentUser) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", milestoneId));
        assertAdminOwner(milestone.getProject(), currentUser);

        milestone.setIsCompleted(!milestone.getIsCompleted());
        milestone = milestoneRepository.save(milestone);

        String action = milestone.getIsCompleted() ? "completed" : "reopened";
        activityLogService.log(milestone.getProject(), currentUser,
                currentUser.getFullName() + " " + action + " milestone \"" + milestone.getTitle() + "\"",
                "MILESTONE_UPDATED", "MILESTONE", milestone.getId());

        return MilestoneDto.from(milestone);
    }

    @Transactional
    public void deleteMilestone(Long milestoneId, User currentUser) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", milestoneId));
        assertAdminOwner(milestone.getProject(), currentUser);
        milestoneRepository.delete(milestone);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private Project findProjectOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
    }

    private void assertAccess(Project project, User user) {
        if (user.getRole() == User.Role.ADMIN) {
            if (!project.getAdmin().getId().equals(user.getId())) {
                throw new IllegalArgumentException("Access denied to this project");
            }
        } else {
            if (!project.getClient().getId().equals(user.getId())) {
                throw new IllegalArgumentException("Access denied to this project");
            }
        }
    }

    private void assertAdminOwner(Project project, User user) {
        if (user.getRole() != User.Role.ADMIN || !project.getAdmin().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Only the project admin can perform this action");
        }
    }

    private Project.Status parseStatus(String value, Project.Status fallback) {
        if (value == null) return fallback;
        try {
            return Project.Status.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return fallback;
        }
    }

    private ProjectDto enrichProjectDto(ProjectDto dto, Project project) {
        Long projectId = project.getId();
        dto.setTotalTasks(taskRepository.countByProjectId(projectId));
        dto.setCompletedTasks(taskRepository.countDoneByProjectId(projectId));
        dto.setTotalMilestones(milestoneRepository.countByProjectIdAndIsCompleted(projectId, false)
                + milestoneRepository.countByProjectIdAndIsCompleted(projectId, true));
        dto.setCompletedMilestones(milestoneRepository.countByProjectIdAndIsCompleted(projectId, true));
        dto.setPendingDeliverables(deliverableRepository.countByProjectIdAndStatus(
                projectId, com.clientportal.entity.Deliverable.DeliverableStatus.PENDING));
        dto.setApprovedDeliverables(deliverableRepository.countByProjectIdAndStatus(
                projectId, com.clientportal.entity.Deliverable.DeliverableStatus.APPROVED));
        return dto;
    }
}
