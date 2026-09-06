interface Props {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: string
  showLabel?: boolean
}

export default function ProgressBar({
  value, max = 100, size = 'md', color = 'bg-brand-600', showLabel = false,
}: Props) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 bg-slate-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-semibold text-slate-700 w-10 text-right shrink-0">
          {pct}%
        </span>
      )}
    </div>
  )
}
