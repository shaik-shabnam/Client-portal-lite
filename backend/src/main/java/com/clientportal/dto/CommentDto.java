package com.clientportal.dto;

import com.clientportal.entity.Comment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentDto {
    private Long id;
    private Long taskId;
    private Long deliverableId;
    private UserDto user;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CommentDto from(Comment c) {
        return CommentDto.builder()
                .id(c.getId())
                .taskId(c.getTask() != null ? c.getTask().getId() : null)
                .deliverableId(c.getDeliverable() != null ? c.getDeliverable().getId() : null)
                .user(c.getUser() != null ? UserDto.from(c.getUser()) : null)
                .message(c.getMessage())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
