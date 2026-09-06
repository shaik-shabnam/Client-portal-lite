import { useEffect, useState } from 'react'
import { Send, Trash2, MessageSquare } from 'lucide-react'
import type { CommentDto } from '../types'
import { getTaskComments, getDeliverableComments, addTaskComment, addDeliverableComment, deleteComment } from '../api/comments'
import { useAuth } from '../context/AuthContext'
import { timeAgo } from '../utils/format'

interface Props {
  taskId?: number
  deliverableId?: number
}

export default function CommentThread({ taskId, deliverableId }: Props) {
  const { user } = useAuth()
  const [comments, setComments] = useState<CommentDto[]>([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    if (taskId) getTaskComments(taskId).then(setComments).catch(() => {})
    else if (deliverableId) getDeliverableComments(deliverableId).then(setComments).catch(() => {})
  }

  useEffect(() => { load() }, [taskId, deliverableId])

  const submit = async () => {
    if (!message.trim() || submitting) return
    setSubmitting(true)
    try {
      let comment: CommentDto
      if (taskId) comment = await addTaskComment(taskId, message.trim())
      else if (deliverableId) comment = await addDeliverableComment(deliverableId, message.trim())
      else return
      setComments((prev) => [...prev, comment])
      setMessage('')
    } catch {
      // error handled silently
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (id: number) => {
    try {
      await deleteComment(id)
      setComments((prev) => prev.filter((c) => c.id !== id))
    } catch {}
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-slate-400">
            <MessageSquare size={28} className="mb-2 opacity-40" />
            <p className="text-sm">No comments yet. Start the conversation.</p>
          </div>
        ) : (
          comments.map((c) => {
            const isOwn = c.user.id === user?.userId
            const initials = c.user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)
            return (
              <div key={c.id} className="flex gap-3 group">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-800">{c.user.fullName}</span>
                    <span className="text-xs text-slate-400">{c.user.role}</span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                    {isOwn && (
                      <button
                        onClick={() => remove(c.id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                        aria-label="Delete comment"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg px-3 py-2">
                    {c.message}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-2">
        <input
          className="input flex-1"
          placeholder="Write a comment…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
        />
        <button
          onClick={submit}
          disabled={!message.trim() || submitting}
          className="btn-primary px-3"
          aria-label="Send comment"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
