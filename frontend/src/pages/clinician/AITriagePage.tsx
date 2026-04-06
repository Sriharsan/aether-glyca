import { useState } from 'react'
import { Zap, RefreshCw, CheckCircle, X, AlertCircle, Clock, Users } from 'lucide-react'
import { MOCK_PATIENTS, RISK_COLORS } from '../../data/mockData'

const TRIAGE_STEPS = [
  { id: 1, label: 'Fetching patient glucose records…',       agent: 'FHIR Sync Agent' },
  { id: 2, label: 'Running ML risk classification model…',   agent: 'Triage Agent' },
  { id: 3, label: 'Generating ICD-10 clinical summaries…',  agent: 'Clinical Summary Agent' },
  { id: 4, label: 'Compiling intervention recommendations…', agent: 'Alert Agent' },
]

const ICD_CODES: Record<string, { code: string; desc: string }[]> = {
  critical: [
    { code: 'E11.65', desc: 'Type 2 diabetes mellitus with hyperglycemia' },
    { code: 'E11.51', desc: 'Type 2 DM with diabetic mononeuropathy' },
    { code: 'Z87.39', desc: 'Personal history of other endocrine disorders' },
  ],
  high: [
    { code: 'E11.9',  desc: 'Type 2 diabetes mellitus without complications' },
    { code: 'E11.43', desc: 'Type 2 DM with diabetic autonomic neuropathy' },
  ],
  medium: [
    { code: 'E11.9',  desc: 'Type 2 diabetes mellitus without complications' },
    { code: 'Z83.3',  desc: 'Family history of diabetes mellitus' },
  ],
  low: [
    { code: 'E11.9',  desc: 'Type 2 diabetes mellitus without complications' },
    { code: 'Z87.39', desc: 'Personal history of other endocrine disorders' },
  ],
}

interface TriageResult {
  critical: typeof MOCK_PATIENTS
  high: typeof MOCK_PATIENTS
  medium: typeof MOCK_PATIENTS
  low: typeof MOCK_PATIENTS
  interventions: string[]
  summary: string
  timestamp: string
}

export default function AITriagePage() {
  const [step,      setStep]      = useState(0)          // 0 = idle, 1-4 = running, 5 = done
  const [result,    setResult]    = useState<TriageResult | null>(null)
  const [icdModal,  setIcdModal]  = useState<string | null>(null)

  const runTriage = () => {
    if (step > 0 && step < 5) return
    setResult(null)
    setStep(1)

    TRIAGE_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setStep(i + 2)
        if (i === TRIAGE_STEPS.length - 1) {
          // done
          setResult({
            critical:    MOCK_PATIENTS.filter(p => p.risk === 'critical'),
            high:        MOCK_PATIENTS.filter(p => p.risk === 'high'),
            medium:      MOCK_PATIENTS.filter(p => p.risk === 'medium'),
            low:         MOCK_PATIENTS.filter(p => p.risk === 'low'),
            interventions: [
              `Immediate outreach to ${MOCK_PATIENTS.filter(p=>p.risk==='critical').length} critical-risk patients — glucose above 300 mg/dL`,
              'Population-level dietary messaging: switch from Ponni to Mappillai Samba rice',
              `Schedule ${MOCK_PATIENTS.filter(p=>p.risk==='high').length} high-risk patients for clinic review within 14 days`,
              'Deploy diet advisor push notifications to medium-risk cohort',
              'Flag critical patients for endocrinologist escalation — ICD E11.65',
            ],
            summary: `Population triage complete. ${MOCK_PATIENTS.filter(p=>p.risk==='critical').length} patients flagged as critical requiring immediate intervention. Average HbA1c across population: ${(MOCK_PATIENTS.reduce((s,p)=>s+p.hba1c,0)/MOCK_PATIENTS.length).toFixed(1)}%. Time-in-Range improved 4.2% since last month across all monitored regions in Tamil Nadu.`,
            timestamp: new Date().toLocaleTimeString(),
          })
        }
      }, i * 1500 + 1500)
    })
  }

  const running = step >= 1 && step <= 4

  return (
    <div className="p-6 space-y-6 accent-clinician">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Zap size={22} className="text-blue-l"/> AI Triage
          </h1>
          <p className="text-muted text-sm mt-0.5">Autonomous population-level risk classification</p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={runTriage}
          disabled={running}
        >
          {running
            ? <><RefreshCw size={15} className="animate-spin"/> Running Triage…</>
            : <><Zap size={15}/> Run Population Triage</>}
        </button>
      </div>

      {/* Agent status cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TRIAGE_STEPS.map((s, i) => {
          const done    = step > i + 1
          const active  = step === i + 1
          return (
            <div key={s.id} className={`card p-3 border transition-all duration-500
              ${done   ? 'border-teal/40 bg-teal/5'
              : active ? 'border-blue/40 bg-blue/5'
              :          'border-border'}`}>
              <div className="flex items-center gap-2 mb-2">
                {done
                  ? <CheckCircle size={14} className="text-teal shrink-0"/>
                  : active
                  ? <RefreshCw size={14} className="text-blue-l animate-spin shrink-0"/>
                  : <Clock size={14} className="text-muted shrink-0"/>}
                <span className={`text-xs font-semibold
                  ${done ? 'text-teal' : active ? 'text-blue-l' : 'text-muted'}`}>
                  Step {s.id}
                </span>
              </div>
              <p className="text-xs text-text leading-snug">{s.label}</p>
              <p className="text-xs text-muted mt-1">{s.agent}</p>
            </div>
          )
        })}
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Summary */}
          <div className="card border-teal/30">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-teal flex items-center gap-2">
                <Zap size={16}/> Triage Complete — {result.timestamp}
              </h2>
              <span className="text-xs text-muted">{MOCK_PATIENTS.length} patients analysed</span>
            </div>
            <p className="text-sm text-text leading-relaxed">{result.summary}</p>
          </div>

          {/* Risk breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['critical','high','medium','low'] as const).map(risk => {
              const pts = result[risk]
              return (
                <div key={risk}
                  className="card cursor-pointer hover:border-teal/40 transition-colors"
                  onClick={() => setIcdModal(risk)}
                  title="Click to view ICD-10 codes"
                >
                  <div className="text-3xl font-bold mb-1" style={{ color: RISK_COLORS[risk] }}>
                    {pts.length}
                  </div>
                  <div className="text-xs text-muted capitalize font-medium mb-2">{risk} risk</div>
                  <div className="text-xs text-muted leading-relaxed">
                    {pts.map(p => p.name.split(' ')[0]).join(', ') || '—'}
                  </div>
                  <div className="text-xs text-teal mt-2 hover:underline">View ICD-10 →</div>
                </div>
              )
            })}
          </div>

          {/* Patient grid */}
          <div className="card">
            <h2 className="font-semibold text-text mb-4 flex items-center gap-2">
              <Users size={16}/> Patient Risk Matrix
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted uppercase tracking-wide">
                    <th className="text-left pb-2 font-medium">Patient</th>
                    <th className="text-left pb-2 font-medium">Region</th>
                    <th className="text-center pb-2 font-medium">Risk</th>
                    <th className="text-center pb-2 font-medium">HbA1c</th>
                    <th className="text-center pb-2 font-medium">TIR</th>
                    <th className="text-left pb-2 font-medium">ICD-10</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PATIENTS.sort((a,b) => b.score - a.score).map(p => (
                    <tr key={p.id} className="border-b border-border/40 hover:bg-card/30">
                      <td className="py-2.5 font-medium text-text">{p.name}</td>
                      <td className="py-2.5 text-muted text-xs">{p.region}</td>
                      <td className="py-2.5 text-center">
                        <span className={p.risk === 'critical' ? 'badge-critical'
                          : p.risk === 'high' ? 'badge-high'
                          : p.risk === 'medium' ? 'badge-medium' : 'badge-low'}>
                          {p.risk}
                        </span>
                      </td>
                      <td className="py-2.5 text-center font-semibold" style={{ color: RISK_COLORS[p.risk] }}>{p.hba1c}%</td>
                      <td className="py-2.5 text-center text-muted">{p.tir}%</td>
                      <td className="py-2.5 text-xs text-muted">
                        {ICD_CODES[p.risk]?.[0]?.code ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interventions */}
          <div className="card">
            <h2 className="font-semibold text-text mb-4">Recommended Interventions</h2>
            <div className="space-y-3">
              {result.interventions.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
                  <span className="text-teal font-bold text-sm shrink-0">{i + 1}.</span>
                  <p className="text-sm text-text">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ICD-10 Modal */}
      {icdModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text capitalize flex items-center gap-2">
                <AlertCircle size={16} style={{ color: RISK_COLORS[icdModal] }}/>
                ICD-10 Codes — {icdModal} risk
              </h2>
              <button onClick={() => setIcdModal(null)} className="text-muted hover:text-text">
                <X size={18}/>
              </button>
            </div>
            <div className="space-y-3">
              {ICD_CODES[icdModal]?.map(c => (
                <div key={c.code} className="bg-surface border border-border rounded-lg p-3">
                  <div className="font-mono text-sm font-semibold text-teal">{c.code}</div>
                  <div className="text-xs text-text mt-0.5">{c.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setIcdModal(null)} className="btn-primary w-full mt-4">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
