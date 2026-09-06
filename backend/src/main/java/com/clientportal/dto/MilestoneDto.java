package com.clientportal.dto;

import com.clientportal.entity.Milestone;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneDto {
    private Long id;
    private Long projectId;
    private String title;
    private LocalDate targetDate;
    private Boolean isCompleted;
    private LocalDateTime createdAt;
    private List<TaskDto> tasks;

    public static MilestoneDto from(Milestone m) {
        return MilestoneDto.builder()
                .id(m.getId())
                .projectId(m.getProject() != null ? m.getProject().getId() : null)
                .title(m.getTitle())
                .targetDate(m.getTargetDate())
                .isCompleted(m.getIsCompleted())
                .createdAt(m.getCreatedAt())
                .build();
    }

    public static MilestoneDto fromWithTasks(Milestone m) {
        MilestoneDto dto = from(m);
        if (m.getTasks() != null) {
            dto.setTasks(m.getTasks().stream().map(TaskDto::from).collect(Collectors.toList()));
        }
        return dto;
    }
}
