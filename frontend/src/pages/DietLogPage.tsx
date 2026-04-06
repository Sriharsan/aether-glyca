import { useState, useMemo } from 'react'
import { Search, Utensils, Plus, Trash2, TrendingUp, Camera } from 'lucide-react'
import { TAMIL_FOODS } from '../data/mockData'
import FoodPhotoScanner from '../components/patient/FoodPhotoScanner'

type Portion  = 'Small' | 'Medium' | 'Large' | 'Extra Large'
type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'
type Impact   = 'Low' | 'Medium' | 'High'

interface DietEntry {
  id:        string
  foodName:  string
  gi:        number
  category:  string
  impact:    Impact
  portion:   Portion
  mealType:  MealType
  timestamp: string
}

const PORTIONS: Portion[]  = ['Small', 'Medium', 'Large', 'Extra Large']
const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

// Estimated glucose rise (mg/dL) per GI and portion — rough clinical estimates
const IMPACT_TABLE: Record<Impact, Record<Portion, number>> = {
  Low:    { Small: 10, Medium: 18, Large: 28, 'Extra Large': 40 },
  Medium: { Small: 22, Medium: 38, Large: 55, 'Extra Large': 72 },
  High:   { Small: 38, Medium: 58, Large: 80, 'Extra Large': 105 },
}

function estimateGlucoseRise(impact: Impact, portion: Portion): number {
  return IMPACT_TABLE[impact][portion]
}

const IMPACT_COLORS: Record<Impact, string> = {
  Low:    'text-success bg-success/10 border-success/30',
  Medium: 'text-gold    bg-gold/10    border-gold/30',
  High:   'text-danger  bg-danger/10  border-danger/30',
}

const MEAL_ICONS: Record<MealType, string> = {
  Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🥜',
}

// ── storage helpers ───────────────────────────────────────────────────────────
function loadLog(): DietEntry[] {
  try { return JSON.parse(localStorage.getItem('aether-diet-log') || '[]') } catch { return [] }
}

function saveLog(log: DietEntry[]) {
  localStorage.setItem('aether-diet-log', JSON.stringify(log))
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)   // "YYYY-MM-DD"
}

function isoToDateKey(iso: string) {
  return iso.slice(0, 10)
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

// ── component ─────────────────────────────────────────────────────────────────
export default function DietLogPage() {
  const [log, setLog]           = useState<DietEntry[]>(loadLog)
  const [query, setQuery]       = useState('')
  const [portion, setPortion]   = useState<Portion>('Medium')
  const [mealType, setMealType] = useState<MealType>('Lunch')
  const [selected, setSelected] = useState<typeof TAMIL_FOODS[number] | null>(null)
  const [added, setAdded]       = useState(false)
  const [logTab, setLogTab]     = useState<'search'|'scan'>('search')

  // ── search ─────────────────────────────────────────────────────────────────
  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return TAMIL_FOODS.filter(f =>
      f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    )
  }, [query])

  // ── today's entries ────────────────────────────────────────────────────────
  const todayEntries = useMemo(() =>
    log.filter(e => isoToDateKey(e.timestamp) === todayKey())
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [log]
  )

  // ── weekly summary ─────────────────────────────────────────────────────────
  const weekly = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 6)
    cutoff.setHours(0, 0, 0, 0)
    const weekEntries = log.filter(e => new Date(e.timestamp) >= cutoff)
    if (!weekEntries.length) return null
    const avgGI = Math.round(weekEntries.reduce((s, e) => s + e.gi, 0) / weekEntries.length)
    const perDay: Record<string, number> = {}
    weekEntries.forEach(e => {
      const d = isoToDateKey(e.timestamp)
      perDay[d] = (perDay[d] ?? 0) + 1
    })
    const days = Object.keys(perDay).length
    return { total: weekEntries.length, avgGI, days, perDay }
  }, [log])

  // ── log a food entry ───────────────────────────────────────────────────────
  const logFood = () => {
    if (!selected) return
    const entry: DietEntry = {
      id:        `d-${Date.now()}`,
      foodName:  selected.name,
      gi:        selected.gi,
      category:  selected.category,
      impact:    selected.impact as Impact,
      portion,
      mealType,
      timestamp: new Date().toISOString(),
    }
    const updated = [...log, entry]
    setLog(updated)
    saveLog(updated)
    setQuery(''); setSelected(null)
    setAdded(true)
    setTimeout(() => setAdded(false), 3000)
  }

  const removeEntry = (id: string) => {
    const updated = log.filter(e => e.id !== id)
    setLog(updated); saveLog(updated)
  }

  const totalGlucoseImpact = todayEntries.reduce(
    (s, e) => s + estimateGlucoseRise(e.impact, e.portion), 0
  )

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Utensils size={22} className="text-teal"/> Diet Log
        </h1>
        <p className="text-muted text-sm mt-0.5">Log meals · Track GI · Estimate glucose impact</p>
      </div>

      {/* Log new food */}
      <div className="card space-y-4">

        {/* Tabs */}
        <div className="flex bg-surface border border-border rounded-xl p-1 -mb-1">
          <button
            onClick={() => setLogTab('search')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors
              ${logTab === 'search' ? 'bg-teal/20 text-teal' : 'text-muted hover:text-text'}`}
          >
            <Search size={14}/> Search Food
          </button>
          <button
            onClick={() => setLogTab('scan')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors
              ${logTab === 'scan' ? 'bg-teal/20 text-teal' : 'text-muted hover:text-text'}`}
          >
            <Camera size={14}/> Scan Photo
          </button>
        </div>

        {logTab === 'scan' && (
          <FoodPhotoScanner onFoodLogged={() => { setAdded(true); setTimeout(() => setAdded(false), 3000) }} />
        )}

        {logTab === 'search' && (<>
        <h2 className="font-semibold text-text">Log a Food</h2>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
          <input
            className="input pl-9"
            placeholder="Search Tamil Nadu foods — idly, sambar, dosa, rice…"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null) }}
          />
        </div>

        {/* Dropdown results */}
        {results.length > 0 && !selected && (
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border/50">
            {results.map(f => (
              <button key={f.name}
                onClick={() => { setSelected(f); setQuery(f.name) }}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface transition-colors text-left"
              >
                <div>
                  <span className="text-sm text-text font-medium">{f.name}</span>
                  <span className="text-xs text-muted ml-2">{f.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">GI {f.gi}</span>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${IMPACT_COLORS[f.impact as Impact]}`}>
                    {f.impact}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Selected food preview */}
        {selected && (
          <div className="bg-teal/5 border border-teal/20 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-text">{selected.name}</span>
              <span className="text-xs text-muted ml-2">{selected.category} · GI {selected.gi}</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${IMPACT_COLORS[selected.impact as Impact]}`}>
              {selected.impact} impact
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Portion */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wide block mb-2">Portion Size</label>
            <div className="grid grid-cols-2 gap-2">
              {PORTIONS.map(p => (
                <button key={p} onClick={() => setPortion(p)}
                  className={`py-2 rounded-lg border text-xs font-medium transition-colors
                    ${portion === p
                      ? 'bg-teal/20 border-teal text-teal'
                      : 'bg-card border-border text-muted hover:text-text'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Meal type */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wide block mb-2">Meal</label>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_TYPES.map(m => (
                <button key={m} onClick={() => setMealType(m)}
                  className={`py-2 rounded-lg border text-xs font-medium transition-colors
                    ${mealType === m
                      ? 'bg-teal/20 border-teal text-teal'
                      : 'bg-card border-border text-muted hover:text-text'}`}>
                  {MEAL_ICONS[m]} {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Glucose rise preview */}
        {selected && (
          <div className="text-xs text-muted bg-surface border border-border rounded-lg px-3 py-2">
            Estimated glucose rise for {portion} portion:
            <span className={`ml-1 font-bold ${
              estimateGlucoseRise(selected.impact as Impact, portion) > 55 ? 'text-danger'
              : estimateGlucoseRise(selected.impact as Impact, portion) > 30 ? 'text-gold'
              : 'text-teal'
            }`}>
              +{estimateGlucoseRise(selected.impact as Impact, portion)} mg/dL
            </span>
          </div>
        )}

        <button
          onClick={logFood}
          disabled={!selected}
          className="btn-primary flex items-center gap-2 disabled:opacity-40"
        >
          <Plus size={15}/> Add to Today's Log
        </button>

        {added && <p className="text-teal text-xs">✓ Food logged successfully</p>}
        </>)}
      </div>

      {/* Today's log */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text">Today's Log</h2>
          {todayEntries.length > 0 && (
            <div className="text-xs text-muted">
              Est. total rise:{' '}
              <span className={`font-bold ${totalGlucoseImpact > 150 ? 'text-danger' : totalGlucoseImpact > 80 ? 'text-gold' : 'text-teal'}`}>
                +{totalGlucoseImpact} mg/dL
              </span>
            </div>
          )}
        </div>

        {todayEntries.length === 0 ? (
          <p className="text-muted text-sm text-center py-6">
            Nothing logged today — search for a food above to start.
          </p>
        ) : (
          <div className="space-y-3">
            {MEAL_TYPES.map(meal => {
              const entries = todayEntries.filter(e => e.mealType === meal)
              if (!entries.length) return null
              return (
                <div key={meal}>
                  <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                    {MEAL_ICONS[meal]} {meal}
                  </div>
                  <div className="space-y-2">
                    {entries.map(entry => {
                      const rise = estimateGlucoseRise(entry.impact, entry.portion)
                      return (
                        <div key={entry.id}
                          className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-text">{entry.foodName}</span>
                              <span className="text-xs text-muted">{entry.portion}</span>
                              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${IMPACT_COLORS[entry.impact]}`}>
                                {entry.impact}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-muted">GI {entry.gi}</span>
                              <span className="text-xs text-muted">·</span>
                              <span className={`text-xs font-medium ${rise > 55 ? 'text-danger' : rise > 30 ? 'text-gold' : 'text-teal'}`}>
                                +{rise} mg/dL est.
                              </span>
                              <span className="text-xs text-muted">·</span>
                              <span className="text-xs text-muted">{fmtTime(entry.timestamp)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeEntry(entry.id)}
                            className="text-muted hover:text-danger transition-colors ml-3 shrink-0"
                            title="Remove entry"
                          >
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Weekly summary */}
      {weekly && (
        <div className="card">
          <h2 className="font-semibold text-text flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-teal"/> 7-Day Summary
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal">{weekly.total}</div>
              <div className="text-xs text-muted uppercase tracking-wide mt-0.5">Meals Logged</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${weekly.avgGI <= 55 ? 'text-success' : weekly.avgGI <= 70 ? 'text-gold' : 'text-danger'}`}>
                {weekly.avgGI}
              </div>
              <div className="text-xs text-muted uppercase tracking-wide mt-0.5">Avg GI</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-l">{weekly.days}</div>
              <div className="text-xs text-muted uppercase tracking-wide mt-0.5">Days Active</div>
            </div>
          </div>

          {/* Per-day bar chart (simple CSS) */}
          <div className="mt-4 flex items-end gap-1 h-12">
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date(); d.setDate(d.getDate() - (6 - i))
              const key = d.toISOString().slice(0, 10)
              const count = weekly.perDay[key] ?? 0
              const maxCount = Math.max(...Object.values(weekly.perDay), 1)
              const height = count ? Math.max(8, Math.round((count / maxCount) * 48)) : 2
              return (
                <div key={key} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-teal/40 transition-all"
                    style={{ height: `${height}px` }}
                    title={`${count} meals`}
                  />
                  <span className="text-xs text-muted">
                    {d.toLocaleDateString('en-IN', { weekday: 'narrow' })}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-muted mt-2">
            {weekly.avgGI <= 55
              ? '✓ Great average GI this week — your diet is diabetes-friendly.'
              : weekly.avgGI <= 70
              ? '⚠ Average GI is moderate — try switching some High items to Low-GI alternatives.'
              : '⚠ High average GI this week — reduce Ponni rice and fried snacks.'}
          </p>
        </div>
      )}
    </div>
  )
}
