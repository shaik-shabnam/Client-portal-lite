package com.clientportal.controller;

import com.clientportal.dto.ApiResponse;
import com.clientportal.dto.CommentDto;
import com.clientportal.entity.User;
import com.clientportal.service.CommentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/task/{taskId}")
    public ResponseEntity<ApiResponse<List<CommentDto>>> getForTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(ApiResponse.success(commentService.getForTask(taskId)));
    }

    @GetMapping("/deliverable/{deliverableId}")
    public ResponseEntity<ApiResponse<List<CommentDto>>> getForDeliverable(@PathVariable Long deliverableId) {
        return ResponseEntity.ok(ApiResponse.success(commentService.getForDeliverable(deliverableId)));
    }

    @PostMapping("/task/{taskId}")
    public ResponseEntity<ApiResponse<CommentDto>> addToTask(@PathVariable Long taskId,
                                                              @RequestBody MessageRequest request,
                                                              @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success("Comment added",
                commentService.addToTask(taskId, request.getMessage(), currentUser)));
    }

    @PostMapping("/deliverable/{deliverableId}")
    public ResponseEntity<ApiResponse<CommentDto>> addToDeliverable(@PathVariable Long deliverableId,
                                                                      @RequestBody MessageRequest request,
                                                                      @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success("Comment added",
                commentService.addToDeliverable(deliverableId, request.getMessage(), currentUser)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id,
                                                     @AuthenticationPrincipal User currentUser) {
        commentService.delete(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted", null));
    }

    @Data
    static class MessageRequest {
        private String message;
    }
}
