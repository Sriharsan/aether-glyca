import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Eye, EyeOff, CheckCircle, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

type Mode = 'signin' | 'signup'
type Role = 'patient' | 'clinician' | 'admin'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  // ── Sign-in state ──────────────────────────────────────────────────────────
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [signinError, setSigninError] = useState('')
  const [signinLoading, setSigninLoading] = useState(false)

  // ── Sign-up state ──────────────────────────────────────────────────────────
  const [signupData, setSignupData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', role: 'patient',
  })
  const [signupErrors,  setSignupErrors]  = useState<Record<string, string>>({})
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [showSignupPw,  setShowSignupPw]  = useState(false)
  const [showConfirm,   setShowConfirm]   = useState(false)
  const [consent,       setConsent]       = useState(false)

  const redirectFor = (r: string) =>
    r === 'patient' ? '/patient' : r === 'clinician' ? '/clinician' : '/agents'

  const quickLogin = (r: Role, name: string) => {
    login({ token: `demo-${r}-token`, role: r, userId: `demo-${r}`, fullName: name })
    navigate(redirectFor(r))
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  function validateSignup() {
    const errors: Record<string, string> = {}
    if (!signupData.fullName.trim())                                errors.fullName        = 'Full name is required'
    if (!signupData.email.includes('@'))                            errors.email           = 'Valid email required'
    if (signupData.password.length < 8)                             errors.password        = 'Password must be at least 8 characters'
    if (signupData.password !== signupData.confirmPassword)         errors.confirmPassword = 'Passwords do not match'
    return errors
  }

  // ── Sign Up ────────────────────────────────────────────────────────────────
  async function handleSignup() {
    const errors = validateSignup()
    if (Object.keys(errors).length > 0) { setSignupErrors(errors); return }
    setSignupErrors({})

    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        signal:  AbortSignal.timeout(3000),
        body: JSON.stringify({
          email:     signupData.email,
          password:  signupData.password,
          full_name: signupData.fullName,
          role:      signupData.role,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        login({ token: data.access_token, role: data.role, userId: data.user_id, fullName: data.full_name })
        navigate(data.role === 'patient' ? '/patient' : data.role === 'clinician' ? '/clinician' : '/agents')
        return
      }
    } catch { /* backend offline — fall through to localStorage */ }

    // Offline fallback — save to localStorage
    const users = JSON.parse(localStorage.getItem('aether_users') || '[]')
    users.push({ ...signupData, id: Date.now().toString() })
    localStorage.setItem('aether_users', JSON.stringify(users))

    setSignupSuccess(true)
    setTimeout(() => {
      setSignupSuccess(false)
      setMode('signin')
      setEmail(signupData.email)
      setPassword('')
      setSignupData({ fullName: '', email: '', password: '', confirmPassword: '', role: 'patient' })
    }, 2000)
  }

  // ── Sign In ────────────────────────────────────────────────────────────────
  const handleSignIn = async () => {
    setSigninError('')
    if (!email)    { setSigninError('Email is required.');    return }
    if (!password) { setSigninError('Password is required.'); return }

    // Demo accounts
    if (email === 'patient@demo.com')  { quickLogin('patient',   'Demo Patient'); return }
    if (email === 'doctor@demo.com')   { quickLogin('clinician', 'Dr. Demo');     return }
    if (email === 'admin@demo.com')    { quickLogin('admin',     'Admin');        return }

    // localStorage accounts (aether_users)
    const localUsers = JSON.parse(localStorage.getItem('aether_users') || '[]')
    const localUser  = localUsers.find((u: any) => u.email === email && u.password === password)
    if (localUser) {
      login({ token: 'local-' + localUser.id, role: localUser.role, userId: localUser.id, fullName: localUser.fullName })
      navigate(localUser.role === 'patient' ? '/patient' : localUser.role === 'clinician' ? '/clinician' : '/agents')
      return
    }

    // Backend
    setSigninLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        const d = await res.json()
        login({ token: d.access_token, role: d.role, userId: d.user_id, fullName: d.full_name })
        navigate(redirectFor(d.role)); return
      }
      const d = await res.json().catch(() => ({}))
      setSigninError(d.detail ?? 'Invalid credentials.')
    } catch {
      setSigninError('Cannot reach server. Use demo credentials or a registered local account.')
    } finally { setSigninLoading(false) }
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    setSigninError('')
    setSignupErrors({})
    setSignupSuccess(false)
  }

  const sd = signupData
  const se = signupErrors

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'var(--color-bg)' }}>

      {/* Background decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--teal) 0%, transparent 70%)' }}/>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, var(--blue-l) 0%, transparent 70%)' }}/>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md relative z-10"
      >

        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 relative"
            style={{ background: 'linear-gradient(135deg, rgba(var(--teal-rgb),0.2) 0%, rgba(var(--blue-rgb),0.15) 100%)', border: '1px solid rgba(var(--teal-rgb),0.25)', boxShadow: 'var(--shadow-glow)' }}
          >
            <Activity size={30} style={{ color: 'var(--teal)' }} />
            <div className="absolute inset-0 rounded-2xl opacity-40"
              style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 60%)' }}/>
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}>
            AETHER<span style={{ color: 'var(--teal)' }}>-Glyca</span>
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Autonomous Diabetes Care Platform
          </p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 mb-5 rounded-2xl gap-1"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          {(['signin', 'signup'] as Mode[]).map(m => (
            <button key={m} onClick={() => switchMode(m)}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 relative"
              style={{
                background: mode === m ? 'linear-gradient(135deg, var(--teal) 0%, var(--teal-d) 100%)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--color-text-muted)',
                boxShadow: mode === m ? '0 4px 14px rgba(var(--teal-rgb), 0.3)' : 'none',
              }}>
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Success banner */}
        <AnimatePresence>
          {signupSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-4 text-sm font-medium"
              style={{ background: 'rgba(var(--success-rgb),0.1)', border: '1px solid rgba(var(--success-rgb),0.2)', color: 'var(--success)' }}
            >
              <CheckCircle size={16}/> Account created! Switching to sign in…
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SIGN IN FORM ────────────────────────────────────────────────── */}
        {mode === 'signin' && (
          <motion.div
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="card space-y-4"
          >
            <div>
              <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">Email</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignIn()} />
            </div>

            <div>
              <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">Password</label>
              <div className="relative">
                <input className="input pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSignIn()} />
                <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text">
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {signinError && <p className="text-danger text-xs">{signinError}</p>}

            <button className="btn-primary w-full py-2.5 text-base"
              onClick={handleSignIn} disabled={signinLoading}>
              {signinLoading ? 'Signing in…' : 'Sign In'}
            </button>

            <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Don't have an account?{' '}
              <button onClick={() => switchMode('signup')} className="font-semibold hover:underline" style={{ color: 'var(--teal)' }}>Create one</button>
            </p>
          </motion.div>
        )}

        {/* ── SIGN UP FORM ────────────────────────────────────────────────── */}
        {mode === 'signup' && (
          <motion.div
            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="card space-y-4"
          >

            {/* Full Name */}
            <div>
              <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">Full Name</label>
              <input className="input" type="text" placeholder="e.g. Priya Subramaniam"
                value={sd.fullName}
                onChange={e => setSignupData(p => ({ ...p, fullName: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSignup()} />
              {se.fullName && <p className="text-danger text-xs mt-1">{se.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">Email</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={sd.email}
                onChange={e => setSignupData(p => ({ ...p, email: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSignup()} />
              {se.email && <p className="text-danger text-xs mt-1">{se.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">Password</label>
              <div className="relative">
                <input className="input pr-10" type={showSignupPw ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={sd.password}
                  onChange={e => setSignupData(p => ({ ...p, password: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSignup()} />
                <button type="button" tabIndex={-1} onClick={() => setShowSignupPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text">
                  {showSignupPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {se.password && <p className="text-danger text-xs mt-1">{se.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">Confirm Password</label>
              <div className="relative">
                <input className="input pr-10" type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={sd.confirmPassword}
                  onChange={e => setSignupData(p => ({ ...p, confirmPassword: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSignup()} />
                <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text">
                  {showConfirm ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {se.confirmPassword && <p className="text-danger text-xs mt-1">{se.confirmPassword}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">Role</label>
              <select className="input" value={sd.role}
                onChange={e => setSignupData(p => ({ ...p, role: e.target.value }))}>
                <option value="patient">Patient</option>
                <option value="clinician">Clinician / Doctor</option>
                <option value="admin">Admin / Researcher</option>
              </select>
            </div>

            {/* DPDP Consent */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-teal shrink-0"
              />
              <span className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                I consent to the collection and processing of my health data under the{' '}
                <span className="font-semibold" style={{ color: 'var(--teal)' }}>Digital Personal Data Protection Act (DPDP) 2023</span>.
                My data will be used solely for diabetes care and clinical insights.
              </span>
            </label>

            <button className="btn-primary w-full py-2.5 text-base" onClick={handleSignup} disabled={!consent}>
              Create Account
            </button>

            <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Already have an account?{' '}
              <button onClick={() => switchMode('signin')} className="font-semibold hover:underline" style={{ color: 'var(--teal)' }}>Sign in</button>
            </p>
          </motion.div>
        )}

        {/* Demo quick access — sign in only */}
        {mode === 'signin' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="mt-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }}/>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
                Demo Access
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }}/>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Patient',   role: 'patient'   as Role, name: 'Demo Patient', email: 'patient@demo.com', icon: '🏥' },
                { label: 'Clinician', role: 'clinician' as Role, name: 'Dr. Demo',     email: 'doctor@demo.com',  icon: '👨‍⚕️' },
                { label: 'Agents',    role: 'admin'     as Role, name: 'Admin',        email: 'admin@demo.com',   icon: '🤖' },
              ].map(d => (
                <motion.button
                  key={d.role}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => quickLogin(d.role, d.name)}
                  className="text-center rounded-2xl p-3 transition-all duration-200 group"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div className="text-lg mb-1">{d.icon}</div>
                  <div className="text-xs font-semibold text-text" style={{ fontFamily: 'Manrope, sans-serif' }}>{d.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>{d.email}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <p className="text-center text-xs mt-8" style={{ color: 'var(--color-text-muted)' }}>
          Team AI Architect · MedAthon 2025 · Coimbatore, Tamil Nadu
        </p>
      </motion.div>
    </div>
  )
}
