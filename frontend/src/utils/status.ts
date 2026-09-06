import type { ProjectStatus, TaskStatus, DeliverableStatus, TaskPriority } from '../types'

// ── Project status ────────────────────────────────────────────────────────────
export const projectStatusLabel: Record<ProjectStatus, string> = {
  PLANNING: 'Planning',
  IN_PROGRESS: 'In Progress',
  UNDER_REVIEW: 'Under Review',
  COMPLETED: 'Completed',
}

export const projectStatusColor: Record<ProjectStatus, string> = {
  PLANNING:     'bg-slate-100 text-slate-700',
  IN_PROGRESS:  'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  COMPLETED:    'bg-emerald-100 text-emerald-700',
}

export const projectHealthColor: Record<ProjectStatus, string> = {
  PLANNING:     'text-slate-500',
  IN_PROGRESS:  'text-blue-600',
  UNDER_REVIEW: 'text-amber-600',
  COMPLETED:    'text-emerald-600',
}

// ── Task status ───────────────────────────────────────────────────────────────
export const taskStatusLabel: Record<TaskStatus, string> = {
  TO_DO:       'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW:   'In Review',
  DONE:        'Done',
}

export const taskStatusColor: Record<TaskStatus, string> = {
  TO_DO:       'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  IN_REVIEW:   'bg-violet-100 text-violet-700',
  DONE:        'bg-emerald-100 text-emerald-700',
}

export const taskStatusBorder: Record<TaskStatus, string> = {
  TO_DO:       'border-slate-200',
  IN_PROGRESS: 'border-blue-200',
  IN_REVIEW:   'border-violet-200',
  DONE:        'border-emerald-200',
}

// ── Task priority ─────────────────────────────────────────────────────────────
export const priorityLabel: Record<TaskPriority, string> = {
  LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High',
}

export const priorityColor: Record<TaskPriority, string> = {
  LOW:    'bg-slate-100 text-slate-500',
  MEDIUM: 'bg-amber-100 text-amber-600',
  HIGH:   'bg-red-100 text-red-600',
}

// ── Deliverable status ────────────────────────────────────────────────────────
export const deliverableStatusLabel: Record<DeliverableStatus, string> = {
  PENDING:            'Pending Review',
  APPROVED:           'Approved',
  REVISION_REQUESTED: 'Revision Requested',
}

export const deliverableStatusColor: Record<DeliverableStatus, string> = {
  PENDING:            'bg-amber-100 text-amber-700',
  APPROVED:           'bg-emerald-100 text-emerald-700',
  REVISION_REQUESTED: 'bg-red-100 text-red-700',
}

// ── Category icons (emoji fallback) ──────────────────────────────────────────
export const categoryLabel: Record<string, string> = {
  DESIGN:   'Design',
  DOCS:     'Docs',
  CODE:     'Code',
  INVOICES: 'Invoices',
  OTHER:    'Other',
}

export const categoryColor: Record<string, string> = {
  DESIGN:   'bg-pink-100 text-pink-700',
  DOCS:     'bg-blue-100 text-blue-700',
  CODE:     'bg-violet-100 text-violet-700',
  INVOICES: 'bg-emerald-100 text-emerald-700',
  OTHER:    'bg-slate-100 text-slate-600',
}
