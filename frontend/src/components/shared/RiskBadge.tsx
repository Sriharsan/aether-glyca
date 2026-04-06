import clsx from 'clsx'

interface Props { level: string; score?: number }

export default function RiskBadge({ level, score }: Props) {
  return (
    <span className={clsx('badge', `badge-${level}`)}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
      {score !== undefined && ` · ${score}`}
    </span>
  )
}
