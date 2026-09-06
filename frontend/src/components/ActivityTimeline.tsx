import { useEffect, useState } from 'react'
import {
  Upload, CheckCircle, MessageSquare, RefreshCw,
  PlusCircle, ArrowRight, Activity,
} from 'lucide-react'
import { getActivityLogs } from '../api/projects'
import type { ActivityLogDto } from '../types'
import { timeAgo } from '../utils/format'

interface Props {
  projectId: number
  limit?: number
}

const actionIcon: Record<string, React.ReactNode> = {
  FILE_UPLOADED:       <Upload size={14} className="text-blue-600" />,
  DELIVERABLE_APPROVED:<CheckCircle size={14} className="text-emerald-600" />,
  REVISION_REQUESTED:  <RefreshCw size={14} className="text-red-500" />,
  COMMENT_ADDED:       <MessageSquare size={14} className="text-violet-600" />,
  TASK_CREATED:        <PlusCircle size={14} className="text-slate-500" />,
  TASK_UPDATED:        <ArrowRight size={14} className="text-slate-500" />,
  TASK_STATUS_CHANGED: <ArrowRight size={14} className="text-blue-500" />,
  PROJECT_CREATED:     <PlusCircle size={14} className="text-brand-600" />,
  PROJECT_UPDATED:     <RefreshCw size={14} className="text-amber-500" />,
  MILESTONE_CREATED:   <PlusCircle size={14} className="text-indigo-500" />,
  MILESTONE_UPDATED:   <CheckCircle size={14} className="text-indigo-500" />,
}

const actionColor: Record<string, string> = {
  FILE_UPLOADED:        'bg-blue-100',
  DELIVERABLE_APPROVED: 'bg-emerald-100',
  REVISION_REQUESTED:   'bg-red-100',
  COMMENT_ADDED:        'bg-violet-100',
  TASK_CREATED:         'bg-slate-100',
  TASK_UPDATED:         'bg-slate-100',
  TASK_STATUS_CHANGED:  'bg-blue-100',
  PROJECT_CREATED:      'bg-brand-100',
  PROJECT_UPDATED:      'bg-amber-100',
  MILESTONE_CREATED:    'bg-indigo-100',
  MILESTONE_UPDATED:    'bg-indigo-100',
}

export default function ActivityTimeline({ projectId, limit = 20 }: Props) {
  const [logs, setLogs] = useState<ActivityLogDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActivityLogs(projectId, limit)
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [projectId, limit])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-7 h-7 rounded-full bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-3 bg-slate-100 rounded w-3/4" />
              <div className="h-2.5 bg-slate-100 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <Activity size={32} className="mb-2 opacity-40" />
        <p className="text-sm">No activity yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {logs.map((log, idx) => {
        const type = log.actionType ?? 'DEFAULT'
        const icon = actionIcon[type] ?? <Activity size={14} className="text-slate-400" />
        const color = actionColor[type] ?? 'bg-slate-100'
        const isLast = idx === logs.length - 1

        return (
          <div key={log.id} className="flex gap-3 group">
            {/* Timeline line + icon */}
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center shrink-0 ring-2 ring-white`}>
                {icon}
              </div>
              {!isLast && <div className="w-px flex-1 bg-slate-200 my-1" />}
            </div>

            {/* Content */}
            <div className={`pb-4 flex-1 min-w-0 ${isLast ? '' : ''}`}>
              <p className="text-sm text-slate-700 leading-snug">{log.actionDescription}</p>
              <div className="flex items-center gap-2 mt-1">
                {log.user && (
                  <span className="text-xs text-slate-400">{log.user.fullName}</span>
                )}
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-400">{timeAgo(log.createdAt)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
