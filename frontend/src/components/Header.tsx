import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUnreadCount } from '../api/notifications'

export default function Header() {
  const { user, logout } = useAuth()
  const [unread, setUnread] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    getUnreadCount().then(setUnread).catch(() => {})
    const interval = setInterval(() => {
      getUnreadCount().then(setUnread).catch(() => {})
    }, 30_000)
    return () => clearInterval(interval)
  }, [])

  const initials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const isAdmin = user?.role === 'ADMIN'

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Client Portal Lite</span>
        {/* Role badge */}
        <span className={`badge text-xs ${isAdmin ? 'bg-brand-100 text-brand-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {isAdmin ? 'Admin' : 'Client'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </Link>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-slate-800 leading-none">{user?.fullName}</p>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-20 py-1">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <span className={`badge text-xs mt-1 ${isAdmin ? 'bg-brand-100 text-brand-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {isAdmin ? 'Administrator' : 'Client'}
                  </span>
                </div>
                <button
                  onClick={() => { logout(); setShowUserMenu(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
