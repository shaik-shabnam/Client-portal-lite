package com.clientportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientOverviewDto {
    private UserDto client;
    private List<ProjectDto> projects;
    private long totalProjects;
    private long completedProjects;
    private long inProgressProjects;
    private long pendingDeliverables;
}
