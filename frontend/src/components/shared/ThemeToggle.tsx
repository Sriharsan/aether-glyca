import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme, Theme } from '../../hooks/useTheme'

const OPTIONS: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: 'light',  icon: <Sun     size={13} />, label: 'Light' },
  { value: 'system', icon: <Monitor size={13} />, label: 'System' },
  { value: 'dark',   icon: <Moon    size={13} />, label: 'Dark' },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-0.5 bg-surface border border-border rounded-lg p-0.5">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          title={opt.label}
          className={`p-1.5 rounded-md transition-colors ${
            theme === opt.value
              ? 'bg-teal/20 text-teal'
              : 'text-muted hover:text-text'
          }`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  )
}
