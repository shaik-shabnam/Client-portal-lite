import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, Activity } from 'lucide-react'
import { getProject } from '../api/projects'
import type { ProjectDto } from '../types'
import ActivityTimeline from '../components/ActivityTimeline'

export default function ActivityPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const [project, setProject] = useState<ProjectDto | null>(null)

  useEffect(() => {
    getProject(projectId).then(setProject).catch(() => {})
  }, [projectId])

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-1">
          <Link to="/projects" className="hover:text-brand-600">Projects</Link>
          <ArrowRight size={12} />
          <Link to={`/projects/${projectId}`} className="hover:text-brand-600">{project?.title}</Link>
          <ArrowRight size={12} />
          <span className="text-slate-700">Activity</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Activity size={20} className="text-brand-600" />
          Activity Timeline
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Full history of project events and actions</p>
      </div>

      <div className="card p-6">
        <ActivityTimeline projectId={projectId} limit={100} />
      </div>
    </div>
  )
}
