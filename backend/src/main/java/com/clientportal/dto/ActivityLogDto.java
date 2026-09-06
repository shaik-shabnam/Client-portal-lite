package com.clientportal.dto;

import com.clientportal.entity.ActivityLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogDto {
    private Long id;
    private Long projectId;
    private UserDto user;
    private String actionDescription;
    private String actionType;
    private String entityType;
    private Long entityId;
    private LocalDateTime createdAt;

    public static ActivityLogDto from(ActivityLog log) {
        return ActivityLogDto.builder()
                .id(log.getId())
                .projectId(log.getProject() != null ? log.getProject().getId() : null)
                .user(log.getUser() != null ? UserDto.from(log.getUser()) : null)
                .actionDescription(log.getActionDescription())
                .actionType(log.getActionType())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
