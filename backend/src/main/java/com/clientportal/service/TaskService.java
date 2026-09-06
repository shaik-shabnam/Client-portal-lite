package com.clientportal.service;

import com.clientportal.dto.TaskDto;
import com.clientportal.dto.TaskRequest;
import com.clientportal.entity.Milestone;
import com.clientportal.entity.Project;
import com.clientportal.entity.Task;
import com.clientportal.entity.User;
import com.clientportal.exception.ResourceNotFoundException;
import com.clientportal.repository.MilestoneRepository;
import com.clientportal.repository.ProjectRepository;
import com.clientportal.repository.TaskRepository;
import com.clientportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<TaskDto> getByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId)
                .stream().map(TaskDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getByMilestone(Long milestoneId) {
        return taskRepository.findByMilestoneIdOrderByCreatedAtAsc(milestoneId)
                .stream().map(TaskDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskDto getById(Long id) {
        return TaskDto.from(findOrThrow(id));
    }

    @Transactional
    public TaskDto create(TaskRequest request, User currentUser) {
        Milestone milestone = milestoneRepository.findById(request.getMilestoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", request.getMilestoneId()));

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getAssigneeId()));
        }

        Task task = Task.builder()
                .milestone(milestone)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(parseStatus(request.getStatus(), Task.Status.TO_DO))
                .priority(parsePriority(request.getPriority(), Task.Priority.MEDIUM))
                .assignee(assignee)
                .dueDate(request.getDueDate())
                .build();

        task = taskRepository.save(task);
        Project project = milestone.getProject();

        activityLogService.log(project, currentUser,
                currentUser.getFullName() + " created task \"" + task.getTitle() + "\"",
                "TASK_CREATED", "TASK", task.getId());

        return TaskDto.from(task);
    }

    @Transactional
    public TaskDto update(Long id, TaskRequest request, User currentUser) {
        Task task = findOrThrow(id);
        String oldStatus = task.getStatus().name();

        task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(parseStatus(request.getStatus(), task.getStatus()));
        if (request.getPriority() != null) task.setPriority(parsePriority(request.getPriority(), task.getPriority()));
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getAssigneeId()));
            task.setAssignee(assignee);
        }

        task = taskRepository.save(task);
        Project project = task.getMilestone().getProject();
        String newStatus = task.getStatus().name();

        String logMsg = currentUser.getFullName() + " updated task \"" + task.getTitle() + "\"";
        if (!oldStatus.equals(newStatus)) {
            logMsg = currentUser.getFullName() + " moved task \"" + task.getTitle() + "\" to " + newStatus;
            // Notify client when task changes
            notificationService.send(project.getClient(), project,
                    "Task Status Updated",
                    "Task \"" + task.getTitle() + "\" moved to " + newStatus);
        }

        activityLogService.log(project, currentUser, logMsg, "TASK_UPDATED", "TASK", task.getId());

        return TaskDto.from(task);
    }

    @Transactional
    public TaskDto updateStatus(Long id, String status, User currentUser) {
        Task task = findOrThrow(id);
        Task.Status newStatus = parseStatus(status, task.getStatus());
        String oldStatus = task.getStatus().name();
        task.setStatus(newStatus);
        task = taskRepository.save(task);

        Project project = task.getMilestone().getProject();
        String logMsg = currentUser.getFullName() + " moved \"" + task.getTitle()
                + "\" from " + oldStatus + " to " + newStatus.name();

        activityLogService.log(project, currentUser, logMsg, "TASK_STATUS_CHANGED", "TASK", task.getId());

        notificationService.send(project.getClient(), project,
                "Task Updated",
                "\"" + task.getTitle() + "\" is now " + newStatus.name().replace("_", " "));

        return TaskDto.from(task);
    }

    @Transactional
    public void delete(Long id, User currentUser) {
        Task task = findOrThrow(id);
        Project project = task.getMilestone().getProject();
        activityLogService.log(project, currentUser,
                currentUser.getFullName() + " deleted task \"" + task.getTitle() + "\"",
                "TASK_DELETED", "TASK", id);
        taskRepository.delete(task);
    }

    private Task findOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
    }

    private Task.Status parseStatus(String value, Task.Status fallback) {
        if (value == null) return fallback;
        try { return Task.Status.valueOf(value.toUpperCase()); }
        catch (IllegalArgumentException e) { return fallback; }
    }

    private Task.Priority parsePriority(String value, Task.Priority fallback) {
        if (value == null) return fallback;
        try { return Task.Priority.valueOf(value.toUpperCase()); }
        catch (IllegalArgumentException e) { return fallback; }
    }
}
