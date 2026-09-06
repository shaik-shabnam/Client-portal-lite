import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Bell, Zap, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  return (
    <aside className="w-60 bg-slate-900 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-none">ClientPortal</p>
            <p className="text-slate-500 text-[10px] mt-0.5">Lite</p>
          </div>
        </div>
      </div>

      {/* Role indicator */}
      <div className="px-4 py-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
          isAdmin
            ? 'bg-brand-900/50 text-brand-300 border border-brand-800'
            : 'bg-emerald-900/50 text-emerald-300 border border-emerald-800'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-brand-400' : 'bg-emerald-400'}`} />
          {isAdmin ? 'Agency / Admin' : 'Client View'}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-3 py-2">
          Navigation
        </p>

        <NavLink to="/" end className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}>
          <LayoutDashboard size={17} />
          Dashboard
        </NavLink>

        <NavLink to="/projects" className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}>
          <FolderKanban size={17} />
          {isAdmin ? 'My Projects' : 'My Projects'}
        </NavLink>

        {/* Admin-only nav */}
        {isAdmin && (
          <>
            <NavLink to="/all-projects" className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}>
              <FolderKanban size={17} />
              All Projects
            </NavLink>

            <NavLink to="/clients" className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}>
              <Users size={17} />
              All Clients
            </NavLink>
          </>
        )}

        <NavLink to="/notifications" className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}>
          <Bell size={17} />
          Notifications
        </NavLink>
      </nav>

      {/* User info footer */}
      <div className="px-4 py-4 border-t border-slate-800">
        <p className="text-slate-500 text-xs truncate">{user?.email}</p>
        <p className="text-slate-600 text-[10px] mt-0.5">v1.0.0 — MVP</p>
      </div>
    </aside>
  )
}
