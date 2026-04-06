import { useState } from 'react'
import { Activity, Utensils, TrendingDown, Clock, ArrowUpRight, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import GlucoseChart from '../shared/GlucoseChart'
import RiskBadge from '../shared/RiskBadge'
import { generateGlucoseTimeline, TAMIL_FOODS } from '../../data/mockData'

const DEMO_PATIENT = {
  name: 'Demo Patient', age: 52, type: 'Type 2 Diabetes',
  hba1c: 8.2, tir: 61, risk: 'medium', score: 39,
  lastReading: 156, lastReadingCtx: 'Post-meal',
}

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
}

export default function PatientDashboard() {
  const [glucoseInput, setGlucoseInput] = useState('')
  const [readings,     setReadings]     = useState(() => generateGlucoseTimeline('medium'))
  const [submitted,    setSubmitted]    = useState(false)

  const handleAddReading = () => {
    const val = parseFloat(glucoseInput)
    if (!val || val < 20 || val > 600) return
    setReadings(prev => [...prev, { time: 'Just now', glucose: val, target_high: 180, target_low: 70 }])
    setGlucoseInput('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const lastVal = readings[readings.length - 1]?.glucose ?? 0
  const inRange  = readings.filter(r => r.glucose >= 70 && r.glucose <= 180).length
  const tirPct   = Math.round((inRange / readings.length) * 100)

  const stats = [
    {
      label: 'Last Reading', value: lastVal, unit: 'mg/dL',
      icon: <Activity size={18}/>, sub: DEMO_PATIENT.lastReadingCtx,
      color: lastVal > 180 ? 'var(--danger)' : lastVal < 70 ? 'var(--gold)' : 'var(--teal)',
      cardClass: lastVal > 180 ? 'card-gradient-danger' : lastVal < 70 ? 'card-gradient-gold' : 'card-gradient-teal',
    },
    {
      label: 'Time in Range', value: `${tirPct}%`, unit: '',
      icon: <Clock size={18}/>, sub: 'Target: 70%+',
      color: tirPct >= 70 ? 'var(--success)' : tirPct >= 50 ? 'var(--gold)' : 'var(--danger)',
      cardClass: tirPct >= 70 ? 'card-gradient-success' : 'card-gradient-teal',
    },
    {
      label: 'HbA1c', value: DEMO_PATIENT.hba1c, unit: '%',
      icon: <TrendingDown size={18}/>, sub: 'Target: <7.0%',
      color: 'var(--gold)', cardClass: 'card-gradient-teal',
    },
    {
      label: 'Diet Logs Today', value: '3', unit: 'meals',
      icon: <Utensils size={18}/>, sub: 'Last: Lunch',
      color: 'var(--success)', cardClass: 'card-gradient-success',
    },
  ]

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <motion.div
        initial="hidden" animate="visible" variants={fadeUp}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}>
            Good morning,{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--teal) 0%, var(--blue-l) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {DEMO_PATIENT.name}
            </span>{' '}
            👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {DEMO_PATIENT.type} · Age {DEMO_PATIENT.age} · Tamil Nadu
          </p>
        </div>
        <RiskBadge level={DEMO_PATIENT.risk} score={DEMO_PATIENT.score} />
      </motion.div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
            <div className={`stat-card group cursor-default ${s.cardClass}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="stat-label">{s.label}</span>
                <div className="p-2 rounded-xl transition-transform group-hover:scale-110"
                  style={{ background: `rgba(from-color, 0.1)`, color: s.color }}>
                  {s.icon}
                </div>
              </div>
              <div className="stat-value" style={{ color: s.color }}>
                {s.value}
                {s.unit && <span className="text-base font-normal ml-1.5" style={{ color: 'var(--color-text-muted)' }}>{s.unit}</span>}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.sub}</span>
                <ArrowUpRight size={13} style={{ color: s.color, opacity: 0.6 }}/>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Glucose chart */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-2">
          <div className="card h-full">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-text" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Glucose Timeline
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Last 7 days · mg/dL</p>
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--danger)' }}/>
                  Above 180
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--gold)' }}/>
                  Below 70
                </span>
              </div>
            </div>

            <div className="h-48 md:h-56">
              <GlucoseChart data={readings} />
            </div>

            <div className="mt-5 flex gap-3">
              <input
                className="input text-sm flex-1"
                placeholder="Enter glucose reading (mg/dL)"
                type="number"
                value={glucoseInput}
                onChange={e => setGlucoseInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddReading()}
              />
              <button className="btn-primary text-sm px-6" onClick={handleAddReading}>
                Log
              </button>
            </div>
            {submitted && (
              <motion.p
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs mt-2.5 font-medium"
                style={{ color: 'var(--success)' }}
              >
                ✓ Reading logged successfully
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Food GI guide */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="card h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Tamil Nadu Food Guide
              </h2>
              <span className="text-xs px-2 py-1 rounded-lg font-medium"
                style={{ background: 'rgba(var(--teal-rgb),0.1)', color: 'var(--teal)' }}>
                GI Index
              </span>
            </div>
            <div className="flex-1 space-y-1 max-h-72 overflow-y-auto pr-1">
              {TAMIL_FOODS.map(f => (
                <div key={f.name}
                  className="flex items-center justify-between py-2 px-2 rounded-lg transition-colors hover:bg-surface"
                  style={{ borderBottom: '1px solid var(--color-border)', borderBottomColor: 'rgba(var(--border-rgb), 0.5)' }}>
                  <div>
                    <div className="text-sm font-medium text-text">{f.emoji} {f.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{f.category}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>GI {f.gi}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: f.impact === 'High'   ? 'rgba(var(--danger-rgb),0.12)'
                                  : f.impact === 'Medium' ? 'rgba(var(--gold-rgb),0.12)'
                                  :                         'rgba(var(--success-rgb),0.12)',
                        color: f.impact === 'High'   ? 'var(--danger)'
                             : f.impact === 'Medium' ? 'var(--gold)'
                             :                         'var(--success)',
                      }}>
                      {f.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs mt-3 pt-3" style={{ color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)' }}>
              Based on regional glycemic research for South Indian dietary patterns.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Privacy ── */}
      <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="card card-gradient-danger">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trash2 size={15} style={{ color: 'var(--danger)' }}/>
                <span className="font-semibold text-text text-sm">Right to Erasure (DPDP Act 2023)</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Delete all your locally stored health data. This cannot be undone.
              </p>
            </div>
            <button
              className="btn-ghost text-sm flex items-center gap-2 shrink-0"
              style={{ borderColor: 'rgba(var(--danger-rgb),0.3)', color: 'var(--danger)' }}
              onClick={() => {
                if (!window.confirm('Delete all your local health data? This cannot be undone.')) return
                const keys = [
                  'aether-glucose-log', 'aether-diet-log', 'aether-exercise-log',
                  'aether_users', 'aether-food-history',
                ]
                keys.forEach(k => localStorage.removeItem(k))
                alert('All your data has been deleted.')
                window.location.reload()
              }}
            >
              <Trash2 size={14}/> Delete My Data
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── AI Recommendations ── */}
      <motion.div custom={7} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
              style={{ background: 'rgba(var(--teal-rgb),0.12)' }}>
              🧠
            </div>
            <h2 className="font-semibold text-text" style={{ fontFamily: 'Manrope, sans-serif' }}>
              AI Recommendations for Today
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: '🍽️', title: 'Switch Rice', text: 'Swap Ponni Rice for Mappillai Samba today — 17 GI points lower, same taste profile.' },
              { icon: '⏰', title: 'Glucose Timing', text: 'Glucose spikes peak 90 min after meals. Log readings at 7am, 1pm, 7pm for better tracking.' },
              { icon: '🥗', title: 'Add Fiber', text: 'Include kootu or avial at lunch — fiber slows glucose absorption significantly.' },
              { icon: '🚶', title: 'Post-Dinner Walk', text: 'A 15-min walk after dinner reduces post-prandial glucose by ~25 mg/dL on average.' },
            ].map((r, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.01, y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex items-start gap-3 rounded-2xl p-4 cursor-default"
                style={{ background: 'var(--color-surface)', border: '1px solid rgba(var(--border-rgb), 0.6)' }}
              >
                <span className="text-xl shrink-0 mt-0.5">{r.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-text mb-0.5" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {r.title}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{r.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
