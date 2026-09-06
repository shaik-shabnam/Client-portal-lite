package com.clientportal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskRequest {
    @NotBlank
    private String title;
    private String description;
    private String status;
    private String priority;
    @NotNull
    private Long milestoneId;
    private Long assigneeId;
    private LocalDate dueDate;
}
