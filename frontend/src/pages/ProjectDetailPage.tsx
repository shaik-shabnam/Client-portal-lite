import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  LayoutList, FileBox, Activity, CheckSquare,
  ArrowRight, ExternalLink, Flag, CalendarDays,
  Users, TrendingUp, BookOpen,
} from 'lucide-react'
import { getProject, getMilestones } from '../api/projects'
import type { ProjectDto, MilestoneDto } from '../types'
import { useAuth } from '../context/AuthContext'
import ProgressBar from '../components/ProgressBar'
import ActivityTimeline from '../components/ActivityTimeline'
import {
  projectStatusColor, projectStatusLabel,
} from '../utils/status'
import { formatDate, parsePinnedResources } from '../utils/format'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [project, setProject] = useState<ProjectDto | null>(null)
  const [milestones, setMilestones] = useState<MilestoneDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getProject(projectId), getMilestones(projectId)])
      .then(([p, m]) => { setProject(p); setMilestones(m) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="card h-32 animate-pulse" />)}</div>
  }
  if (!project) return <p className="text-slate-500">Project not found.</p>

  const pinnedResources = parsePinnedResources(project.pinnedResources)
  const completedMilestones = milestones.filter((m) => m.isCompleted).length

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link to="/projects" className="hover:text-brand-600">Projects</Link>
            <ArrowRight size={12} />
            <span className="text-slate-700 font-medium">{project.title}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
          {project.description && (
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge ${projectStatusColor[project.status]} text-sm px-3 py-1`}>
            {projectStatusLabel[project.status]}
          </span>
          <Link to={`/projects/${projectId}/summary`} className="btn-secondary text-xs">
            <BookOpen size={13} /> Summary
          </Link>
        </div>
      </div>

      {/* Progress banner */}
      <div className="card p-5 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
        <div className="flex items-center justify-between mb-3">
          <span className="text-brand-100 text-sm font-medium">Overall Progress</span>
          <span className="text-3xl font-bold">{project.progressPercent}%</span>
        </div>
        <div className="bg-brand-500/50 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 bg-white rounded-full transition-all duration-700"
            style={{ width: `${project.progressPercent}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-brand-500">
          {[
            { label: 'Tasks Done', val: `${project.completedTasks}/${project.totalTasks}` },
            { label: 'Milestones', val: `${completedMilestones}/${milestones.length}` },
            { label: 'Pending Reviews', val: project.pendingDeliverables },
            { label: 'Approved Files', val: project.approvedDeliverables },
          ].map(({ label, val }) => (
            <div key={label}>
              <p className="text-brand-200 text-xs">{label}</p>
              <p className="text-white font-bold text-lg">{val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { to: `/projects/${projectId}/tasks`, icon: LayoutList, label: 'Tasks', color: 'text-blue-600 bg-blue-50', desc: `${project.completedTasks} done` },
              { to: `/projects/${projectId}/deliverables`, icon: FileBox, label: 'Deliverables', color: 'text-violet-600 bg-violet-50', desc: `${project.pendingDeliverables} pending` },
              { to: `/projects/${projectId}/activity`, icon: Activity, label: 'Activity', color: 'text-amber-600 bg-amber-50', desc: 'Full timeline' },
            ].map(({ to, icon: Icon, label, color, desc }) => (
              <Link
                key={to}
                to={to}
                className="card p-4 flex items-center gap-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-brand-700">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
                <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-brand-400 transition-colors" />
              </Link>
            ))}
          </div>

          {/* Milestones */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Flag size={16} className="text-brand-600" />
                Milestones
              </h2>
              <span className="text-sm text-slate-500">{completedMilestones}/{milestones.length} complete</span>
            </div>
            {milestones.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No milestones yet</p>
            ) : (
              <div className="space-y-2">
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      m.isCompleted
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      m.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                    }`}>
                      {m.isCompleted && <CheckSquare size={10} className="text-white" />}
                    </div>
                    <span className={`text-sm flex-1 ${m.isCompleted ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>
                      {m.title}
                    </span>
                    {m.targetDate && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <CalendarDays size={11} />
                        {formatDate(m.targetDate)}
                      </span>
                    )}
                    {m.tasks && (
                      <span className="text-xs text-slate-400">
                        {m.tasks.filter((t) => t.status === 'DONE').length}/{m.tasks.length} tasks
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project info */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-600" />
              Project Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Agency', value: project.admin.fullName, icon: Users },
                { label: 'Client', value: project.client.fullName, icon: Users },
                { label: 'Start Date', value: formatDate(project.startDate), icon: CalendarDays },
                { label: 'Due Date', value: formatDate(project.dueDate), icon: CalendarDays },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="font-medium text-slate-700">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Pinned Resources */}
          {pinnedResources.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                <ExternalLink size={14} className="text-brand-600" />
                Pinned Resources
              </h2>
              <div className="space-y-2">
                {pinnedResources.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-colors text-sm group"
                  >
                    <div className="w-6 h-6 bg-brand-100 rounded flex items-center justify-center shrink-0">
                      <ExternalLink size={11} className="text-brand-600" />
                    </div>
                    <span className="text-slate-700 group-hover:text-brand-700 font-medium flex-1 truncate">
                      {r.label}
                    </span>
                    <ArrowRight size={12} className="text-slate-300 group-hover:text-brand-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Activity feed */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <Activity size={14} className="text-brand-600" />
                Recent Activity
              </h2>
              <Link to={`/projects/${projectId}/activity`} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                View all
              </Link>
            </div>
            <ActivityTimeline projectId={projectId} limit={8} />
          </div>
        </div>
      </div>
    </div>
  )
}
