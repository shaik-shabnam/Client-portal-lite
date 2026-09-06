import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderKanban, Search, ArrowRight, AlertCircle, RefreshCw,
  Clock, User,
} from 'lucide-react'
import { getAllProjectsAdmin } from '../api/users'
import type { ProjectDto } from '../types'
import ProgressBar from '../components/ProgressBar'
import { projectStatusColor, projectStatusLabel } from '../utils/status'
import { formatDate } from '../utils/format'

const STATUS_FILTERS = ['ALL', 'PLANNING', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED'] as const

export default function AdminAllProjectsPage() {
  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const load = () => {
    setLoading(true)
    setError('')
    getAllProjectsAdmin()
      .then(setProjects)
      .catch((err) => {
        setError(
          err?.response?.status === 403
            ? 'Access denied. Admin role required.'
            : 'Failed to load projects. Make sure the backend is running.',
        )
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.client.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.admin.fullName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  // Stats
  const total = projects.length
  const byStatus = (s: string) => projects.filter((p) => p.status === s).length

  if (loading) {
    return (
      <div className="space-y-4 max-w-7xl">
        <div className="w-48 h-8 bg-slate-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}
        </div>
        {[...Array(5)].map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl">
        <div className="card p-8 flex flex-col items-center text-center gap-4">
          <AlertCircle size={36} className="text-red-400" />
          <div>
            <p className="font-semibold text-slate-800">Could not load projects</p>
            <p className="text-sm text-slate-500 mt-1">{error}</p>
          </div>
          <button onClick={load} className="btn-primary">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban size={22} className="text-brand-600" />
            All Projects
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Every project across all clients — {total} total
          </p>
        </div>
        <button onClick={load} className="btn-secondary text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Quick stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: total, color: 'text-slate-800', bg: 'bg-slate-50 border-slate-200' },
          { label: 'In Progress', value: byStatus('IN_PROGRESS'), color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Under Review', value: byStatus('UNDER_REVIEW'), color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Completed', value: byStatus('COMPLETED'), color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`card p-4 border ${bg} text-center`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by project, client, or admin…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                statusFilter === s
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
              }`}
            >
              {s === 'ALL' ? 'All' : projectStatusLabel[s as keyof typeof projectStatusLabel]}
              <span className="ml-1.5 opacity-60">
                {s === 'ALL' ? projects.length : projects.filter((p) => p.status === s).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Projects table */}
      {filtered.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-slate-400">
          <FolderKanban size={40} className="mb-3 opacity-30" />
          <p className="text-slate-600 font-medium">
            {projects.length === 0 ? 'No projects yet' : 'No projects match your filter'}
          </p>
          {projects.length === 0 && (
            <p className="text-slate-400 text-sm mt-1">
              Create projects from the{' '}
              <Link to="/projects" className="text-brand-600 hover:underline">Projects</Link> page
            </p>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <div className="col-span-3">Project</div>
            <div className="col-span-2">Client</div>
            <div className="col-span-2">Admin / Agency</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Progress</div>
            <div className="col-span-1 text-right">Open</div>
          </div>

          {/* Project rows */}
          <div className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-slate-50 transition-colors"
              >
                {/* Project name */}
                <div className="col-span-3 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{p.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {p.completedTasks}/{p.totalTasks} tasks
                    {p.dueDate && (
                      <span className="ml-2 flex items-center gap-0.5 inline-flex">
                        <Clock size={9} /> {formatDate(p.dueDate)}
                      </span>
                    )}
                  </p>
                </div>

                {/* Client */}
                <div className="col-span-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {p.client.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{p.client.fullName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{p.client.email}</p>
                    </div>
                  </div>
                </div>

                {/* Admin */}
                <div className="col-span-2 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <User size={12} className="text-slate-400 shrink-0" />
                    <p className="text-xs text-slate-600 truncate">{p.admin.fullName}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span className={`badge text-xs ${projectStatusColor[p.status]}`}>
                    {projectStatusLabel[p.status]}
                  </span>
                  {p.pendingDeliverables > 0 && (
                    <p className="text-[10px] text-amber-600 mt-1">
                      {p.pendingDeliverables} pending review
                    </p>
                  )}
                </div>

                {/* Progress */}
                <div className="col-span-2 flex items-center gap-2">
                  <div className="flex-1">
                    <ProgressBar value={p.progressPercent} size="sm" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 w-8 text-right shrink-0">
                    {p.progressPercent}%
                  </span>
                </div>

                {/* Open */}
                <div className="col-span-1 flex justify-end">
                  <Link
                    to={`/projects/${p.id}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    title="Open project"
                  >
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
