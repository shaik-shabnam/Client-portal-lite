package com.clientportal.controller;

import com.clientportal.dto.*;
import com.clientportal.entity.User;
import com.clientportal.service.ActivityLogService;
import com.clientportal.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final ActivityLogService activityLogService;

    // ── Projects ────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getAll(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getAllForUser(currentUser)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectDto>> getOne(@PathVariable Long id,
                                                           @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getById(id, currentUser)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectDto>> create(@Valid @RequestBody ProjectRequest request,
                                                           @AuthenticationPrincipal User currentUser) {
        ProjectDto project = projectService.create(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Project created", project));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectDto>> update(@PathVariable Long id,
                                                           @Valid @RequestBody ProjectRequest request,
                                                           @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success("Project updated",
                projectService.update(id, request, currentUser)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id,
                                                     @AuthenticationPrincipal User currentUser) {
        projectService.delete(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Project deleted", null));
    }

    // ── Activity Timeline ────────────────────────────────────────────────────

    @GetMapping("/{id}/activity")
    public ResponseEntity<ApiResponse<List<ActivityLogDto>>> getActivity(
            @PathVariable Long id,
            @RequestParam(defaultValue = "50") int limit,
            @AuthenticationPrincipal User currentUser) {
        List<ActivityLogDto> logs = limit > 0
                ? activityLogService.getByProjectPaged(id, limit)
                : activityLogService.getByProject(id);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    // ── Milestones ───────────────────────────────────────────────────────────

    @GetMapping("/{id}/milestones")
    public ResponseEntity<ApiResponse<List<MilestoneDto>>> getMilestones(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getMilestones(id, currentUser)));
    }

    @PostMapping("/{id}/milestones")
    public ResponseEntity<ApiResponse<MilestoneDto>> createMilestone(
            @PathVariable Long id,
            @RequestBody MilestoneRequest request,
            @AuthenticationPrincipal User currentUser) {
        MilestoneDto milestone = projectService.createMilestone(
                id, request.getTitle(), request.getTargetDate(), currentUser);
        return ResponseEntity.ok(ApiResponse.success("Milestone created", milestone));
    }

    @PatchMapping("/milestones/{milestoneId}/toggle")
    public ResponseEntity<ApiResponse<MilestoneDto>> toggleMilestone(
            @PathVariable Long milestoneId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(projectService.toggleMilestone(milestoneId, currentUser)));
    }

    @DeleteMapping("/milestones/{milestoneId}")
    public ResponseEntity<ApiResponse<Void>> deleteMilestone(
            @PathVariable Long milestoneId,
            @AuthenticationPrincipal User currentUser) {
        projectService.deleteMilestone(milestoneId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Milestone deleted", null));
    }

    // ── Inner request DTO ───────────────────────────────────────────────────

    @lombok.Data
    static class MilestoneRequest {
        private String title;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        private LocalDate targetDate;
    }
}
