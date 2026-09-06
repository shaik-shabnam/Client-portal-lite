import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Eye, EyeOff, UserPlus } from 'lucide-react'
import { register } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { login: authLogin } = useAuth()
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', role: 'CLIENT',
  })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const user = await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
      })
      authLogin(user)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
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
            <p className="text-slate-400 text-sm">Lite — Create your account</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Create account</h2>
          <p className="text-slate-500 text-sm mb-6">Join the portal as an admin or client</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                className="input"
                placeholder="John Smith"
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Email Address *</label>
              <input
                type="email"
                className="input"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
              />
            </div>

            {/* Role selector */}
            <div>
              <label className="label">I am joining as *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => set('role', 'CLIENT')}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    form.role === 'CLIENT'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">👤</span>
                  <span className="text-sm font-semibold">Client</span>
                  <span className="text-[10px] text-center opacity-70">View my projects & approve files</span>
                </button>
                <button
                  type="button"
                  onClick={() => set('role', 'ADMIN')}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    form.role === 'ADMIN'
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">🏢</span>
                  <span className="text-sm font-semibold">Admin / Agency</span>
                  <span className="text-[10px] text-center opacity-70">Manage projects & clients</span>
                </button>
              </div>
            </div>

            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm Password *</label>
              <input
                type="password"
                className="input"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={(e) => set('confirmPassword', e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-base"
            >
              {loading ? 'Creating account…' : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
