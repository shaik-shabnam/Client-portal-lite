package com.clientportal.controller;

import com.clientportal.dto.ApiResponse;
import com.clientportal.dto.ClientOverviewDto;
import com.clientportal.dto.ProjectDto;
import com.clientportal.dto.UserDto;
import com.clientportal.entity.Deliverable;
import com.clientportal.entity.Project;
import com.clientportal.entity.User;
import com.clientportal.repository.DeliverableRepository;
import com.clientportal.repository.MilestoneRepository;
import com.clientportal.repository.ProjectRepository;
import com.clientportal.repository.TaskRepository;
import com.clientportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final MilestoneRepository milestoneRepository;
    private final DeliverableRepository deliverableRepository;

    private ProjectDto enrichProject(Project p) {
        ProjectDto dto = ProjectDto.from(p);
        Long pid = p.getId();
        dto.setTotalTasks(taskRepository.countByProjectId(pid));
        dto.setCompletedTasks(taskRepository.countDoneByProjectId(pid));
        long mDone = milestoneRepository.countByProjectIdAndIsCompleted(pid, true);
        long mTodo = milestoneRepository.countByProjectIdAndIsCompleted(pid, false);
        dto.setTotalMilestones(mDone + mTodo);
        dto.setCompletedMilestones(mDone);
        dto.setPendingDeliverables(deliverableRepository.countByProjectIdAndStatus(pid, Deliverable.DeliverableStatus.PENDING));
        dto.setApprovedDeliverables(deliverableRepository.countByProjectIdAndStatus(pid, Deliverable.DeliverableStatus.APPROVED));
        return dto;
    }

    /**
     * Returns every client with all their projects and summary stats.
     */
    @GetMapping("/clients-overview")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<ClientOverviewDto>>> getClientsOverview() {
        List<User> clients = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.CLIENT)
                .collect(Collectors.toList());

        List<ClientOverviewDto> overview = clients.stream().map(client -> {
            List<Project> projects = projectRepository.findByClientOrderByCreatedAtDesc(client);
            List<ProjectDto> projectDtos = projects.stream()
                    .map(this::enrichProject)
                    .collect(Collectors.toList());

            long pendingTotal = projectDtos.stream()
                    .mapToLong(d -> d.getPendingDeliverables() != null ? d.getPendingDeliverables() : 0)
                    .sum();

            return ClientOverviewDto.builder()
                    .client(UserDto.from(client))
                    .projects(projectDtos)
                    .totalProjects(projectDtos.size())
                    .completedProjects(projectDtos.stream()
                            .filter(p -> "COMPLETED".equals(p.getStatus())).count())
                    .inProgressProjects(projectDtos.stream()
                            .filter(p -> "IN_PROGRESS".equals(p.getStatus())).count())
                    .pendingDeliverables(pendingTotal)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(overview));
    }

    /**
     * Returns all projects across all clients — full admin view.
     */
    @GetMapping("/all-projects")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getAllProjects() {
        List<ProjectDto> projects = projectRepository.findAllWithUsers()
                .stream()
                .map(this::enrichProject)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(projects));
    }
}
