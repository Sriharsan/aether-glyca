import { useState, useEffect, useMemo } from 'react'
import { Dumbbell, Plus, Trash2, Filter } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from 'recharts'
import {
  EXERCISES, EXERCISE_CATEGORIES, INTENSITY_COLORS, CATEGORY_EMOJI,
} from '../data/exerciseData'

type Intensity = 'Low' | 'Moderate' | 'High'

interface ExEntry {
  id:            string
  date:          string
  exerciseId:    string
  exerciseName:  string
  duration:      number
  intensity:     Intensity
  glucoseBefore?: number
  glucoseAfter?:  number
  calories:      number
  notes:         string
}

const STORAGE_KEY = 'aether-exercise-log'
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function localDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeeklyMinutes(entries: ExEntry[]) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key  = localDateStr(d)
    const mins = entries.filter(e => e.date === key).reduce((s, e) => s + e.duration, 0)
    return {
      day:     d.toLocaleDateString('en-IN', { weekday: 'short' }),
      minutes: mins,
      calories: entries.filter(e => e.date === key).reduce((s, e) => s + e.calories, 0),
    }
  })
}

export default function ExercisePage() {
  const [entries,  setEntries]  = useState<ExEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
  })
  const [showForm,  setShowForm]  = useState(false)
  const [catFilter, setCatFilter] = useState('All')
  const [form, setForm] = useState({
    exerciseId:    EXERCISES[0].id,
    duration:      30,
    intensity:     'Moderate' as Intensity,
    glucoseBefore: '',
    glucoseAfter:  '',
    notes:         '',
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const selectedEx = EXERCISES.find(e => e.id === form.exerciseId) ?? EXERCISES[0]

  const addEntry = () => {
    // Calories: scale from the DB value (which is for the exercise's default duration)
    const kcalPerMin = selectedEx.calories / selectedEx.duration
    const entry: ExEntry = {
      id:           Date.now().toString(),
      date:         localDateStr(new Date()),
      exerciseId:   form.exerciseId,
      exerciseName: selectedEx.name,
      duration:     form.duration,
      intensity:    form.intensity,
      glucoseBefore: form.glucoseBefore ? Number(form.glucoseBefore) : undefined,
      glucoseAfter:  form.glucoseAfter  ? Number(form.glucoseAfter)  : undefined,
      calories:     Math.round(kcalPerMin * form.duration),
      notes:        form.notes,
    }
    setEntries(prev => [entry, ...prev])
    setShowForm(false)
    setForm(f => ({ ...f, glucoseBefore:'', glucoseAfter:'', notes:'' }))
  }

  const removeEntry = (id: string) => setEntries(prev => prev.filter(e => e.id !== id))

  const weeklyData   = getWeeklyMinutes(entries)
  const weekMins     = weeklyData.reduce((s, d) => s + d.minutes, 0)
  const totalKcal    = entries.reduce((s, e) => s + e.calories, 0)

  // Filtered exercises for the guide
  const guideExercises = useMemo(() =>
    catFilter === 'All'
      ? EXERCISES
      : EXERCISES.filter(e => e.category === catFilter),
    [catFilter]
  )

  // Top 8 by glucoseReduction for correlation table
  const topExercises = useMemo(() =>
    [...EXERCISES].sort((a, b) => b.glucoseReduction - a.glucoseReduction).slice(0, 8),
    []
  )

  return (
    <div className="p-6 space-y-6 accent-patient">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Dumbbell size={22} className="text-teal"/> Exercise Log
          </h1>
          <p className="text-muted text-sm mt-0.5">
            {EXERCISES.length} exercises · Track movement · Monitor glucose impact
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(v => !v)}>
          <Plus size={15}/> Log Exercise
        </button>
      </div>

      {/* Log form */}
      {showForm && (
        <div className="card">
          <h2 className="font-semibold text-text mb-4">New Exercise Entry</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">Exercise</label>
              <select
                className="input"
                value={form.exerciseId}
                onChange={e => setForm(f => ({ ...f, exerciseId: e.target.value }))}
              >
                {EXERCISE_CATEGORIES.filter(c => c !== 'All').map(cat => (
                  <optgroup key={cat} label={`${CATEGORY_EMOJI[cat] ?? ''} ${cat}`}>
                    {EXERCISES.filter(ex => ex.category === cat).map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.emoji} {ex.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {selectedEx && (
                <p className="text-xs text-teal mt-1.5">{selectedEx.tip}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">Duration (minutes)</label>
              <input type="number" className="input" min={5} max={180} step={5}
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}/>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">Intensity</label>
              <select className="input" value={form.intensity}
                onChange={e => setForm(f => ({ ...f, intensity: e.target.value as Intensity }))}>
                <option>Low</option>
                <option>Moderate</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">Glucose Before (mg/dL)</label>
              <input type="number" className="input" placeholder="Optional"
                value={form.glucoseBefore}
                onChange={e => setForm(f => ({ ...f, glucoseBefore: e.target.value }))}/>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">Glucose After (mg/dL)</label>
              <input type="number" className="input" placeholder="Optional"
                value={form.glucoseAfter}
                onChange={e => setForm(f => ({ ...f, glucoseAfter: e.target.value }))}/>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted uppercase tracking-wide block mb-1.5">Notes</label>
              <input type="text" className="input" placeholder="How did it feel?"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}/>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn-primary" onClick={addEntry}>Save Entry</button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-value text-teal">{weekMins}</div>
          <div className="stat-label">This week (min)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-gold">{totalKcal.toLocaleString()}</div>
          <div className="stat-label">Total kcal burned</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-text">{entries.length}</div>
          <div className="stat-label">Sessions logged</div>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="card">
        <h2 className="font-semibold text-text mb-4">This Week — Minutes of Exercise</h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/>
            <XAxis dataKey="day" tick={{ fontSize:11, fill:'var(--color-text-muted)' }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:11, fill:'var(--color-text-muted)' }} axisLine={false} tickLine={false}/>
            <Tooltip
              contentStyle={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:8, fontSize:12 }}
              labelStyle={{ color:'var(--color-text)' }}
              formatter={(v: number) => [`${v} min`, 'Exercise']}
            />
            <Bar dataKey="minutes" radius={[4,4,0,0]}>
              {weeklyData.map((d, i) => (
                <Cell key={i} fill={d.minutes >= 30 ? 'var(--teal)' : d.minutes > 0 ? 'var(--gold)' : 'var(--color-border)'}/>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted mt-2 text-center">Green = ≥30 min target met · Orange = some activity · Grey = rest day</p>
      </div>

      {/* Exercise guide — filterable */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h2 className="font-semibold text-text">Exercise Guide ({guideExercises.length})</h2>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={13} className="text-muted"/>
            {EXERCISE_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors
                  ${catFilter === cat
                    ? 'bg-teal/20 text-teal border border-teal/30'
                    : 'bg-card border border-border text-muted hover:text-text'}`}
              >
                {cat !== 'All' && CATEGORY_EMOJI[cat]} {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {guideExercises.map(ex => (
            <div key={ex.id} className="card hover:border-teal/40 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{ex.emoji}</span>
                  <div>
                    <div className="font-semibold text-text text-sm leading-tight">{ex.name}</div>
                    <div className="text-xs text-muted">{ex.category} · {ex.duration} min · {ex.region}</div>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${INTENSITY_COLORS[ex.intensity]}`}>
                  {ex.intensity}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs mb-2">
                <span className="text-teal font-semibold">↓ {ex.glucoseReduction} mg/dL</span>
                <span className="text-muted">{ex.calories} kcal</span>
                <span className="text-muted">{ex.bestTime}</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">{ex.tip}</p>
              {ex.equipment !== 'None' && (
                <p className="text-xs text-muted mt-1.5">
                  <span className="font-medium text-text">Needs:</span> {ex.equipment}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Glucose correlation table — top 8 */}
      <div className="card">
        <h2 className="font-semibold text-text mb-4">Glucose Drop Ranking — Top 8 Exercises</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted uppercase tracking-wide">
                <th className="text-left pb-2 font-medium">Exercise</th>
                <th className="text-center pb-2 font-medium">Duration</th>
                <th className="text-center pb-2 font-medium">Glucose ↓</th>
                <th className="text-center pb-2 font-medium">Calories</th>
                <th className="text-center pb-2 font-medium">Intensity</th>
              </tr>
            </thead>
            <tbody>
              {topExercises.map(ex => (
                <tr key={ex.id} className="border-b border-border/40 hover:bg-card/30">
                  <td className="py-2.5 text-text">
                    {ex.emoji} {ex.name}
                  </td>
                  <td className="py-2.5 text-center text-muted">{ex.duration} min</td>
                  <td className="py-2.5 text-center">
                    <span className="text-success font-semibold">↓ {ex.glucoseReduction}</span>
                  </td>
                  <td className="py-2.5 text-center text-gold">{ex.calories}</td>
                  <td className="py-2.5 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${INTENSITY_COLORS[ex.intensity]}`}>
                      {ex.intensity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exercise history */}
      {entries.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-text mb-4">Exercise History</h2>
          <div className="space-y-2">
            {entries.slice(0, 20).map(e => {
              const drop = e.glucoseBefore && e.glucoseAfter ? e.glucoseBefore - e.glucoseAfter : null
              return (
                <div key={e.id} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text">{e.exerciseName}</div>
                    <div className="text-xs text-muted">
                      {e.date} · {e.duration} min · {e.intensity}
                      {drop !== null && <span className="ml-2 text-success">↓ {drop} mg/dL</span>}
                      {e.notes && <span className="ml-2">· {e.notes}</span>}
                    </div>
                  </div>
                  <div className="text-xs text-gold shrink-0">{e.calories} kcal</div>
                  <button onClick={() => removeEntry(e.id)} className="text-muted hover:text-danger transition-colors shrink-0">
                    <Trash2 size={14}/>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
