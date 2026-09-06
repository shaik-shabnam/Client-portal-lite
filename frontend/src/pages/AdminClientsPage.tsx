import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, FolderKanban, CheckCircle, Clock,
  AlertCircle, ChevronDown, ChevronRight, ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { getClientsOverview } from '../api/users'
import type { ClientOverviewDto } from '../api/users'
import ProgressBar from '../components/ProgressBar'
import { projectStatusColor, projectStatusLabel } from '../utils/status'
import { formatDate } from '../utils/format'

export default function AdminClientsPage() {
  const [overview, setOverview] = useState<ClientOverviewDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  const load = () => {
    setLoading(true)
    setError('')
    getClientsOverview()
      .then((data) => {
        setOverview(data)
        // Auto-expand all clients so data is immediately visible
        const allExpanded: Record<number, boolean> = {}
        data.forEach((c) => { allExpanded[c.client.id] = true })
        setExpanded(allExpanded)
      })
      .catch((err) => {
        setError(
          err?.response?.status === 403
            ? 'Access denied. Admin role required.'
            : 'Failed to load clients. Make sure the backend is running.',
        )
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggle = (id: number) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  const totalClients = overview.length
  const totalProjects = overview.reduce((s, c) => s + c.totalProjects, 0)
  const totalPending = overview.reduce((s, c) => s + c.pendingDeliverables, 0)
  const totalCompleted = overview.reduce((s, c) => s + Number(c.completedProjects), 0)

  if (loading) {
    return (
      <div className="space-y-4 max-w-6xl">
        <div className="flex items-center gap-2">
          <div className="w-40 h-8 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
        {[...Array(3)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl">
        <div className="card p-8 flex flex-col items-center text-center gap-4">
          <AlertCircle size={36} className="text-red-400" />
          <div>
            <p className="font-semibold text-slate-800">Could not load clients</p>
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
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={22} className="text-brand-600" />
            All Clients
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Every registered client and their project status
          </p>
        </div>
        <button onClick={load} className="btn-secondary text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Clients', value: totalClients, icon: Users, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Total Projects', value: totalProjects, icon: FolderKanban, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Projects Completed', value: totalCompleted, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          {
            label: 'Pending Reviews', value: totalPending,
            icon: AlertCircle,
            color: totalPending > 0 ? 'text-amber-600' : 'text-slate-400',
            bg: totalPending > 0 ? 'bg-amber-50' : 'bg-slate-50',
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Client list */}
      {overview.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-slate-400">
          <Users size={40} className="mb-3 opacity-30" />
          <p className="text-slate-600 font-medium">No clients registered yet</p>
          <p className="text-slate-400 text-sm mt-1">
            Clients appear here after they register at{' '}
            <span className="font-mono bg-slate-100 px-1 rounded">/register</span>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {overview.map(({
            client, projects,
            totalProjects: tp,
            completedProjects,
            inProgressProjects,
            pendingDeliverables,
          }) => {
            const isOpen = !!expanded[client.id]
            const initials = client.fullName
              .split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

            return (
              <div key={client.id} className="card overflow-hidden">
                {/* Client header — click to expand/collapse */}
                <button
                  onClick={() => toggle(client.id)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors text-left"
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0 ring-2 ring-emerald-200">
                    {initials}
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{client.fullName}</p>
                    <p className="text-xs text-slate-400 truncate">{client.email}</p>
                  </div>

                  {/* Stats row */}
                  <div className="hidden sm:flex items-center divide-x divide-slate-200 shrink-0">
                    {[
                      { label: 'Projects', value: tp, color: 'text-slate-800' },
                      { label: 'Completed', value: String(completedProjects), color: 'text-emerald-600' },
                      { label: 'In Progress', value: String(inProgressProjects), color: 'text-blue-600' },
                      ...(pendingDeliverables > 0
                        ? [{ label: 'Pending Review', value: pendingDeliverables, color: 'text-amber-600' }]
                        : []),
                    ].map(({ label, value, color }) => (
                      <div key={label} className="px-4 text-center">
                        <p className={`text-lg font-bold ${color}`}>{value}</p>
                        <p className="text-[10px] text-slate-400">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chevron */}
                  <div className="text-slate-400 ml-2 shrink-0">
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </button>

                {/* Expanded project table */}
                {isOpen && (
                  <div className="border-t border-slate-100">
                    {projects.length === 0 ? (
                      <div className="px-6 py-5 text-sm text-slate-400 flex items-center gap-2">
                        <FolderKanban size={16} className="opacity-40" />
                        No projects assigned to this client yet.
                      </div>
                    ) : (
                      <>
                        {/* Table header */}
                        <div className="grid grid-cols-12 gap-3 px-6 py-2.5 bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          <div className="col-span-4">Project Name</div>
                          <div className="col-span-2">Status</div>
                          <div className="col-span-3">Progress</div>
                          <div className="col-span-2">Due Date</div>
                          <div className="col-span-1 text-right">Open</div>
                        </div>

                        {/* Project rows */}
                        {projects.map((project) => (
                          <div
                            key={project.id}
                            className="grid grid-cols-12 gap-3 px-6 py-3.5 items-center border-b border-slate-50 hover:bg-slate-50 transition-colors last:border-0"
                          >
                            {/* Name + task count */}
                            <div className="col-span-4 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {project.title}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {project.completedTasks}/{project.totalTasks} tasks done
                                {project.pendingDeliverables > 0 && (
                                  <span className="text-amber-500 ml-2">
                                    · {project.pendingDeliverables} awaiting review
                                  </span>
                                )}
                              </p>
                            </div>

                            {/* Status */}
                            <div className="col-span-2">
                              <span className={`badge text-xs ${projectStatusColor[project.status]}`}>
                                {projectStatusLabel[project.status]}
                              </span>
                            </div>

                            {/* Progress */}
                            <div className="col-span-3 flex items-center gap-2">
                              <div className="flex-1">
                                <ProgressBar value={project.progressPercent} size="sm" />
                              </div>
                              <span className="text-xs font-bold text-slate-600 w-9 text-right shrink-0">
                                {project.progressPercent}%
                              </span>
                            </div>

                            {/* Due date */}
                            <div className="col-span-2 text-xs text-slate-500 flex items-center gap-1">
                              {project.dueDate ? (
                                <>
                                  <Clock size={11} className="shrink-0" />
                                  {formatDate(project.dueDate)}
                                </>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </div>

                            {/* Open button */}
                            <div className="col-span-1 flex justify-end">
                              <Link
                                to={`/projects/${project.id}`}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                title="Open project"
                              >
                                <ArrowRight size={15} />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
