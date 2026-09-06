-- ============================================================
-- Client Portal Lite - MySQL 8.x Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS client_portal_lite
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE client_portal_lite;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id            BIGINT          NOT NULL AUTO_INCREMENT,
    email         VARCHAR(255)    NOT NULL,
    password_hash VARCHAR(255)    NOT NULL,
    full_name     VARCHAR(255)    NOT NULL,
    role          ENUM('ADMIN','CLIENT') NOT NULL DEFAULT 'CLIENT',
    avatar_url    VARCHAR(512)    NULL,
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
    id               BIGINT          NOT NULL AUTO_INCREMENT,
    title            VARCHAR(255)    NOT NULL,
    description      TEXT            NULL,
    status           ENUM('PLANNING','IN_PROGRESS','UNDER_REVIEW','COMPLETED') NOT NULL DEFAULT 'PLANNING',
    progress_percent INT             NOT NULL DEFAULT 0,
    admin_id         BIGINT          NOT NULL,
    client_id        BIGINT          NOT NULL,
    start_date       DATE            NULL,
    due_date         DATE            NULL,
    pinned_resources JSON            NULL COMMENT 'Array of {label, url} objects',
    created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_projects_admin  FOREIGN KEY (admin_id)  REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_projects_client FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_projects_admin_id  (admin_id),
    INDEX idx_projects_client_id (client_id),
    INDEX idx_projects_status    (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- MILESTONES
-- ============================================================
CREATE TABLE IF NOT EXISTS milestones (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    project_id   BIGINT       NOT NULL,
    title        VARCHAR(255) NOT NULL,
    target_date  DATE         NULL,
    is_completed TINYINT(1)   NOT NULL DEFAULT 0,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_milestones_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_milestones_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    milestone_id BIGINT       NOT NULL,
    title        VARCHAR(255) NOT NULL,
    description  TEXT         NULL,
    status       ENUM('TO_DO','IN_PROGRESS','IN_REVIEW','DONE') NOT NULL DEFAULT 'TO_DO',
    priority     ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
    assignee_id  BIGINT       NULL,
    due_date     DATE         NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_tasks_milestone FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_assignee  FOREIGN KEY (assignee_id)  REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_tasks_milestone_id (milestone_id),
    INDEX idx_tasks_status       (status),
    INDEX idx_tasks_assignee_id  (assignee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- DELIVERABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS deliverables (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    project_id  BIGINT       NOT NULL, time: 11m 27s
    
    
    2 files changed
    Vi
    title       VARCHAR(255) NOT NULL,
    file_url    VARCHAR(512) NULL,
    file_name   VARCHAR(255) NULL,
    file_type   VARCHAR(100) NULL,
    file_size   BIGINT       NULL,
    category    ENUM('DESIGN','DOCS','CODE','INVOICES','OTHER') NOT NULL DEFAULT 'OTHER',
    version_tag VARCHAR(50)  NOT NULL DEFAULT 'v1.0',
    status      ENUM('PENDING','APPROVED','REVISION_REQUESTED') NOT NULL DEFAULT 'PENDING',
    uploaded_by BIGINT       NULL,
    feedback    TEXT         NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_deliverables_project     FOREIGN KEY (project_id)  REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_deliverables_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_deliverables_project_id (project_id),
    INDEX idx_deliverables_status     (status),
    INDEX idx_deliverables_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
    id              BIGINT   NOT NULL AUTO_INCREMENT,
    task_id         BIGINT   NULL,
    deliverable_id  BIGINT   NULL,
    user_id         BIGINT   NOT NULL,
    message         TEXT     NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_comments_task        FOREIGN KEY (task_id)        REFERENCES tasks(id)        ON DELETE CASCADE,
    CONSTRAINT fk_comments_deliverable FOREIGN KEY (deliverable_id) REFERENCES deliverables(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user        FOREIGN KEY (user_id)        REFERENCES users(id)        ON DELETE CASCADE,
    INDEX idx_comments_task_id        (task_id),
    INDEX idx_comments_deliverable_id (deliverable_id),
    INDEX idx_comments_user_id        (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id                 BIGINT       NOT NULL AUTO_INCREMENT,
    project_id         BIGINT       NOT NULL,
    user_id            BIGINT       NULL,
    action_description VARCHAR(512) NOT NULL,
    action_type        VARCHAR(100) NULL COMMENT 'e.g. FILE_UPLOADED, TASK_UPDATED, DELIVERABLE_APPROVED',
    entity_type        VARCHAR(100) NULL,
    entity_id          BIGINT       NULL,
    created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_activity_logs_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_activity_logs_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE SET NULL,
    INDEX idx_activity_logs_project_id (project_id),
    INDEX idx_activity_logs_user_id    (user_id),
    INDEX idx_activity_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    user_id    BIGINT       NOT NULL,
    project_id BIGINT       NULL,
    title      VARCHAR(255) NOT NULL,
    message    VARCHAR(512) NOT NULL,
    is_read    TINYINT(1)   NOT NULL DEFAULT 0,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notifications_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_notifications_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    INDEX idx_notifications_user_id  (user_id),
    INDEX idx_notifications_is_read  (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
