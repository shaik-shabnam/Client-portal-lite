package com.clientportal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProjectRequest {
    @NotBlank
    private String title;
    private String description;
    private String status;
    private Integer progressPercent;
    @NotNull
    private Long clientId;
    private LocalDate startDate;
    private LocalDate dueDate;
    private String pinnedResources; // JSON string
}
