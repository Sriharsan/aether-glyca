import { useState, useMemo } from 'react'
import { Activity, TrendingUp, TrendingDown, Target, Clock } from 'lucide-react'
import GlucoseChart from '../components/shared/GlucoseChart'

type Context = 'Fasting' | 'Post-meal' | 'Bedtime' | 'Random'

interface GlucoseReading {
  id: string
  glucose: number
  context: Context
  timestamp: string   // ISO string
}

const CONTEXTS: Context[] = ['Fasting', 'Post-meal', 'Bedtime', 'Random']

const CONTEXT_COLORS: Record<Context, string> = {
  'Fasting':    'text-blue-l bg-blue/10 border-blue/30',
  'Post-meal':  'text-gold  bg-gold/10  border-gold/30',
  'Bedtime':    'text-teal  bg-teal/10  border-teal/30',
  'Random':     'text-muted bg-card     border-border',
}

// ── seed 30 days of demo readings ─────────────────────────────────────────────
function seedReadings(): GlucoseReading[] {
  const readings: GlucoseReading[] = []
  const now = new Date()
  const schedule: Array<{ hour: number; ctx: Context; baseMg: number }> = [
    { hour: 7,  ctx: 'Fasting',   baseMg: 128 },
    { hour: 13, ctx: 'Post-meal', baseMg: 168 },
    { hour: 21, ctx: 'Bedtime',   baseMg: 142 },
  ]
  for (let day = 29; day >= 0; day--) {
    const date = new Date(now)
    date.setDate(date.getDate() - day)
    for (const { hour, ctx, baseMg } of schedule) {
      if (Math.random() < 0.15) continue   // ~15% chance of missing a reading
      const ts = new Date(date)
      ts.setHours(hour, Math.floor(Math.random() * 45), 0, 0)
      const glucose = Math.max(65, Math.min(290, Math.round(baseMg + (Math.random() - 0.48) * 55)))
      readings.push({ id: `seed-${day}-${hour}`, glucose, context: ctx, timestamp: ts.toISOString() })
    }
  }
  return readings.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

function loadReadings(): GlucoseReading[] {
  try {
    const stored = localStorage.getItem('aether-glucose-readings')
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  const initial = seedReadings()
  localStorage.setItem('aether-glucose-readings', JSON.stringify(initial))
  return initial
}

function saveReadings(readings: GlucoseReading[]) {
  localStorage.setItem('aether-glucose-readings', JSON.stringify(readings))
}

// ── helpers ────────────────────────────────────────────────────────────────────
function fmt(iso: string) {
  const d = new Date(iso)
  const today    = new Date(); today.setHours(0,0,0,0)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  const rd = new Date(d); rd.setHours(0,0,0,0)
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  if (rd.getTime() === today.getTime())     return `Today ${time}`
  if (rd.getTime() === yesterday.getTime()) return `Yesterday ${time}`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' + time
}

function glucoseLevel(g: number): { label: string; color: string } {
  if (g < 70)  return { label: 'Low',       color: 'text-danger' }
  if (g <= 140) return { label: 'Normal',    color: 'text-teal' }
  if (g <= 180) return { label: 'Elevated',  color: 'text-gold' }
  if (g <= 250) return { label: 'High',      color: 'text-gold' }
  return              { label: 'Very High',  color: 'text-danger' }
}

// ── component ─────────────────────────────────────────────────────────────────
export default function GlucosePage() {
  const [readings, setReadings]     = useState<GlucoseReading[]>(loadReadings)
  const [inputVal, setInputVal]     = useState('')
  const [context, setContext]       = useState<Context>('Post-meal')
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState('')

  // ── derived stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!readings.length) return null
    const vals = readings.map(r => r.glucose)
    const avg  = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
    const min  = Math.min(...vals)
    const max  = Math.max(...vals)
    const inRange = readings.filter(r => r.glucose >= 70 && r.glucose <= 180).length
    const tir  = Math.round((inRange / readings.length) * 100)
    return { avg, min, max, tir }
  }, [readings])

  // ── chart data — last 30 days, max 60 points for readability ─────────────
  const chartData = useMemo(() => {
    const last30 = readings.slice(-90)
    return last30.map(r => ({
      time:    fmt(r.timestamp),
      glucose: r.glucose,
    }))
  }, [readings])

  // ── log new reading ───────────────────────────────────────────────────────
  const logReading = () => {
    setError('')
    const val = parseFloat(inputVal)
    if (!inputVal || isNaN(val)) { setError('Please enter a number.'); return }
    if (val < 20 || val > 600)  { setError('Value must be between 20 and 600 mg/dL.'); return }

    const newReading: GlucoseReading = {
      id:        `r-${Date.now()}`,
      glucose:   Math.round(val),
      context,
      timestamp: new Date().toISOString(),
    }
    const updated = [...readings, newReading].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    setReadings(updated)
    saveReadings(updated)
    setInputVal('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const last20 = [...readings].reverse().slice(0, 20)

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Activity size={22} className="text-teal"/> Glucose Tracker
        </h1>
        <p className="text-muted text-sm mt-0.5">30-day history · Log readings · Track trends</p>
      </div>

      {/* Log new reading */}
      <div className="card">
        <h2 className="font-semibold text-text mb-4">Log New Reading</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Big number input */}
          <div className="flex-1">
            <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">
              Glucose (mg/dL)
            </label>
            <input
              type="number"
              inputMode="numeric"
              className="input text-2xl font-bold h-14 text-center"
              placeholder="e.g. 124"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && logReading()}
            />
          </div>

          {/* Context selector */}
          <div className="flex-1">
            <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">
              Context
            </label>
            <div className="grid grid-cols-2 gap-2 h-14">
              {CONTEXTS.map(c => (
                <button
                  key={c}
                  onClick={() => setContext(c)}
                  className={`rounded-lg border text-xs font-medium transition-colors px-2
                    ${context === c
                      ? 'bg-teal/20 border-teal text-teal'
                      : 'bg-card border-border text-muted hover:text-text'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Log button */}
          <div className="flex items-end">
            <button
              onClick={logReading}
              className="btn-primary h-14 px-8 text-base w-full sm:w-auto"
            >
              Log
            </button>
          </div>
        </div>

        {error     && <p className="text-danger text-xs mt-2">{error}</p>}
        {submitted && (
          <p className="text-teal text-xs mt-2">
            ✓ Reading logged — {inputVal || '—'} mg/dL ({context})
          </p>
        )}
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Average',      value: `${stats.avg}`, unit: 'mg/dL',
              icon: <Activity  size={16} className="text-teal"/>,
              color: stats.avg <= 154 ? 'text-teal' : stats.avg <= 180 ? 'text-gold' : 'text-danger' },
            { label: 'Minimum',      value: `${stats.min}`, unit: 'mg/dL',
              icon: <TrendingDown size={16} className="text-blue-l"/>,
              color: stats.min >= 70 ? 'text-blue-l' : 'text-danger' },
            { label: 'Maximum',      value: `${stats.max}`, unit: 'mg/dL',
              icon: <TrendingUp size={16} className="text-gold"/>,
              color: stats.max <= 180 ? 'text-teal' : stats.max <= 250 ? 'text-gold' : 'text-danger' },
            { label: 'Time in Range',value: `${stats.tir}`, unit: '%',
              icon: <Target    size={16} className="text-success"/>,
              color: stats.tir >= 70 ? 'text-success' : stats.tir >= 50 ? 'text-gold' : 'text-danger' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="stat-label">{s.label}</span>
                {s.icon}
              </div>
              <div className={`stat-value ${s.color}`}>
                {s.value}
                <span className="text-lg text-muted ml-1">{s.unit}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 30-day chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text">30-Day Glucose Trend</h2>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-danger inline-block rounded"/>Above 180
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-gold   inline-block rounded"/>Below 70
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-teal   inline-block rounded"/>In range
            </span>
          </div>
        </div>
        <div className="h-56 md:h-72">
          <GlucoseChart data={chartData} />
        </div>
      </div>

      {/* Context breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CONTEXTS.map(ctx => {
          const ctxReadings = readings.filter(r => r.context === ctx)
          if (!ctxReadings.length) return null
          const avg = Math.round(ctxReadings.reduce((s, r) => s + r.glucose, 0) / ctxReadings.length)
          return (
            <div key={ctx} className={`card border ${CONTEXT_COLORS[ctx].split(' ')[2]}`}>
              <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${CONTEXT_COLORS[ctx].split(' ')[0]}`}>
                {ctx}
              </div>
              <div className="text-2xl font-bold text-text">{avg} <span className="text-sm text-muted font-normal">mg/dL avg</span></div>
              <div className="text-xs text-muted mt-0.5">{ctxReadings.length} readings</div>
            </div>
          )
        })}
      </div>

      {/* History table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text flex items-center gap-2">
            <Clock size={16} className="text-muted"/> Recent Readings
          </h2>
          <span className="text-xs text-muted">Last {Math.min(20, readings.length)}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs uppercase tracking-wide border-b border-border">
                {['When', 'Glucose', 'Context', 'Level'].map(h => (
                  <th key={h} className="text-left py-2 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {last20.map(r => {
                const lv = glucoseLevel(r.glucose)
                return (
                  <tr key={r.id} className="border-b border-border/40 hover:bg-surface/50 transition-colors">
                    <td className="py-3 pr-4 text-muted text-xs whitespace-nowrap">{fmt(r.timestamp)}</td>
                    <td className="py-3 pr-4 font-bold text-text font-mono">{r.glucose} <span className="font-normal text-xs text-muted">mg/dL</span></td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CONTEXT_COLORS[r.context]}`}>
                        {r.context}
                      </span>
                    </td>
                    <td className={`py-3 text-xs font-semibold ${lv.color}`}>{lv.label}</td>
                  </tr>
                )
              })}
              {!readings.length && (
                <tr><td colSpan={4} className="py-6 text-center text-muted text-sm">No readings yet — log your first reading above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
