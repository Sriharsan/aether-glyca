import { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronUp, Download } from 'lucide-react'
import { MOCK_PATIENTS, RISK_COLORS, generateGlucoseTimeline } from '../../data/mockData'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  ReferenceLine, Tooltip
} from 'recharts'

type Patient = typeof MOCK_PATIENTS[0]

function RiskBadge({ risk }: { risk: string }) {
  const cls = risk === 'critical' ? 'badge-critical'
            : risk === 'high'     ? 'badge-high'
            : risk === 'medium'   ? 'badge-medium'
            : 'badge-low'
  return <span className={cls}>{risk}</span>
}

function TirBar({ tir }: { tir: number }) {
  const color = tir >= 70 ? '#2ECC71' : tir >= 50 ? '#4F9BFF' : tir >= 35 ? '#FFB830' : '#FF4C6A'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${tir}%`, background: color }} />
      </div>
      <span className="text-xs text-muted w-8 text-right">{tir}%</span>
    </div>
  )
}

function MiniGlucoseChart({ risk }: { risk: string }) {
  const data = useMemo(() => generateGlucoseTimeline(risk).slice(-14), [risk])
  return (
    <ResponsiveContainer width="100%" height={80}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <XAxis dataKey="time" hide />
        <YAxis domain={[50, 350]} hide />
        <ReferenceLine y={180} stroke="#FFB830" strokeDasharray="3 3" strokeWidth={1} />
        <ReferenceLine y={70}  stroke="#FF4C6A" strokeDasharray="3 3" strokeWidth={1} />
        <Tooltip
          contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 11 }}
          labelStyle={{ color: 'var(--color-text-muted)' }}
          itemStyle={{ color: 'var(--teal)' }}
        />
        <Line
          type="monotone" dataKey="glucose" stroke={RISK_COLORS[risk] ?? '#00C9A7'}
          dot={false} strokeWidth={1.5}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function downloadPatientReport(p: Patient) {
  const now = new Date()
  const lines = [
    '═══════════════════════════════════════════════════',
    '        AETHER-Glyca — Individual Patient Report   ',
    '═══════════════════════════════════════════════════',
    `Generated : ${now.toLocaleString()}`,
    `Patient ID: ${p.id.toUpperCase()}`,
    '',
    '── Patient Profile ─────────────────────────────────',
    `Name      : ${p.name}`,
    `Age       : ${p.age} years`,
    `Gender    : ${p.gender === 'M' ? 'Male' : 'Female'}`,
    `Region    : ${p.region}, Tamil Nadu`,
    `Type      : ${p.type.replace('type', 'Type ')}`,
    '',
    '── Clinical Metrics ────────────────────────────────',
    `Risk Level: ${p.risk.toUpperCase()}`,
    `Risk Score: ${p.score}/100`,
    `HbA1c     : ${p.hba1c}%`,
    `Time in Range (TIR): ${p.tir}%`,
    '',
    '── Recommended Interventions ───────────────────────',
    p.risk === 'critical'
      ? '• URGENT: Immediate physician review required\n• Daily glucose monitoring and insulin adjustment\n• Dietary overhaul — switch to low-GI Tamil Nadu foods'
      : p.risk === 'high'
      ? '• Schedule clinic visit within 14 days\n• Increase monitoring frequency\n• Dietary counselling — Tamil cuisine modifications'
      : p.risk === 'medium'
      ? '• Routine follow-up in 30 days\n• Reinforce lifestyle changes\n• Encourage regular exercise (30 min/day)'
      : '• Continue current management\n• Annual HbA1c check\n• Maintain healthy lifestyle',
    '',
    '─────────────────────────────────────────────────────',
    'AETHER-Glyca · Autonomous Diabetes Care Platform',
    'MedAthon 2025 · Coimbatore, Tamil Nadu',
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `AETHER_Patient_${p.id}_${now.toISOString().slice(0,10)}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export default function PatientsPage() {
  const [query,    setQuery]    = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return MOCK_PATIENTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.region.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q) ||
      p.risk.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="p-6 space-y-6 accent-clinician">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">Patient Records</h1>
          <p className="text-muted text-sm mt-0.5">{MOCK_PATIENTS.length} patients · Tamil Nadu region</p>
        </div>
        <div className="relative w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9"
            placeholder="Search by name, region or risk…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(p => {
          const open = expanded === p.id
          return (
            <div key={p.id} className="card p-0 overflow-hidden">
              {/* Row header */}
              <button
                className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-card/50 transition-colors"
                onClick={() => setExpanded(open ? null : p.id)}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: `${RISK_COLORS[p.risk]}22`, color: RISK_COLORS[p.risk] }}>
                  {p.name[0]}
                </div>

                {/* Name + region */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text text-sm truncate">{p.name}</div>
                  <div className="text-muted text-xs">{p.region} · {p.age}y · {p.gender === 'M' ? 'Male' : 'Female'}</div>
                </div>

                {/* Type */}
                <div className="hidden sm:block text-xs text-muted w-24 shrink-0 capitalize">{p.type.replace('type','Type ')}</div>

                {/* Risk */}
                <div className="shrink-0"><RiskBadge risk={p.risk} /></div>

                {/* HbA1c */}
                <div className="hidden md:block text-sm font-semibold text-text w-16 text-right shrink-0">{p.hba1c}%</div>

                {/* TIR bar */}
                <div className="hidden lg:block w-28 shrink-0">
                  <TirBar tir={p.tir} />
                </div>

                {/* Expand icon */}
                <div className="text-muted shrink-0">
                  {open ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </div>
              </button>

              {/* Detail panel */}
              {open && (
                <div className="border-t border-border px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left — stats */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-surface rounded-lg p-3 border border-border text-center">
                        <div className="text-xl font-bold text-text">{p.hba1c}%</div>
                        <div className="text-xs text-muted mt-0.5">HbA1c</div>
                      </div>
                      <div className="bg-surface rounded-lg p-3 border border-border text-center">
                        <div className="text-xl font-bold" style={{ color: RISK_COLORS[p.risk] }}>{p.tir}%</div>
                        <div className="text-xs text-muted mt-0.5">TIR</div>
                      </div>
                      <div className="bg-surface rounded-lg p-3 border border-border text-center">
                        <div className="text-xl font-bold text-text">{p.score}</div>
                        <div className="text-xs text-muted mt-0.5">Risk Score</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted uppercase tracking-wide mb-1.5">Risk Score Breakdown</div>
                      {[
                        { label: 'HbA1c contribution',    pct: Math.round(p.hba1c * 5) },
                        { label: 'TIR deficit',           pct: Math.round((100 - p.tir) * 0.6) },
                        { label: 'Age factor',            pct: Math.round(p.age * 0.4) },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2 mb-1.5">
                          <div className="text-xs text-muted w-36 shrink-0">{item.label}</div>
                          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-teal" style={{ width: `${Math.min(100, item.pct)}%` }} />
                          </div>
                          <div className="text-xs text-muted w-6 text-right">{Math.min(100, item.pct)}</div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="text-xs text-muted uppercase tracking-wide mb-1.5">AI Recommendation</div>
                      <div className="text-xs text-text leading-relaxed bg-teal/5 border border-teal/20 rounded-lg p-3">
                        {p.risk === 'critical'
                          ? 'Immediate physician review. HbA1c critically elevated. Start or adjust insulin regimen. Daily contact required.'
                          : p.risk === 'high'
                          ? 'Schedule clinical visit within 14 days. Review medication adherence. Dietary counselling for Tamil Nadu foods.'
                          : p.risk === 'medium'
                          ? 'Monthly follow-up adequate. Focus on lifestyle modifications — 30 min daily walk, switch to low-GI rice varieties.'
                          : 'Continue current management. TIR in target range. Reinforce healthy habits at next annual review.'}
                      </div>
                    </div>
                  </div>

                  {/* Right — mini chart */}
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wide mb-2">7-Day Glucose Trend</div>
                    <MiniGlucoseChart risk={p.risk} />
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                      <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-gold inline-block rounded"/> 180 mg/dL</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-danger inline-block rounded"/> 70 mg/dL</span>
                    </div>

                    <div className="mt-4 text-xs text-muted uppercase tracking-wide mb-2">Diet Summary</div>
                    <div className="text-xs text-text bg-surface border border-border rounded-lg p-3 leading-relaxed">
                      {p.risk === 'critical' || p.risk === 'high'
                        ? 'High refined carb intake detected. Consuming Ponni rice 3×/day. Switch to Mappillai Samba rice + daily Ragi Koozh recommended.'
                        : 'Moderate carb intake. Good sambar consumption. Consider adding Kolhu Rasam for horse gram benefits.'}
                    </div>

                    <button
                      onClick={() => downloadPatientReport(p)}
                      className="btn-ghost mt-4 w-full flex items-center justify-center gap-2 text-sm"
                    >
                      <Download size={14}/> Download Patient Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
