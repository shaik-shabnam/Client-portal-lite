import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderKanban, CheckCircle, Clock, TrendingUp,
  ArrowRight, PlusCircle, AlertCircle,
} from 'lucide-react'
import { getProjects } from '../api/projects'
import type { ProjectDto } from '../types'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import ProgressBar from '../components/ProgressBar'
import { projectStatusColor, projectStatusLabel } from '../utils/status'
import { formatDate } from '../utils/format'

export default function DashboardPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const total = projects.length
  const completed = projects.filter((p) => p.status === 'COMPLETED').length
  const inProgress = projects.filter((p) => p.status === 'IN_PROGRESS').length
  const pendingDeliverables = projects.reduce((s, p) => s + (p.pendingDeliverables ?? 0), 0)
  const approvedDeliverables = projects.reduce((s, p) => s + (p.approvedDeliverables ?? 0), 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse h-24" />
          ))}
        </div>
      </div>
    )
  }

  // ── CLIENT DASHBOARD ──────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Welcome back, <strong>{user?.fullName}</strong>. Here's your project workspace.
          </p>
        </div>

        {/* Client stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="My Projects" value={total} icon={FolderKanban}
            iconBg="bg-brand-50" iconColor="text-brand-600" />
          <StatCard label="Pending My Review" value={pendingDeliverables} icon={AlertCircle}
            iconBg={pendingDeliverables > 0 ? 'bg-amber-50' : 'bg-slate-50'}
            iconColor={pendingDeliverables > 0 ? 'text-amber-600' : 'text-slate-400'} />
          <StatCard label="Approved by Me" value={approvedDeliverables} icon={CheckCircle}
            iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        </div>

        {/* Pending approvals banner */}
        {pendingDeliverables > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {pendingDeliverables} deliverable{pendingDeliverables > 1 ? 's' : ''} waiting for your approval
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Click on a project to review and approve files
              </p>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Active Projects</h2>
            <Link to="/projects" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="card p-12 flex flex-col items-center text-slate-400">
              <FolderKanban size={40} className="mb-3 opacity-40" />
              <p className="text-slate-500">No projects assigned to you yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {projects.map((project) => (
                <ClientProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── ADMIN DASHBOARD ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agency Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Welcome back, <strong>{user?.fullName}</strong>. Here's your full project overview.
          </p>
        </div>
        <Link to="/projects" className="btn-primary">
          <PlusCircle size={16} /> New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={total} icon={FolderKanban}
          iconBg="bg-brand-50" iconColor="text-brand-600" />
        <StatCard label="In Progress" value={inProgress} icon={TrendingUp}
          iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard label="Completed" value={completed} icon={CheckCircle}
          iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard label="Pending Client Reviews" value={pendingDeliverables}
          icon={pendingDeliverables > 0 ? AlertCircle : Clock}
          iconBg={pendingDeliverables > 0 ? 'bg-amber-50' : 'bg-slate-50'}
          iconColor={pendingDeliverables > 0 ? 'text-amber-600' : 'text-slate-400'} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">All Projects</h2>
          <Link to="/projects" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="card p-12 flex flex-col items-center text-slate-400">
            <FolderKanban size={40} className="mb-3 opacity-40" />
            <p className="text-base font-medium text-slate-500">No projects yet</p>
            <Link to="/projects" className="btn-primary mt-4">Create your first project</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.slice(0, 6).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Admin project card — shows client name and full controls
function ProjectCard({ project }: { project: ProjectDto }) {
  const statusColor = projectStatusColor[project.status]
  const statusLabel = projectStatusLabel[project.status]

  return (
    <Link
      to={`/projects/${project.id}`}
      className="card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 block group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 group-hover:text-brand-700 transition-colors truncate">
            {project.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Client: {project.client.fullName}</p>
        </div>
        <span className={`badge shrink-0 ${statusColor}`}>{statusLabel}</span>
      </div>
      {project.description && (
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{project.description}</p>
      )}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Progress</span>
          <span className="font-semibold text-slate-700">{project.progressPercent}%</span>
        </div>
        <ProgressBar value={project.progressPercent} />
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>{project.completedTasks}/{project.totalTasks} tasks</span>
          {project.pendingDeliverables > 0 && (
            <span className="text-amber-600 font-medium">
              {project.pendingDeliverables} pending client review
            </span>
          )}
        </div>
        {project.dueDate && (
          <div className="flex items-center gap-1">
            <Clock size={11} />
            <span>{formatDate(project.dueDate)}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

// Client project card — shows agency name, progress, and approval actions
function ClientProjectCard({ project }: { project: ProjectDto }) {
  const statusColor = projectStatusColor[project.status]
  const statusLabel = projectStatusLabel[project.status]

  return (
    <Link
      to={`/projects/${project.id}`}
      className="card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 block group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 group-hover:text-brand-700 transition-colors truncate">
            {project.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Agency: {project.admin.fullName}</p>
        </div>
        <span className={`badge shrink-0 ${statusColor}`}>{statusLabel}</span>
      </div>
      {project.description && (
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{project.description}</p>
      )}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Overall Progress</span>
          <span className="font-semibold text-slate-700">{project.progressPercent}%</span>
        </div>
        <ProgressBar value={project.progressPercent} />
      </div>

      {/* Client-specific indicators */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={`rounded-lg px-3 py-2 text-center ${
          project.pendingDeliverables > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-500'
        }`}>
          <p className="font-bold text-base">{project.pendingDeliverables}</p>
          <p>Awaiting Review</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 rounded-lg px-3 py-2 text-center">
          <p className="font-bold text-base">{project.approvedDeliverables}</p>
          <p>Approved</p>
        </div>
      </div>

      {project.dueDate && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs text-slate-400">
          <Clock size={11} />
          <span>Due {formatDate(project.dueDate)}</span>
        </div>
      )}
    </Link>
  )
}
