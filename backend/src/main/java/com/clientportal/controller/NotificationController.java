package com.clientportal.controller;

import com.clientportal.dto.ApiResponse;
import com.clientportal.dto.NotificationDto;
import com.clientportal.entity.User;
import com.clientportal.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getAll(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getForUser(currentUser.getId())));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(@AuthenticationPrincipal User currentUser) {
        long count = notificationService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    @PatchMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@AuthenticationPrincipal User currentUser) {
        notificationService.markAllRead(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable Long id,
                                                       @AuthenticationPrincipal User currentUser) {
        notificationService.markRead(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }
}
