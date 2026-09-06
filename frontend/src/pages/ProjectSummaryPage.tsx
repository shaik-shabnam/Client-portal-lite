import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, Printer, CheckCircle, Clock, FileBox, Activity } from 'lucide-react'
import { getProject, getMilestones, getActivityLogs } from '../api/projects'
import { getDeliverables } from '../api/deliverables'
import type { ProjectDto, MilestoneDto, DeliverableDto, ActivityLogDto } from '../types'
import ProgressBar from '../components/ProgressBar'
import { projectStatusLabel, projectStatusColor, deliverableStatusColor, deliverableStatusLabel } from '../utils/status'
import { formatDate, timeAgo, parsePinnedResources } from '../utils/format'

export default function ProjectSummaryPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const printRef = useRef<HTMLDivElement>(null)

  const [project, setProject] = useState<ProjectDto | null>(null)
  const [milestones, setMilestones] = useState<MilestoneDto[]>([])
  const [deliverables, setDeliverables] = useState<DeliverableDto[]>([])
  const [activity, setActivity] = useState<ActivityLogDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getProject(projectId),
      getMilestones(projectId),
      getDeliverables(projectId),
      getActivityLogs(projectId, 10),
    ]).then(([p, m, d, a]) => {
      setProject(p); setMilestones(m); setDeliverables(d); setActivity(a)
    }).finally(() => setLoading(false))
  }, [projectId])

  const handlePrint = () => window.print()

  if (loading) return <div className="card h-96 animate-pulse" />
  if (!project) return <p className="text-slate-500">Project not found.</p>

  const completedMilestones = milestones.filter((m) => m.isCompleted).length
  const approvedDeliverables = deliverables.filter((d) => d.status === 'APPROVED').length
  const pinned = parsePinnedResources(project.pinnedResources)

  return (
    <div className="max-w-4xl space-y-5">
      {/* Screen-only nav */}
      <div className="print:hidden flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <Link to="/projects" className="hover:text-brand-600">Projects</Link>
          <ArrowRight size={12} />
          <Link to={`/projects/${projectId}`} className="hover:text-brand-600">{project.title}</Link>
          <ArrowRight size={12} />
          <span className="text-slate-700">Summary</span>
        </div>
        <button onClick={handlePrint} className="btn-primary">
          <Printer size={15} /> Print / Export PDF
        </button>
      </div>

      {/* Printable content */}
      <div ref={printRef} className="space-y-6 print:space-y-4">
        {/* Cover */}
        <div className="card p-8 print:shadow-none print:border-0">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{project.title}</h1>
              <p className="text-slate-500 mt-1">{project.description}</p>
            </div>
            <span className={`badge text-sm px-3 py-1 ${projectStatusColor[project.status]}`}>
              {projectStatusLabel[project.status]}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-100">
            {[
              { label: 'Client', value: project.client.fullName },
              { label: 'Agency', value: project.admin.fullName },
              { label: 'Start Date', value: formatDate(project.startDate) },
              { label: 'Due Date', value: formatDate(project.dueDate) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className="font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="card p-6 print:shadow-none print:border">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Project Progress</h2>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl font-black text-brand-600">{project.progressPercent}%</span>
            <div className="flex-1">
              <ProgressBar value={project.progressPercent} size="lg" showLabel={false} />
              <p className="text-sm text-slate-500 mt-1">Overall completion</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Tasks Completed', value: `${project.completedTasks}/${project.totalTasks}`, icon: CheckCircle, color: 'text-emerald-600' },
              { label: 'Milestones Done', value: `${completedMilestones}/${milestones.length}`, icon: CheckCircle, color: 'text-brand-600' },
              { label: 'Files Approved', value: `${approvedDeliverables}/${deliverables.length}`, icon: FileBox, color: 'text-violet-600' },
              { label: 'Pending Reviews', value: project.pendingDeliverables, icon: Clock, color: 'text-amber-600' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="text-center p-3 bg-slate-50 rounded-xl">
                <Icon size={18} className={`${color} mx-auto mb-1`} />
                <p className="text-xl font-bold text-slate-800">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="card p-6 print:shadow-none print:border">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Milestones</h2>
          <div className="space-y-2">
            {milestones.map((m) => (
              <div key={m.id} className={`flex items-center gap-3 p-3 rounded-lg ${m.isCompleted ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                <CheckCircle size={16} className={m.isCompleted ? 'text-emerald-500' : 'text-slate-300'} />
                <span className={`text-sm flex-1 font-medium ${m.isCompleted ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {m.title}
                </span>
                {m.targetDate && (
                  <span className="text-xs text-slate-400">{formatDate(m.targetDate)}</span>
                )}
                <span className={`badge text-xs ${m.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {m.isCompleted ? 'Complete' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverables */}
        <div className="card p-6 print:shadow-none print:border">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Deliverables</h2>
          <div className="divide-y divide-slate-100">
            {deliverables.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{d.title}</p>
                  <p className="text-xs text-slate-400">{d.versionTag} · {d.category}</p>
                </div>
                <span className={`badge text-xs shrink-0 ${deliverableStatusColor[d.status]}`}>
                  {deliverableStatusLabel[d.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6 print:shadow-none print:border">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-brand-600" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {activity.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                <p className="text-slate-600 flex-1">{log.actionDescription}</p>
                <span className="text-xs text-slate-400 shrink-0">{timeAgo(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pinned Resources */}
        {pinned.length > 0 && (
          <div className="card p-6 print:shadow-none print:border">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Resources & Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pinned.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg text-sm text-brand-700 hover:bg-brand-50 transition-colors">
                  <span className="font-medium">{r.label}</span>
                  <span className="text-xs text-slate-400 truncate flex-1">{r.url}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Print footer */}
        <div className="hidden print:block text-center text-xs text-slate-400 pt-4 border-t border-slate-200">
          Generated by ClientPortal Lite · {new Date().toLocaleDateString()} · {project.title}
        </div>
      </div>
    </div>
  )
}
