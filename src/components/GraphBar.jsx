export default function GraphBar({ value = 0, max = 100 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="bar" aria-valuenow={value} aria-valuemax={max} role="progressbar">
      <div className="fill" style={{ width: pct + '%' }} />
    </div>
  )
}
