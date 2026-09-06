package com.clientportal.service;

import com.clientportal.dto.CommentDto;
import com.clientportal.entity.Comment;
import com.clientportal.entity.Deliverable;
import com.clientportal.entity.Project;
import com.clientportal.entity.Task;
import com.clientportal.entity.User;
import com.clientportal.exception.ResourceNotFoundException;
import com.clientportal.repository.CommentRepository;
import com.clientportal.repository.DeliverableRepository;
import com.clientportal.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final DeliverableRepository deliverableRepository;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<CommentDto> getForTask(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream().map(CommentDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CommentDto> getForDeliverable(Long deliverableId) {
        return commentRepository.findByDeliverableIdOrderByCreatedAtAsc(deliverableId)
                .stream().map(CommentDto::from).collect(Collectors.toList());
    }

    @Transactional
    public CommentDto addToTask(Long taskId, String message, User author) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        Comment comment = Comment.builder()
                .task(task)
                .user(author)
                .message(message)
                .build();
        comment = commentRepository.save(comment);

        Project project = task.getMilestone().getProject();

        activityLogService.log(project, author,
                author.getFullName() + " commented on task \"" + task.getTitle() + "\"",
                "COMMENT_ADDED", "TASK", taskId);

        // Notify the other party
        User target = author.getRole() == User.Role.ADMIN ? project.getClient() : project.getAdmin();
        notificationService.send(target, project,
                "New Comment",
                author.getFullName() + " commented on \"" + task.getTitle() + "\"");

        return CommentDto.from(comment);
    }

    @Transactional
    public CommentDto addToDeliverable(Long deliverableId, String message, User author) {
        Deliverable deliverable = deliverableRepository.findById(deliverableId)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable", deliverableId));

        Comment comment = Comment.builder()
                .deliverable(deliverable)
                .user(author)
                .message(message)
                .build();
        comment = commentRepository.save(comment);

        Project project = deliverable.getProject();

        activityLogService.log(project, author,
                author.getFullName() + " commented on \"" + deliverable.getTitle() + "\"",
                "COMMENT_ADDED", "DELIVERABLE", deliverableId);

        User target = author.getRole() == User.Role.ADMIN ? project.getClient() : project.getAdmin();
        notificationService.send(target, project,
                "New Comment",
                author.getFullName() + " commented on \"" + deliverable.getTitle() + "\"");

        return CommentDto.from(comment);
    }

    @Transactional
    public void delete(Long commentId, User currentUser) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));

        if (!comment.getUser().getId().equals(currentUser.getId())
                && currentUser.getRole() != User.Role.ADMIN) {
            throw new IllegalArgumentException("Cannot delete another user's comment");
        }
        commentRepository.delete(comment);
    }
}
