// ── Auth ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  userId: number
  email: string
  fullName: string
  role: 'ADMIN' | 'CLIENT'
  token: string
}

// ── Users ───────────────────────────────────────────────────────────────────
export interface UserDto {
  id: number
  email: string
  fullName: string
  role: 'ADMIN' | 'CLIENT'
  avatarUrl?: string
  createdAt: string
}

// ── Projects ────────────────────────────────────────────────────────────────
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED'

export interface PinnedResource {
  label: string
  url: string
}

export interface ProjectDto {
  id: number
  title: string
  description?: string
  status: ProjectStatus
  progressPercent: number
  admin: UserDto
  client: UserDto
  startDate?: string
  dueDate?: string
  pinnedResources?: string   // JSON string
  createdAt: string
  updatedAt: string
  totalTasks: number
  completedTasks: number
  totalMilestones: number
  completedMilestones: number
  pendingDeliverables: number
  approvedDeliverables: number
}

export interface ProjectRequest {
  title: string
  description?: string
  status?: ProjectStatus
  progressPercent?: number
  clientId: number
  startDate?: string
  dueDate?: string
  pinnedResources?: string
}

// ── Milestones ───────────────────────────────────────────────────────────────
export interface MilestoneDto {
  id: number
  projectId: number
  title: string
  targetDate?: string
  isCompleted: boolean
  createdAt: string
  tasks?: TaskDto[]
}

// ── Tasks ────────────────────────────────────────────────────────────────────
export type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface TaskDto {
  id: number
  milestoneId: number
  milestoneTitle?: string
  projectId?: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignee?: UserDto
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface TaskRequest {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  milestoneId: number
  assigneeId?: number
  dueDate?: string
}

// ── Deliverables ─────────────────────────────────────────────────────────────
export type DeliverableStatus = 'PENDING' | 'APPROVED' | 'REVISION_REQUESTED'
export type DeliverableCategory = 'DESIGN' | 'DOCS' | 'CODE' | 'INVOICES' | 'OTHER'

export interface DeliverableDto {
  id: number
  projectId: number
  title: string
  fileUrl?: string
  fileName?: string
  fileType?: string
  fileSize?: number
  category: DeliverableCategory
  versionTag: string
  status: DeliverableStatus
  uploadedBy?: UserDto
  feedback?: string
  createdAt: string
  updatedAt: string
}

// ── Comments ──────────────────────────────────────────────────────────────────
export interface CommentDto {
  id: number
  taskId?: number
  deliverableId?: number
  user: UserDto
  message: string
  createdAt: string
  updatedAt: string
}

// ── Activity ──────────────────────────────────────────────────────────────────
export interface ActivityLogDto {
  id: number
  projectId: number
  user?: UserDto
  actionDescription: string
  actionType?: string
  entityType?: string
  entityId?: number
  createdAt: string
}

// ── Notifications ─────────────────────────────────────────────────────────────
export interface NotificationDto {
  id: number
  userId: number
  projectId?: number
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

// ── API wrapper ───────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}
