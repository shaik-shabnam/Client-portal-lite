package com.clientportal.service;

import com.clientportal.dto.ActivityLogDto;
import com.clientportal.entity.ActivityLog;
import com.clientportal.entity.Project;
import com.clientportal.entity.User;
import com.clientportal.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Transactional
    public ActivityLog log(Project project, User user, String actionDescription,
                           String actionType, String entityType, Long entityId) {
        ActivityLog entry = ActivityLog.builder()
                .project(project)
                .user(user)
                .actionDescription(actionDescription)
                .actionType(actionType)
                .entityType(entityType)
                .entityId(entityId)
                .build();
        return activityLogRepository.save(entry);
    }

    @Transactional(readOnly = true)
    public List<ActivityLogDto> getByProject(Long projectId) {
        return activityLogRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(ActivityLogDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityLogDto> getByProjectPaged(Long projectId, int limit) {
        return activityLogRepository.findByProjectIdOrderByCreatedAtDesc(
                        projectId, PageRequest.of(0, limit))
                .stream()
                .map(ActivityLogDto::from)
                .collect(Collectors.toList());
    }
}
