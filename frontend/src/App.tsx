import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Menu, Activity, Wifi, WifiOff } from 'lucide-react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ThemeProvider } from './hooks/useTheme'
import Sidebar from './components/shared/Sidebar'
import SplashScreen from './components/SplashScreen'
import Login from './pages/Login'
import PatientDashboard from './components/patient/PatientDashboard'
import AIAdvisor from './components/patient/AIAdvisor'
import GlucosePage from './pages/GlucosePage'
import DietLogPage from './pages/DietLogPage'
import ExercisePage from './pages/ExercisePage'
import FoodScannerPage from './pages/FoodScannerPage'
import ClinicianDashboard from './components/clinician/ClinicianDashboard'
import PatientsPage from './pages/clinician/PatientsPage'
import AITriagePage from './pages/clinician/AITriagePage'
import ReportsPage from './pages/clinician/ReportsPage'
import AgentMonitor from './components/agent/AgentMonitor'
import TriageRunPage from './pages/agents/TriageRunPage'
import LogsPage from './pages/agents/LogsPage'

function useAccentClass() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/clinician')) return 'accent-clinician'
  if (pathname.startsWith('/agents'))    return 'accent-agents'
  return 'accent-patient'
}

function OnlineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [visible,  setVisible]  = useState(false)

  useEffect(() => {
    const show = () => { setIsOnline(true);  setVisible(true); setTimeout(() => setVisible(false), 3000) }
    const hide = () => { setIsOnline(false); setVisible(true) }
    window.addEventListener('online',  show)
    window.addEventListener('offline', hide)
    return () => { window.removeEventListener('online', show); window.removeEventListener('offline', hide) }
  }, [])

  if (!visible && isOnline) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold shadow-lg transition-all duration-300"
      style={{
        background: isOnline ? 'rgba(var(--success-rgb),0.15)' : 'rgba(var(--danger-rgb),0.15)',
        border: `1px solid ${isOnline ? 'rgba(var(--success-rgb),0.3)' : 'rgba(var(--danger-rgb),0.3)'}`,
        color: isOnline ? 'var(--success)' : 'var(--danger)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {isOnline ? <Wifi size={13}/> : <WifiOff size={13}/>}
      {isOnline ? 'Back Online' : 'No Internet Connection'}
    </div>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const accent = useAccentClass()

  return (
    <div className="flex min-h-screen">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar — accent border matches current section */}
        <header className={`md:hidden flex items-center gap-3 px-4 py-3 bg-surface border-b border-border sticky top-0 z-10 ${accent}`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-lg text-muted hover:text-text hover:bg-card transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-teal/20 flex items-center justify-center">
              <Activity size={12} className="text-teal" />
            </div>
            <span className="font-bold text-text text-sm">
              AETHER<span className="text-teal">-Glyca</span>
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <OnlineIndicator/>
    </div>
  )
}

function Protected({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" replace/>
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={
        user.role === 'patient' ? '/patient' : user.role === 'clinician' ? '/clinician' : '/agents'
      }/> : <Login/>}/>

      {/* Patient routes */}
      <Route path="/patient"          element={<Protected><Layout><PatientDashboard/></Layout></Protected>}/>
      <Route path="/patient/advisor"  element={<Protected><Layout><AIAdvisor/></Layout></Protected>}/>
      <Route path="/patient/glucose"  element={<Protected><Layout><GlucosePage/></Layout></Protected>}/>
      <Route path="/patient/diet"     element={<Protected><Layout><DietLogPage/></Layout></Protected>}/>
      <Route path="/patient/scanner"  element={<Protected><Layout><FoodScannerPage/></Layout></Protected>}/>
      <Route path="/patient/exercise" element={<Protected><Layout><ExercisePage/></Layout></Protected>}/>

      {/* Clinician routes */}
      <Route path="/clinician"          element={<Protected><Layout><ClinicianDashboard/></Layout></Protected>}/>
      <Route path="/clinician/patients" element={<Protected><Layout><PatientsPage/></Layout></Protected>}/>
      <Route path="/clinician/triage"   element={<Protected><Layout><AITriagePage/></Layout></Protected>}/>
      <Route path="/clinician/reports"  element={<Protected><Layout><ReportsPage/></Layout></Protected>}/>

      {/* Agent routes */}
      <Route path="/agents"        element={<Protected><Layout><AgentMonitor/></Layout></Protected>}/>
      <Route path="/agents/triage" element={<Protected><Layout><TriageRunPage/></Layout></Protected>}/>
      <Route path="/agents/logs"   element={<Protected><Layout><LogsPage/></Layout></Protected>}/>

      <Route path="*" element={<Navigate to="/login"/>}/>
    </Routes>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false
    const shown = sessionStorage.getItem('aether_splash_shown')
    if (shown) return false
    sessionStorage.setItem('aether_splash_shown', 'true')
    return true
  })

  return (
    <>
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes/>
        </AuthProvider>
      </ThemeProvider>
    </>
  )
}
