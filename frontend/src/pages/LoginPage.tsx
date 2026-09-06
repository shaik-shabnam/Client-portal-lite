import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Eye, EyeOff } from 'lucide-react'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'

const DEMO_ACCOUNTS = [
  { label: 'Admin Account', email: 'admin@clientportal.com', password: 'admin123', role: 'ADMIN' },
  { label: 'Client Account', email: 'client@acmecorp.com', password: 'client123', role: 'CLIENT' },
]

export default function LoginPage() {
  const { login: authLogin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login({ email, password })
      authLogin(user)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email)
    setPassword(acc.password)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Zap size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">ClientPortal</h1>
            <p className="text-slate-400 text-sm">Lite — Project Workspace</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-6">Sign in to access your portal</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-base"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-slate-500 mt-4">
            New to ClientPortal?{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">
              Create an account
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center mb-3 font-medium uppercase tracking-wide">
              Demo Accounts — click to fill
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="flex flex-col items-start px-3 py-2.5 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-colors text-left"
                >
                  <span className={`badge mb-1 ${acc.role === 'ADMIN' ? 'bg-brand-100 text-brand-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {acc.role}
                  </span>
                  <span className="text-xs text-slate-600 font-medium truncate w-full">{acc.label}</span>
                  <span className="text-[10px] text-slate-400 truncate w-full">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
