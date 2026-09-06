package com.clientportal.dto;

import com.clientportal.entity.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Long id;
    private Long milestoneId;
    private String milestoneTitle;
    private Long projectId;
    private String title;
    private String description;
    private String status;
    private String priority;
    private UserDto assignee;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TaskDto from(Task t) {
        return TaskDto.builder()
                .id(t.getId())
                .milestoneId(t.getMilestone() != null ? t.getMilestone().getId() : null)
                .milestoneTitle(t.getMilestone() != null ? t.getMilestone().getTitle() : null)
                .projectId(t.getMilestone() != null && t.getMilestone().getProject() != null
                        ? t.getMilestone().getProject().getId() : null)
                .title(t.getTitle())
                .description(t.getDescription())
                .status(t.getStatus().name())
                .priority(t.getPriority().name())
                .assignee(t.getAssignee() != null ? UserDto.from(t.getAssignee()) : null)
                .dueDate(t.getDueDate())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
