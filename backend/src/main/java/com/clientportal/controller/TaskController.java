package com.clientportal.controller;

import com.clientportal.dto.ApiResponse;
import com.clientportal.dto.TaskDto;
import com.clientportal.dto.TaskRequest;
import com.clientportal.entity.User;
import com.clientportal.service.TaskService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getByProject(projectId)));
    }

    @GetMapping("/milestone/{milestoneId}")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getByMilestone(@PathVariable Long milestoneId) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getByMilestone(milestoneId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskDto>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskDto>> create(@Valid @RequestBody TaskRequest request,
                                                        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success("Task created", taskService.create(request, currentUser)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskDto>> update(@PathVariable Long id,
                                                        @RequestBody TaskRequest request,
                                                        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success("Task updated", taskService.update(id, request, currentUser)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskDto>> updateStatus(@PathVariable Long id,
                                                              @RequestBody StatusRequest request,
                                                              @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(taskService.updateStatus(id, request.getStatus(), currentUser)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id,
                                                     @AuthenticationPrincipal User currentUser) {
        taskService.delete(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Task deleted", null));
    }

    @Data
    static class StatusRequest {
        private String status;
    }
}
