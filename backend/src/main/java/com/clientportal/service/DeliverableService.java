package com.clientportal.service;

import com.clientportal.dto.DeliverableDto;
import com.clientportal.entity.Deliverable;
import com.clientportal.entity.Project;
import com.clientportal.entity.User;
import com.clientportal.exception.ResourceNotFoundException;
import com.clientportal.repository.DeliverableRepository;
import com.clientportal.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliverableService {

    private final DeliverableRepository deliverableRepository;
    private final ProjectRepository projectRepository;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public List<DeliverableDto> getByProject(Long projectId) {
        return deliverableRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream().map(DeliverableDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DeliverableDto getById(Long id) {
        return DeliverableDto.from(findOrThrow(id));
    }

    @Transactional
    public DeliverableDto upload(Long projectId, String title, String category,
                                  String versionTag, MultipartFile file, User uploader) throws IOException {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        // Persist file to local uploads directory
        Path uploadPath = Paths.get(uploadDir, "project-" + projectId);
        Files.createDirectories(uploadPath);
        String uniqueFilename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        Deliverable.Category cat;
        try { cat = Deliverable.Category.valueOf(category.toUpperCase()); }
        catch (Exception e) { cat = Deliverable.Category.OTHER; }

        Deliverable deliverable = Deliverable.builder()
                .project(project)
                .title(title)
                .fileName(file.getOriginalFilename())
                .fileUrl("/uploads/project-" + projectId + "/" + uniqueFilename)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .category(cat)
                .versionTag(versionTag != null ? versionTag : "v1.0")
                .status(Deliverable.DeliverableStatus.PENDING)
                .uploadedBy(uploader)
                .build();

        deliverable = deliverableRepository.save(deliverable);

        activityLogService.log(project, uploader,
                uploader.getFullName() + " uploaded \"" + deliverable.getTitle() + "\" (" + deliverable.getVersionTag() + ")",
                "FILE_UPLOADED", "DELIVERABLE", deliverable.getId());

        notificationService.send(project.getClient(), project,
                "New File Uploaded",
                uploader.getFullName() + " uploaded \"" + title + "\" — ready for your review.");

        return DeliverableDto.from(deliverable);
    }

    @Transactional
    public DeliverableDto createLink(Long projectId, String title, String fileUrl,
                                      String category, String versionTag, User uploader) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        Deliverable.Category cat;
        try { cat = Deliverable.Category.valueOf(category.toUpperCase()); }
        catch (Exception e) { cat = Deliverable.Category.OTHER; }

        Deliverable deliverable = Deliverable.builder()
                .project(project)
                .title(title)
                .fileUrl(fileUrl)
                .fileName(title)
                .fileType("link")
                .category(cat)
                .versionTag(versionTag != null ? versionTag : "v1.0")
                .status(Deliverable.DeliverableStatus.PENDING)
                .uploadedBy(uploader)
                .build();

        deliverable = deliverableRepository.save(deliverable);

        activityLogService.log(project, uploader,
                uploader.getFullName() + " shared link \"" + title + "\"",
                "FILE_UPLOADED", "DELIVERABLE", deliverable.getId());

        return DeliverableDto.from(deliverable);
    }

    @Transactional
    public DeliverableDto approve(Long id, User client) {
        Deliverable deliverable = findOrThrow(id);
        Project project = deliverable.getProject();

        if (!project.getClient().getId().equals(client.getId())) {
            throw new IllegalArgumentException("Only the assigned client can approve deliverables");
        }

        deliverable.setStatus(Deliverable.DeliverableStatus.APPROVED);
        deliverable.setFeedback(null);
        deliverable = deliverableRepository.save(deliverable);

        activityLogService.log(project, client,
                client.getFullName() + " approved \"" + deliverable.getTitle() + "\" (" + deliverable.getVersionTag() + ")",
                "DELIVERABLE_APPROVED", "DELIVERABLE", deliverable.getId());

        notificationService.send(project.getAdmin(), project,
                "Deliverable Approved",
                client.getFullName() + " approved \"" + deliverable.getTitle() + "\"");

        return DeliverableDto.from(deliverable);
    }

    @Transactional
    public DeliverableDto requestRevision(Long id, String feedback, User client) {
        Deliverable deliverable = findOrThrow(id);
        Project project = deliverable.getProject();

        if (!project.getClient().getId().equals(client.getId())) {
            throw new IllegalArgumentException("Only the assigned client can request revisions");
        }

        deliverable.setStatus(Deliverable.DeliverableStatus.REVISION_REQUESTED);
        deliverable.setFeedback(feedback);
        deliverable = deliverableRepository.save(deliverable);

        activityLogService.log(project, client,
                client.getFullName() + " requested changes on \"" + deliverable.getTitle() + "\"",
                "REVISION_REQUESTED", "DELIVERABLE", deliverable.getId());

        notificationService.send(project.getAdmin(), project,
                "Revision Requested",
                client.getFullName() + " requested changes on \"" + deliverable.getTitle() + "\": " + feedback);

        return DeliverableDto.from(deliverable);
    }

    @Transactional
    public void delete(Long id, User currentUser) {
        Deliverable deliverable = findOrThrow(id);
        Project project = deliverable.getProject();

        if (!project.getAdmin().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Only the project admin can delete deliverables");
        }

        activityLogService.log(project, currentUser,
                currentUser.getFullName() + " deleted deliverable \"" + deliverable.getTitle() + "\"",
                "FILE_DELETED", "DELIVERABLE", id);

        deliverableRepository.delete(deliverable);
    }

    private Deliverable findOrThrow(Long id) {
        return deliverableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable", id));
    }
}
