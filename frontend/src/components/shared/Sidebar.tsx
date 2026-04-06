import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import ThemeToggle from './ThemeToggle'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Users, Brain, LayoutDashboard,
  UtensilsCrossed, FileText, LogOut, Zap, X, Dumbbell, Camera,
  ChevronRight, MapPin,
} from 'lucide-react'

interface NavItem { label: string; to: string; icon: React.ReactNode }

const PATIENT_NAV: NavItem[] = [
  { label: 'Dashboard',    to: '/patient',          icon: <LayoutDashboard size={17}/> },
  { label: 'Glucose',      to: '/patient/glucose',  icon: <Activity        size={17}/> },
  { label: 'Diet Log',     to: '/patient/diet',     icon: <UtensilsCrossed size={17}/> },
  { label: 'Food Scanner', to: '/patient/scanner',  icon: <Camera          size={17}/> },
  { label: 'Exercise',     to: '/patient/exercise', icon: <Dumbbell        size={17}/> },
  { label: 'AI Advisor',   to: '/patient/advisor',  icon: <Brain           size={17}/> },
]

const CLINICIAN_NAV: NavItem[] = [
  { label: 'Population', to: '/clinician',           icon: <Users           size={17}/> },
  { label: 'Patients',   to: '/clinician/patients',  icon: <LayoutDashboard size={17}/> },
  { label: 'AI Triage',  to: '/clinician/triage',    icon: <Zap             size={17}/> },
  { label: 'Reports',    to: '/clinician/reports',   icon: <FileText        size={17}/> },
]

const AGENT_NAV: NavItem[] = [
  { label: 'Agent Monitor', to: '/agents',        icon: <Brain    size={17}/> },
  { label: 'Triage Run',    to: '/agents/triage', icon: <Zap      size={17}/> },
  { label: 'Logs',          to: '/agents/logs',   icon: <FileText size={17}/> },
]

const END_ROUTES = ['/patient', '/clinician', '/agents']

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  patient:   { label: 'Patient',    color: 'text-teal'    },
  clinician: { label: 'Clinician',  color: 'text-blue-l'  },
  admin:     { label: 'Admin',      color: 'text-gold'    },
}

const sidebarVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const navItemVariants = {
  hidden:  { x: -8, opacity: 0 },
  visible: (i: number) => ({ x: 0, opacity: 1, transition: { delay: i * 0.04, duration: 0.2, ease: 'easeOut' as const } }),
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const nav = user?.role === 'clinician' ? CLINICIAN_NAV
            : user?.role === 'admin'     ? AGENT_NAV
            : PATIENT_NAV

  const roleInfo = ROLE_LABELS[user?.role ?? 'patient']

  return (
    <aside className={clsx(
      'fixed inset-y-0 left-0 z-30 w-64 flex flex-col',
      'transition-transform duration-300 ease-out',
      open ? 'translate-x-0' : '-translate-x-full',
      'md:static md:translate-x-0 md:min-h-screen',
    )}
    style={{
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>

      {/* ── Logo ── */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark with gradient */}
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(var(--teal-rgb),0.2) 0%, rgba(var(--blue-rgb),0.15) 100%)', border: '1px solid rgba(var(--teal-rgb),0.25)' }}>
              <Activity size={18} className="text-teal" />
              <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)' }}/>
            </div>
            <div>
              <div className="font-bold text-text text-sm leading-none tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                AETHER
              </div>
              <div className="text-xs font-bold tracking-widest" style={{ color: 'var(--teal)', letterSpacing: '0.12em' }}>
                GLYCA
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="md:hidden p-1.5 rounded-lg transition-colors hover:bg-card"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Close menu">
            <X size={17}/>
          </button>
        </div>
      </div>

      {/* ── Theme toggle ── */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Appearance</span>
        <ThemeToggle />
      </div>

      {/* ── User chip ── */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(var(--teal-rgb), 0.06)', border: '1px solid rgba(var(--teal-rgb), 0.12)' }}>
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-d) 100%)', color: '#fff' }}>
            {user?.fullName?.[0] ?? 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-text text-xs font-semibold truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {user?.fullName}
            </div>
            <div className={`text-xs font-medium capitalize ${roleInfo.color}`}>{roleInfo.label}</div>
          </div>
        </div>
      </div>

      {/* ── Nav links ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map((item, i) => (
          <motion.div key={item.to} custom={i} initial="hidden" animate="visible" variants={navItemVariants}>
            <NavLink
              to={item.to}
              end={END_ROUTES.includes(item.to)}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'nav-active'
                    : 'hover:bg-card',
                )
              }
              style={({ isActive }) => isActive ? {} : { color: 'var(--color-text-muted)' }}
            >
              {({ isActive }) => (
                <>
                  <span className={clsx('transition-colors', isActive ? 'text-teal' : 'group-hover:text-text')}>
                    {item.icon}
                  </span>
                  <span className={clsx('flex-1 transition-colors', isActive ? '' : 'group-hover:text-text')}>
                    {item.label}
                  </span>
                  {isActive && (
                    <ChevronRight size={13} className="text-teal opacity-60"/>
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* ── Bottom section ── */}
      <div className="px-3 pb-4 pt-3 space-y-0.5" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest px-3 pb-2"
          style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
          Demo Views
        </p>
        {[
          { label: 'Patient View',   path: '/patient'   },
          { label: 'Clinician View', path: '/clinician' },
          { label: 'Agent Monitor',  path: '/agents'    },
        ].map(s => (
          <button key={s.path}
            onClick={() => { navigate(s.path); onClose() }}
            className="w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all duration-150 hover:bg-card"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--teal)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
            → {s.label}
          </button>
        ))}
        <button
          className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition-all duration-150 hover:bg-card group mt-1"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--teal)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          onClick={() => {
            if (!navigator.geolocation) {
              window.open('https://www.google.com/maps/search/diabetes+clinic+near+Coimbatore', '_blank')
              return
            }
            navigator.geolocation.getCurrentPosition(
              pos => {
                const { latitude, longitude } = pos.coords
                window.open(`https://www.google.com/maps/search/diabetes+clinic/@${latitude},${longitude},14z`, '_blank')
              },
              () => {
                window.open('https://www.google.com/maps/search/diabetes+clinic+near+Coimbatore', '_blank')
              }
            )
          }}
        >
          <MapPin size={14}/> Find Nearest Clinic
        </button>
        <button onClick={logout}
          className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition-all duration-150 hover:bg-card group mt-1"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
          <LogOut size={14}/> Sign out
        </button>
      </div>
    </aside>
  )
}
