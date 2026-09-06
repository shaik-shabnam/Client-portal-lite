import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, FolderKanban, Search, Trash2, ExternalLink } from 'lucide-react'
import { getProjects, createProject, deleteProject } from '../api/projects'
import { getClients } from '../api/users'
import type { ProjectDto, UserDto, ProjectRequest } from '../types'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import ProgressBar from '../components/ProgressBar'
import { projectStatusColor, projectStatusLabel } from '../utils/status'
import { formatDate } from '../utils/format'

const STATUS_OPTIONS = ['PLANNING', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED']

export default function ProjectsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [clients, setClients] = useState<UserDto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    Promise.all([
      getProjects(),
      isAdmin ? getClients() : Promise.resolve([]),
    ]).then(([p, c]) => {
      setProjects(p)
      setClients(c)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [isAdmin])

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.client.fullName.toLowerCase().includes(search.toLowerCase()),
  )

  const handleCreate = async (req: ProjectRequest) => {
    const p = await createProject(req)
    setProjects((prev) => [p, ...prev])
    setShowCreate(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project and all its data?')) return
    await deleteProject(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm">{projects.length} total</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <PlusCircle size={16} /> New Project
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Search projects or clients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse h-48" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-slate-400">
          <FolderKanban size={40} className="mb-3 opacity-40" />
          <p className="text-base font-medium text-slate-500">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="card p-5 flex flex-col hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <Link
                    to={`/projects/${p.id}`}
                    className="font-semibold text-slate-800 hover:text-brand-700 truncate block"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isAdmin ? `Client: ${p.client.fullName}` : `Agency: ${p.admin.fullName}`}
                  </p>
                </div>
                <span className={`badge shrink-0 ${projectStatusColor[p.status]}`}>
                  {projectStatusLabel[p.status]}
                </span>
              </div>

              {p.description && (
                <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-1">{p.description}</p>
              )}

              <div className="mt-auto space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span className="font-semibold text-slate-700">{p.progressPercent}%</span>
                  </div>
                  <ProgressBar value={p.progressPercent} />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
                  <span>{p.completedTasks}/{p.totalTasks} tasks</span>
                  {p.dueDate && <span>Due {formatDate(p.dueDate)}</span>}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link to={`/projects/${p.id}`} className="btn-secondary flex-1 justify-center text-xs py-1.5">
                    <ExternalLink size={12} /> Open
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && showCreate && (
        <CreateProjectModal
          clients={clients}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}

function CreateProjectModal({
  clients, onClose, onCreate,
}: {
  clients: UserDto[]
  onClose: () => void
  onCreate: (req: ProjectRequest) => Promise<void>
}) {
  const [form, setForm] = useState<ProjectRequest>({
    title: '', description: '', status: 'PLANNING',
    progressPercent: 0, clientId: clients[0]?.id ?? 0,
    startDate: '', dueDate: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof ProjectRequest, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.clientId) { setError('Title and client are required'); return }
    setSaving(true)
    try {
      await onCreate({ ...form, startDate: form.startDate || undefined, dueDate: form.dueDate || undefined })
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to create project')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Create New Project" onClose={onClose} size="lg">
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <div>
          <label className="label">Project Title *</label>
          <input className="input" placeholder="e.g. E-Commerce Redesign" value={form.title}
            onChange={(e) => set('title', e.target.value)} required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={3} placeholder="Brief project description…"
            value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Assign Client *</label>
            <select className="input" value={form.clientId}
              onChange={(e) => set('clientId', Number(e.target.value))}>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status}
              onChange={(e) => set('status', e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{projectStatusLabel[s as keyof typeof projectStatusLabel]}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input type="date" className="input" value={form.startDate}
              onChange={(e) => set('startDate', e.target.value)} />
          </div>
          <div>
            <label className="label">Due Date</label>
            <input type="date" className="input" value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
