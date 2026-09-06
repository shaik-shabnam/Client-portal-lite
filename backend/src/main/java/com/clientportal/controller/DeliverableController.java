package com.clientportal.controller;

import com.clientportal.dto.ApiResponse;
import com.clientportal.dto.DeliverableDto;
import com.clientportal.entity.User;
import com.clientportal.service.DeliverableService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/deliverables")
@RequiredArgsConstructor
public class DeliverableController {

    private final DeliverableService deliverableService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<DeliverableDto>>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(deliverableService.getByProject(projectId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DeliverableDto>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(deliverableService.getById(id)));
    }

    @PostMapping("/project/{projectId}/upload")
    public ResponseEntity<ApiResponse<DeliverableDto>> upload(
            @PathVariable Long projectId,
            @RequestParam("title") String title,
            @RequestParam(value = "category", defaultValue = "OTHER") String category,
            @RequestParam(value = "versionTag", defaultValue = "v1.0") String versionTag,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) throws IOException {
        DeliverableDto dto = deliverableService.upload(projectId, title, category, versionTag, file, currentUser);
        return ResponseEntity.ok(ApiResponse.success("File uploaded", dto));
    }

    @PostMapping("/project/{projectId}/link")
    public ResponseEntity<ApiResponse<DeliverableDto>> addLink(
            @PathVariable Long projectId,
            @RequestBody LinkRequest request,
            @AuthenticationPrincipal User currentUser) {
        DeliverableDto dto = deliverableService.createLink(
                projectId, request.getTitle(), request.getFileUrl(),
                request.getCategory(), request.getVersionTag(), currentUser);
        return ResponseEntity.ok(ApiResponse.success("Link added", dto));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<DeliverableDto>> approve(@PathVariable Long id,
                                                                @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success("Deliverable approved",
                deliverableService.approve(id, currentUser)));
    }

    @PatchMapping("/{id}/request-revision")
    public ResponseEntity<ApiResponse<DeliverableDto>> requestRevision(
            @PathVariable Long id,
            @RequestBody RevisionRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success("Revision requested",
                deliverableService.requestRevision(id, request.getFeedback(), currentUser)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id,
                                                     @AuthenticationPrincipal User currentUser) {
        deliverableService.delete(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Deliverable deleted", null));
    }

    @Data
    static class LinkRequest {
        private String title;
        private String fileUrl;
        private String category;
        private String versionTag;
    }

    @Data
    static class RevisionRequest {
        private String feedback;
    }
}
