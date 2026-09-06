package com.clientportal.service;

import com.clientportal.dto.NotificationDto;
import com.clientportal.entity.Notification;
import com.clientportal.entity.Project;
import com.clientportal.entity.User;
import com.clientportal.exception.ResourceNotFoundException;
import com.clientportal.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void send(User user, Project project, String title, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .project(project)
                .title(title)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    @Transactional
    public void markAllRead(Long userId) {
        List<Notification> unread = notificationRepository
                .findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void markRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Cannot mark another user's notification");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
}
