import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: string
  trendUp?: boolean
}

export default function StatCard({
  label, value, icon: Icon, iconColor = 'text-brand-600',
  iconBg = 'bg-brand-50', trend, trendUp,
}: Props) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
        <p className="text-sm text-slate-500 mt-1">{label}</p>
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
    </div>
  )
}
