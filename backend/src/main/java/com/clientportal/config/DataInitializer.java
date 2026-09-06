package com.clientportal.config;

import com.clientportal.entity.*;
import com.clientportal.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final MilestoneRepository milestoneRepository;
    private final TaskRepository taskRepository;
    private final DeliverableRepository deliverableRepository;
    private final ActivityLogRepository activityLogRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("DataInitializer: data already present, skipping seed.");
            return;
        }

        log.info("DataInitializer: seeding demo data...");

        // ── Users ────────────────────────────────────────────────────────────
        User admin = userRepository.save(User.builder()
                .email("admin@clientportal.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .fullName("Alex Johnson")
                .role(User.Role.ADMIN)
                .build());

        User admin2 = userRepository.save(User.builder()
                .email("sarah@clientportal.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .fullName("Sarah Williams")
                .role(User.Role.ADMIN)
                .build());

        User client1 = userRepository.save(User.builder()
                .email("client@acmecorp.com")
                .passwordHash(passwordEncoder.encode("client123"))
                .fullName("David Chen")
                .role(User.Role.CLIENT)
                .build());

        User client2 = userRepository.save(User.builder()
                .email("client@designco.com")
                .passwordHash(passwordEncoder.encode("client123"))
                .fullName("Emma Rodriguez")
                .role(User.Role.CLIENT)
                .build());

        // ── Project 1: E-Commerce Platform Redesign ──────────────────────────
        Project project1 = projectRepository.save(Project.builder()
                .title("E-Commerce Platform Redesign")
                .description("Full redesign of the ACME Corp online store including new UI/UX, improved checkout flow, and mobile-first responsive design.")
                .status(Project.Status.IN_PROGRESS)
                .progressPercent(65)
                .admin(admin)
                .client(client1)
                .startDate(LocalDate.now().minusDays(30))
                .dueDate(LocalDate.now().plusDays(45))
                .pinnedResources("[{\"label\":\"Figma Design File\",\"url\":\"https://figma.com/demo\"},{\"label\":\"Project Drive\",\"url\":\"https://drive.google.com/demo\"},{\"label\":\"Brand Guidelines\",\"url\":\"https://notion.so/demo\"}]")
                .build());

        // Milestones for Project 1
        Milestone m1p1 = milestoneRepository.save(Milestone.builder()
                .project(project1).title("Discovery & Research")
                .targetDate(LocalDate.now().minusDays(20))
                .isCompleted(true).build());

        Milestone m2p1 = milestoneRepository.save(Milestone.builder()
                .project(project1).title("UI/UX Design")
                .targetDate(LocalDate.now().minusDays(5))
                .isCompleted(true).build());

        Milestone m3p1 = milestoneRepository.save(Milestone.builder()
                .project(project1).title("Frontend Development")
                .targetDate(LocalDate.now().plusDays(20))
                .isCompleted(false).build());

        Milestone m4p1 = milestoneRepository.save(Milestone.builder()
                .project(project1).title("QA & Launch")
                .targetDate(LocalDate.now().plusDays(45))
                .isCompleted(false).build());

        // Tasks for Milestone 1 (completed)
        taskRepository.save(Task.builder().milestone(m1p1).title("Stakeholder interviews")
                .description("Conduct interviews with 5 key stakeholders.").status(Task.Status.DONE)
                .priority(Task.Priority.HIGH).assignee(admin).build());
        taskRepository.save(Task.builder().milestone(m1p1).title("Competitor analysis")
                .description("Analyze top 3 competitor platforms.").status(Task.Status.DONE)
                .priority(Task.Priority.MEDIUM).assignee(admin).build());
        taskRepository.save(Task.builder().milestone(m1p1).title("User persona creation")
                .description("Define 3 primary user personas.").status(Task.Status.DONE)
                .priority(Task.Priority.MEDIUM).assignee(admin).build());

        // Tasks for Milestone 2 (design phase)
        taskRepository.save(Task.builder().milestone(m2p1).title("Wireframe homepage")
                .description("Create low-fidelity wireframes for homepage.").status(Task.Status.DONE)
                .priority(Task.Priority.HIGH).assignee(admin).build());
        taskRepository.save(Task.builder().milestone(m2p1).title("High-fidelity mockups")
                .description("Design pixel-perfect mockups for all key pages.").status(Task.Status.DONE)
                .priority(Task.Priority.HIGH).assignee(admin).build());
        taskRepository.save(Task.builder().milestone(m2p1).title("Client design approval")
                .description("Present designs and collect client sign-off.").status(Task.Status.DONE)
                .priority(Task.Priority.HIGH).assignee(admin).build());

        // Tasks for Milestone 3 (active development)
        Task task1 = taskRepository.save(Task.builder().milestone(m3p1).title("Build React component library")
                .description("Create reusable UI components based on approved designs.")
                .status(Task.Status.IN_PROGRESS).priority(Task.Priority.HIGH)
                .assignee(admin).dueDate(LocalDate.now().plusDays(7)).build());

        Task task2 = taskRepository.save(Task.builder().milestone(m3p1).title("Implement product listing page")
                .description("Build the product catalog with filters and search.")
                .status(Task.Status.IN_PROGRESS).priority(Task.Priority.HIGH)
                .assignee(admin).dueDate(LocalDate.now().plusDays(10)).build());

        Task task3 = taskRepository.save(Task.builder().milestone(m3p1).title("Checkout flow integration")
                .description("Implement cart and multi-step checkout with payment gateway.")
                .status(Task.Status.TO_DO).priority(Task.Priority.HIGH)
                .assignee(admin).dueDate(LocalDate.now().plusDays(18)).build());

        Task task4 = taskRepository.save(Task.builder().milestone(m3p1).title("Mobile responsive adjustments")
                .description("Ensure all pages are fully responsive on mobile devices.")
                .status(Task.Status.TO_DO).priority(Task.Priority.MEDIUM)
                .assignee(admin).dueDate(LocalDate.now().plusDays(20)).build());

        Task task5 = taskRepository.save(Task.builder().milestone(m3p1).title("API integration — product data")
                .description("Connect frontend to product catalog API.")
                .status(Task.Status.IN_REVIEW).priority(Task.Priority.HIGH)
                .assignee(admin).dueDate(LocalDate.now().plusDays(5)).build());

        // Tasks for Milestone 4 (QA)
        taskRepository.save(Task.builder().milestone(m4p1).title("Cross-browser testing")
                .description("Test on Chrome, Firefox, Safari, and Edge.")
                .status(Task.Status.TO_DO).priority(Task.Priority.MEDIUM).build());
        taskRepository.save(Task.builder().milestone(m4p1).title("Performance optimization")
                .description("Achieve Lighthouse score > 90 on all pages.")
                .status(Task.Status.TO_DO).priority(Task.Priority.HIGH).build());
        taskRepository.save(Task.builder().milestone(m4p1).title("Production deployment")
                .description("Deploy to production environment with zero downtime.")
                .status(Task.Status.TO_DO).priority(Task.Priority.HIGH).build());

        // Deliverables for Project 1
        Deliverable d1 = deliverableRepository.save(Deliverable.builder()
                .project(project1).title("UI Wireframes Pack")
                .fileUrl("https://figma.com/wireframes-demo").fileName("wireframes.fig")
                .fileType("figma").category(Deliverable.Category.DESIGN)
                .versionTag("v1.0").status(Deliverable.DeliverableStatus.APPROVED)
                .uploadedBy(admin).build());

        Deliverable d2 = deliverableRepository.save(Deliverable.builder()
                .project(project1).title("High-Fidelity Mockups")
                .fileUrl("https://figma.com/hifi-demo").fileName("hifi-mockups.fig")
                .fileType("figma").category(Deliverable.Category.DESIGN)
                .versionTag("v2.1").status(Deliverable.DeliverableStatus.APPROVED)
                .uploadedBy(admin).build());

        Deliverable d3 = deliverableRepository.save(Deliverable.builder()
                .project(project1).title("Technical Specification Document")
                .fileUrl("https://docs.google.com/tech-spec-demo").fileName("tech-spec.pdf")
                .fileType("pdf").category(Deliverable.Category.DOCS)
                .versionTag("v1.2").status(Deliverable.DeliverableStatus.PENDING)
                .uploadedBy(admin).build());

        Deliverable d4 = deliverableRepository.save(Deliverable.builder()
                .project(project1).title("Project Invoice — Phase 1")
                .fileUrl("https://drive.google.com/invoice-demo").fileName("invoice-phase1.pdf")
                .fileType("pdf").category(Deliverable.Category.INVOICES)
                .versionTag("Final").status(Deliverable.DeliverableStatus.APPROVED)
                .uploadedBy(admin).build());

        Deliverable d5 = deliverableRepository.save(Deliverable.builder()
                .project(project1).title("Frontend Source Code — Sprint 1")
                .fileUrl("https://github.com/demo/ecommerce-frontend").fileName("frontend-sprint1.zip")
                .fileType("link").category(Deliverable.Category.CODE)
                .versionTag("v0.9").status(Deliverable.DeliverableStatus.REVISION_REQUESTED)
                .uploadedBy(admin)
                .feedback("Please add unit tests for the cart component and fix the mobile menu alignment issue.")
                .build());

        // Comments on tasks
        Comment c1 = commentRepository(project1, task1, admin,
                "Component library is 70% complete. Button, Card, Modal, and Form components done.");
        Comment c2 = commentRepository(project1, task1, client1,
                "Looking great so far! Can we add a loading skeleton component as well?");
        Comment c3 = commentRepository(project1, task5, admin,
                "API integration complete for product listing. Awaiting review before merging to main.");
        Comment c4 = commentRepository(project1, task5, admin,
                "Note: The search endpoint has a 200ms delay — we should consider caching.");

        // Comments on deliverables
        Comment cd1 = deliverableCommentRepository(project1, d5, client1,
                "The cart component crashes on iOS Safari when the quantity is updated. Please fix.");
        Comment cd2 = deliverableCommentRepository(project1, d5, admin,
                "Thanks for the feedback! Will address the iOS Safari issue in the next sprint.");

        // Activity Logs for Project 1
        saveActivity(project1, admin, "Alex Johnson created project \"E-Commerce Platform Redesign\"", "PROJECT_CREATED", "PROJECT", project1.getId(), -30);
        saveActivity(project1, admin, "Alex Johnson added milestone \"Discovery & Research\"", "MILESTONE_CREATED", "MILESTONE", m1p1.getId(), -30);
        saveActivity(project1, admin, "Alex Johnson uploaded \"UI Wireframes Pack\" (v1.0)", "FILE_UPLOADED", "DELIVERABLE", d1.getId(), -22);
        saveActivity(project1, client1, "David Chen approved \"UI Wireframes Pack\" (v1.0)", "DELIVERABLE_APPROVED", "DELIVERABLE", d1.getId(), -20);
        saveActivity(project1, admin, "Alex Johnson uploaded \"High-Fidelity Mockups\" (v2.1)", "FILE_UPLOADED", "DELIVERABLE", d2.getId(), -15);
        saveActivity(project1, client1, "David Chen approved \"High-Fidelity Mockups\" (v2.1)", "DELIVERABLE_APPROVED", "DELIVERABLE", d2.getId(), -12);
        saveActivity(project1, admin, "Alex Johnson moved \"API integration — product data\" to IN_REVIEW", "TASK_STATUS_CHANGED", "TASK", task5.getId(), -3);
        saveActivity(project1, client1, "David Chen requested changes on \"Frontend Source Code — Sprint 1\"", "REVISION_REQUESTED", "DELIVERABLE", d5.getId(), -1);
        saveActivity(project1, admin, "Alex Johnson commented on task \"Build React component library\"", "COMMENT_ADDED", "TASK", task1.getId(), 0);

        // Notifications for client1
        saveNotification(client1, project1, "New Project Assigned", "You have been added to project: E-Commerce Platform Redesign", true);
        saveNotification(client1, project1, "New File Uploaded", "Alex Johnson uploaded \"Technical Specification Document\" — ready for your review.", false);
        saveNotification(client1, project1, "Task Updated", "\"API integration — product data\" is now IN REVIEW", false);

        // Notifications for admin
        saveNotification(admin, project1, "Revision Requested", "David Chen requested changes on \"Frontend Source Code — Sprint 1\"", false);
        saveNotification(admin, project1, "New Comment", "David Chen commented on \"Build React component library\"", false);

        // ── Project 2: Brand Identity & Marketing Site ───────────────────────
        Project project2 = projectRepository.save(Project.builder()
                .title("Brand Identity & Marketing Website")
                .description("Complete brand refresh including new logo, color system, typography guidelines, and a fully redesigned marketing website for DesignCo.")
                .status(Project.Status.UNDER_REVIEW)
                .progressPercent(88)
                .admin(admin2)
                .client(client2)
                .startDate(LocalDate.now().minusDays(60))
                .dueDate(LocalDate.now().plusDays(14))
                .pinnedResources("[{\"label\":\"Brand Board\",\"url\":\"https://miro.com/demo\"},{\"label\":\"Asset Library\",\"url\":\"https://drive.google.com/demo2\"}]")
                .build());

        Milestone m1p2 = milestoneRepository.save(Milestone.builder()
                .project(project2).title("Brand Strategy")
                .targetDate(LocalDate.now().minusDays(45)).isCompleted(true).build());

        Milestone m2p2 = milestoneRepository.save(Milestone.builder()
                .project(project2).title("Visual Identity Design")
                .targetDate(LocalDate.now().minusDays(20)).isCompleted(true).build());

        Milestone m3p2 = milestoneRepository.save(Milestone.builder()
                .project(project2).title("Website Development")
                .targetDate(LocalDate.now().minusDays(5)).isCompleted(true).build());

        Milestone m4p2 = milestoneRepository.save(Milestone.builder()
                .project(project2).title("Client Review & Launch")
                .targetDate(LocalDate.now().plusDays(14)).isCompleted(false).build());

        taskRepository.save(Task.builder().milestone(m1p2).title("Brand discovery workshop")
                .status(Task.Status.DONE).priority(Task.Priority.HIGH).assignee(admin2).build());
        taskRepository.save(Task.builder().milestone(m1p2).title("Positioning and messaging framework")
                .status(Task.Status.DONE).priority(Task.Priority.HIGH).assignee(admin2).build());
        taskRepository.save(Task.builder().milestone(m2p2).title("Logo design — 3 concepts")
                .status(Task.Status.DONE).priority(Task.Priority.HIGH).assignee(admin2).build());
        taskRepository.save(Task.builder().milestone(m2p2).title("Color palette and typography system")
                .status(Task.Status.DONE).priority(Task.Priority.MEDIUM).assignee(admin2).build());
        taskRepository.save(Task.builder().milestone(m3p2).title("Homepage build")
                .status(Task.Status.DONE).priority(Task.Priority.HIGH).assignee(admin2).build());
        taskRepository.save(Task.builder().milestone(m3p2).title("Services and portfolio pages")
                .status(Task.Status.DONE).priority(Task.Priority.HIGH).assignee(admin2).build());

        Task reviewTask = taskRepository.save(Task.builder().milestone(m4p2)
                .title("Final client sign-off").description("Walk through the complete website and brand guide with the client for final approval.")
                .status(Task.Status.IN_REVIEW).priority(Task.Priority.HIGH).assignee(admin2)
                .dueDate(LocalDate.now().plusDays(3)).build());

        taskRepository.save(Task.builder().milestone(m4p2).title("DNS and hosting setup")
                .description("Point domain to production server and configure SSL.")
                .status(Task.Status.TO_DO).priority(Task.Priority.HIGH).assignee(admin2)
                .dueDate(LocalDate.now().plusDays(12)).build());

        Deliverable dp1 = deliverableRepository.save(Deliverable.builder()
                .project(project2).title("Brand Guidelines Document")
                .fileUrl("https://drive.google.com/brand-guide-demo").fileName("brand-guidelines.pdf")
                .fileType("pdf").category(Deliverable.Category.DOCS)
                .versionTag("Final").status(Deliverable.DeliverableStatus.APPROVED)
                .uploadedBy(admin2).build());

        Deliverable dp2 = deliverableRepository.save(Deliverable.builder()
                .project(project2).title("Logo Package (SVG/PNG/EPS)")
                .fileUrl("https://drive.google.com/logo-pack-demo").fileName("logo-package.zip")
                .fileType("zip").category(Deliverable.Category.DESIGN)
                .versionTag("Final").status(Deliverable.DeliverableStatus.APPROVED)
                .uploadedBy(admin2).build());

        Deliverable dp3 = deliverableRepository.save(Deliverable.builder()
                .project(project2).title("Marketing Website — Staging Preview")
                .fileUrl("https://staging.designco-demo.com").fileName("Website Preview")
                .fileType("link").category(Deliverable.Category.CODE)
                .versionTag("v1.0").status(Deliverable.DeliverableStatus.PENDING)
                .uploadedBy(admin2).build());

        // Activity for Project 2
        saveActivity(project2, admin2, "Sarah Williams created project \"Brand Identity & Marketing Website\"", "PROJECT_CREATED", "PROJECT", project2.getId(), -60);
        saveActivity(project2, admin2, "Sarah Williams uploaded \"Brand Guidelines Document\"", "FILE_UPLOADED", "DELIVERABLE", dp1.getId(), -18);
        saveActivity(project2, client2, "Emma Rodriguez approved \"Brand Guidelines Document\"", "DELIVERABLE_APPROVED", "DELIVERABLE", dp1.getId(), -15);
        saveActivity(project2, admin2, "Sarah Williams uploaded \"Logo Package\"", "FILE_UPLOADED", "DELIVERABLE", dp2.getId(), -14);
        saveActivity(project2, client2, "Emma Rodriguez approved \"Logo Package (SVG/PNG/EPS)\"", "DELIVERABLE_APPROVED", "DELIVERABLE", dp2.getId(), -12);
        saveActivity(project2, admin2, "Sarah Williams shared link \"Marketing Website — Staging Preview\"", "FILE_UPLOADED", "DELIVERABLE", dp3.getId(), -2);
        saveActivity(project2, admin2, "Sarah Williams changed project status to UNDER_REVIEW", "PROJECT_UPDATED", "PROJECT", project2.getId(), -1);

        saveNotification(client2, project2, "Website Ready for Review", "Your marketing website staging preview is ready. Please review and approve.", false);
        saveNotification(admin2, project2, "Project Under Review", "Emma Rodriguez is reviewing the final deliverables.", false);

        log.info("DataInitializer: seed complete. Accounts:");
        log.info("  ADMIN  → admin@clientportal.com  / admin123");
        log.info("  ADMIN  → sarah@clientportal.com  / admin123");
        log.info("  CLIENT → client@acmecorp.com     / client123");
        log.info("  CLIENT → client@designco.com     / client123");
    }

    // ── helpers so we can persist Comment without exposing a commentRepository field ──

    private final CommentRepository commentRepository;

    private Comment commentRepository(Project project, Task task, User user, String message) {
        Comment c = Comment.builder().task(task).user(user).message(message).build();
        return commentRepository.save(c);
    }

    private Comment deliverableCommentRepository(Project project, Deliverable deliverable, User user, String message) {
        Comment c = Comment.builder().deliverable(deliverable).user(user).message(message).build();
        return commentRepository.save(c);
    }

    private void saveActivity(Project project, User user, String description,
                               String actionType, String entityType, Long entityId, int daysAgo) {
        ActivityLog entry = ActivityLog.builder()
                .project(project).user(user)
                .actionDescription(description)
                .actionType(actionType)
                .entityType(entityType)
                .entityId(entityId)
                .build();
        ActivityLog saved = activityLogRepository.save(entry);
        // Backdate for a realistic timeline in the UI
        LocalDateTime backdated = LocalDateTime.now().minusDays(Math.abs(daysAgo));
        activityLogRepository.backdateCreatedAt(saved.getId(), backdated);
    }

    private void saveNotification(User user, Project project, String title, String message, boolean isRead) {
        notificationRepository.save(Notification.builder()
                .user(user).project(project).title(title).message(message).isRead(isRead).build());
    }
}
