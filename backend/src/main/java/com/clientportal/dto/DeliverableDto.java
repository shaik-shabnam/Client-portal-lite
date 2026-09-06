package com.clientportal.dto;

import com.clientportal.entity.Deliverable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliverableDto {
    private Long id;
    private Long projectId;
    private String title;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String category;
    private String versionTag;
    private String status;
    private UserDto uploadedBy;
    private String feedback;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DeliverableDto from(Deliverable d) {
        return DeliverableDto.builder()
                .id(d.getId())
                .projectId(d.getProject() != null ? d.getProject().getId() : null)
                .title(d.getTitle())
                .fileUrl(d.getFileUrl())
                .fileName(d.getFileName())
                .fileType(d.getFileType())
                .fileSize(d.getFileSize())
                .category(d.getCategory().name())
                .versionTag(d.getVersionTag())
                .status(d.getStatus().name())
                .uploadedBy(d.getUploadedBy() != null ? UserDto.from(d.getUploadedBy()) : null)
                .feedback(d.getFeedback())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}
