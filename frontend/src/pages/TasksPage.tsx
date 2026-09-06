import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PlusCircle, ArrowRight, GripVertical } from 'lucide-react'
import { getProject, getMilestones, createMilestone } from '../api/projects'
import { getTasksByProject, createTask, updateTaskStatus, deleteTask } from '../api/tasks'
import type { ProjectDto, TaskDto, MilestoneDto, TaskStatus, TaskRequest } from '../types'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import CommentThread from '../components/CommentThread'
import {
  taskStatusLabel, taskStatusColor, taskStatusBorder, priorityColor, priorityLabel,
} from '../utils/status'
import { formatDate } from '../utils/format'

const COLUMNS: TaskStatus[] = ['TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']

const columnStyles: Record<TaskStatus, { header: string; dot: string }> = {
  TO_DO:       { header: 'bg-slate-100 text-slate-600',    dot: 'bg-slate-400' },
  IN_PROGRESS: { header: 'bg-blue-50 text-blue-700',       dot: 'bg-blue-500' },
  IN_REVIEW:   { header: 'bg-violet-50 text-violet-700',   dot: 'bg-violet-500' },
  DONE:        { header: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
}

export default function TasksPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [project, setProject] = useState<ProjectDto | null>(null)
  const [tasks, setTasks] = useState<TaskDto[]>([])
  const [milestones, setMilestones] = useState<MilestoneDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null)
  const [dragging, setDragging] = useState<number | null>(null)

  const load = () =>
    Promise.all([getProject(projectId), getTasksByProject(projectId), getMilestones(projectId)])
      .then(([p, t, m]) => { setProject(p); setTasks(t); setMilestones(m) })
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [projectId])

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t))
    try { await updateTaskStatus(taskId, newStatus) } catch { load() }
  }

  const handleCreate = async (req: TaskRequest) => {
    const t = await createTask(req)
    setTasks((prev) => [...prev, t])
    setShowCreate(false)
  }

  const handleDelete = async (taskId: number) => {
    await deleteTask(taskId)
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    setSelectedTask(null)
  }

  const onDragStart = (taskId: number) => setDragging(taskId)
  const onDrop = (status: TaskStatus) => {
    if (dragging == null) return
    handleStatusChange(dragging, status)
    setDragging(null)
  }

  if (loading) return <div className="card h-96 animate-pulse" />
  if (!project) return <p className="text-slate-500">Project not found.</p>

  return (
    <div className="space-y-5 h-full">
      {/* Breadcrumb + header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-1">
            <Link to="/projects" className="hover:text-brand-600">Projects</Link>
            <ArrowRight size={12} />
            <Link to={`/projects/${projectId}`} className="hover:text-brand-600">{project.title}</Link>
            <ArrowRight size={12} />
            <span className="text-slate-700">Tasks</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Kanban Board</h1>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <PlusCircle size={15} /> Add Task
          </button>
        )}
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col)
          const style = columnStyles[col]
          return (
            <div
              key={col}
              className="flex flex-col min-w-[240px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(col)}
            >
              {/* Column header */}
              <div className={`flex items-center gap-2 px-3 py-2.5 rounded-t-xl ${style.header}`}>
                <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                <span className="text-sm font-semibold">{taskStatusLabel[col]}</span>
                <span className="ml-auto text-xs bg-white/70 px-2 py-0.5 rounded-full font-medium">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div className={`flex-1 rounded-b-xl bg-slate-50 border-x border-b border-slate-200 p-2 space-y-2 min-h-[200px]`}>
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => onDragStart(task.id)}
                    onClick={() => setSelectedTask(task)}
                    className={`bg-white rounded-lg border ${taskStatusBorder[task.status]} p-3 cursor-pointer hover:shadow-md transition-shadow group`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <p className="text-sm font-medium text-slate-800 leading-snug flex-1">{task.title}</p>
                      <GripVertical size={13} className="text-slate-300 group-hover:text-slate-400 shrink-0 mt-0.5" />
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`badge text-[10px] ${priorityColor[task.priority]}`}>
                        {priorityLabel[task.priority]}
                      </span>
                      {task.milestoneTitle && (
                        <span className="badge text-[10px] bg-indigo-50 text-indigo-600">
                          {task.milestoneTitle}
                        </span>
                      )}
                    </div>
                    {task.dueDate && (
                      <p className="text-[10px] text-slate-400 mt-2">Due {formatDate(task.dueDate)}</p>
                    )}
                  </div>
                ))}

                {/* Drop hint when empty */}
                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center h-20 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="text-xs text-slate-300">Drop tasks here</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Modal
          title={selectedTask.title}
          onClose={() => setSelectedTask(null)}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`badge ${taskStatusColor[selectedTask.status]}`}>
                {taskStatusLabel[selectedTask.status]}
              </span>
              <span className={`badge ${priorityColor[selectedTask.priority]}`}>
                {priorityLabel[selectedTask.priority]}
              </span>
              {selectedTask.milestoneTitle && (
                <span className="badge bg-indigo-50 text-indigo-600">{selectedTask.milestoneTitle}</span>
              )}
            </div>

            {selectedTask.description && (
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                {selectedTask.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              {selectedTask.dueDate && (
                <div>
                  <p className="text-xs text-slate-400">Due Date</p>
                  <p className="font-medium text-slate-700">{formatDate(selectedTask.dueDate)}</p>
                </div>
              )}
              {selectedTask.assignee && (
                <div>
                  <p className="text-xs text-slate-400">Assignee</p>
                  <p className="font-medium text-slate-700">{selectedTask.assignee.fullName}</p>
                </div>
              )}
            </div>

            {/* Status change buttons */}
            {isAdmin && (
              <div>
                <p className="text-xs text-slate-500 mb-2 font-medium">Move to</p>
                <div className="flex flex-wrap gap-2">
                  {COLUMNS.filter((c) => c !== selectedTask.status).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        handleStatusChange(selectedTask.id, c)
                        setSelectedTask((prev) => prev ? { ...prev, status: c } : null)
                      }}
                      className={`badge cursor-pointer hover:opacity-80 ${taskStatusColor[c]}`}
                    >
                      {taskStatusLabel[c]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="flex justify-end pt-1">
                <button
                  className="btn-danger text-xs"
                  onClick={() => handleDelete(selectedTask.id)}
                >
                  Delete Task
                </button>
              </div>
            )}

            {/* Comments */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-700 mb-3">Comments</p>
              <CommentThread taskId={selectedTask.id} />
            </div>
          </div>
        </Modal>
      )}

      {/* Create Task Modal */}
      {showCreate && (
        <CreateTaskModal
          milestones={milestones}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}

function CreateTaskModal({
  milestones, onClose, onCreate,
}: {
  milestones: MilestoneDto[]
  onClose: () => void
  onCreate: (req: TaskRequest) => Promise<void>
}) {
  const [form, setForm] = useState<TaskRequest>({
    title: '', description: '', status: 'TO_DO', priority: 'MEDIUM',
    milestoneId: milestones[0]?.id ?? 0,
  })
  const [saving, setSaving] = useState(false)

  const set = (k: keyof TaskRequest, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try { await onCreate(form) } finally { setSaving(false) }
  }

  return (
    <Modal title="Create Task" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Title *</label>
          <input className="input" placeholder="Task title" value={form.title}
            onChange={(e) => set('title', e.target.value)} required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={2} value={form.description}
            onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Milestone *</label>
            <select className="input" value={form.milestoneId}
              onChange={(e) => set('milestoneId', Number(e.target.value))}>
              {milestones.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority}
              onChange={(e) => set('priority', e.target.value)}>
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                <option key={p} value={p}>{priorityLabel[p]}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Due Date</label>
          <input type="date" className="input" value={form.dueDate ?? ''}
            onChange={(e) => set('dueDate', e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
