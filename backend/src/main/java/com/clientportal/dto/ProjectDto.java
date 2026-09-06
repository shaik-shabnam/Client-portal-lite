package com.clientportal.dto;

import com.clientportal.entity.Project;
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
public class ProjectDto {
    private Long id;
    private String title;
    private String description;
    private String status;
    private Integer progressPercent;
    private UserDto admin;
    private UserDto client;
    private LocalDate startDate;
    private LocalDate dueDate;
    private String pinnedResources;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Summary stats
    private Long totalTasks;
    private Long completedTasks;
    private Long totalMilestones;
    private Long completedMilestones;
    private Long pendingDeliverables;
    private Long approvedDeliverables;

    public static ProjectDto from(Project p) {
        return ProjectDto.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .status(p.getStatus().name())
                .progressPercent(p.getProgressPercent())
                .admin(p.getAdmin() != null ? UserDto.from(p.getAdmin()) : null)
                .client(p.getClient() != null ? UserDto.from(p.getClient()) : null)
                .startDate(p.getStartDate())
                .dueDate(p.getDueDate())
                .pinnedResources(p.getPinnedResources())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
