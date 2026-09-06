import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck, BellOff } from 'lucide-react'
import { getNotifications, markAllRead, markRead } from '../api/notifications'
import type { NotificationDto } from '../types'
import { timeAgo } from '../utils/format'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
  const [loading, setLoading] = useState(true)

  const load = () =>
    getNotifications()
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleMarkAllRead = async () => {
    await markAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const handleMarkRead = async (n: NotificationDto) => {
    if (n.isRead) return
    await markRead(n.id)
    setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, isRead: true } : x))
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell size={22} className="text-brand-600" />
            Notifications
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary text-sm">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card h-16 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-slate-400">
          <BellOff size={36} className="mb-3 opacity-30" />
          <p className="text-slate-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n)}
              className={`card p-4 cursor-pointer transition-all hover:shadow-card-hover flex items-start gap-3 ${
                !n.isRead ? 'border-brand-200 bg-brand-50/30' : ''
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                n.isRead ? 'bg-slate-200' : 'bg-brand-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${n.isRead ? 'text-slate-600' : 'text-slate-900'}`}>
                    {n.title}
                  </p>
                  <span className="text-xs text-slate-400 shrink-0">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                {n.projectId && (
                  <Link
                    to={`/projects/${n.projectId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-brand-600 hover:text-brand-700 mt-1 inline-block"
                  >
                    View project →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
