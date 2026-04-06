import { useState } from 'react'
import { Zap, RefreshCw, CheckCircle, Clock, Download } from 'lucide-react'
import { MOCK_PATIENTS } from '../../data/mockData'

const STEPS = [
  { label: 'Initialising agent swarm',               detail: 'Launching 5 autonomous agents in parallel' },
  { label: 'Fetching CGM & FHIR records',            detail: 'Pulling 7-day glucose data for all patients' },
  { label: 'Running ML risk classification',          detail: 'XGBoost + LightGBM ensemble scoring' },
  { label: 'Generating ICD-10 clinical summaries',   detail: 'GPT-4 class LLM with clinical fine-tune' },
]

interface RunResult {
  timestamp: string
  duration: string
  patients_processed: number
  critical: number
  high: number
  medium: number
  low: number
  avg_hba1c: number
  avg_tir: number
  alerts_fired: number
  interventions: string[]
}

export default function TriageRunPage() {
  const [step,   setStep]   = useState(0)
  const [result, setResult] = useState<RunResult | null>(null)
  const start = Date.now()

  const runTriage = () => {
    if (step > 0 && step <= STEPS.length) return
    setResult(null)
    setStep(1)

    STEPS.forEach((_, i) => {
      setTimeout(() => {
        setStep(i + 2)
        if (i === STEPS.length - 1) {
          const elapsed = ((Date.now() - start) / 1000).toFixed(1)
          setResult({
            timestamp:           new Date().toISOString(),
            duration:            `${elapsed}s`,
            patients_processed:  MOCK_PATIENTS.length,
            critical:            MOCK_PATIENTS.filter(p => p.risk === 'critical').length,
            high:                MOCK_PATIENTS.filter(p => p.risk === 'high').length,
            medium:              MOCK_PATIENTS.filter(p => p.risk === 'medium').length,
            low:                 MOCK_PATIENTS.filter(p => p.risk === 'low').length,
            avg_hba1c:           parseFloat((MOCK_PATIENTS.reduce((s,p)=>s+p.hba1c,0)/MOCK_PATIENTS.length).toFixed(1)),
            avg_tir:             parseFloat((MOCK_PATIENTS.reduce((s,p)=>s+p.tir,0)/MOCK_PATIENTS.length).toFixed(1)),
            alerts_fired:        2,
            interventions: [
              'Critical patients flagged for immediate physician outreach',
              'Population dietary messaging: Mappillai Samba rice switch campaign',
              'High-risk 14-day clinic appointment batch generated',
              'Medium-risk SMS campaign queued — 30 min walk programme',
            ],
          })
        }
      }, i * 1500 + 1200)
    })
  }

  const downloadJson = () => {
    if (!result) return
    const blob = new Blob([JSON.stringify({ triage_run: result, patients: MOCK_PATIENTS }, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `triage_run_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const running = step >= 1 && step <= STEPS.length

  return (
    <div className="p-6 space-y-6 accent-agents">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Zap size={22} className="text-gold"/> Triage Run
          </h1>
          <p className="text-muted text-sm mt-0.5">Step-by-step agent execution monitor</p>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <button onClick={downloadJson} className="btn-ghost flex items-center gap-2 text-sm">
              <Download size={14}/> Export JSON
            </button>
          )}
          <button onClick={runTriage} disabled={running} className="btn-primary flex items-center gap-2">
            {running
              ? <><RefreshCw size={15} className="animate-spin"/> Running…</>
              : <><Zap size={15}/> Start Triage Run</>}
          </button>
        </div>
      </div>

      {/* Step tracker */}
      <div className="card">
        <h2 className="font-semibold text-text mb-4">Execution Steps</h2>
        <div className="space-y-3">
          {STEPS.map((s, i) => {
            const done   = step > i + 1
            const active = step === i + 1
            const idle   = step <= i
            return (
              <div key={i} className={`flex items-start gap-4 p-3 rounded-lg border transition-all duration-500
                ${done   ? 'border-teal/30 bg-teal/5'
                : active ? 'border-gold/30 bg-gold/5'
                :          'border-border'}`}>
                <div className={`mt-0.5 shrink-0 ${done ? 'text-teal' : active ? 'text-gold' : 'text-muted'}`}>
                  {done
                    ? <CheckCircle size={18}/>
                    : active
                    ? <RefreshCw size={18} className="animate-spin"/>
                    : <Clock size={18}/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${done ? 'text-teal' : active ? 'text-gold' : idle ? 'text-muted' : 'text-text'}`}>
                    Step {i + 1}: {s.label}
                  </div>
                  <div className="text-xs text-muted mt-0.5">{s.detail}</div>
                </div>
                <div className="text-xs text-muted shrink-0 mt-0.5">
                  {done ? '✓ done' : active ? 'running…' : 'queued'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <div className="card border-gold/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gold flex items-center gap-2">
                <CheckCircle size={16}/> Run Complete
              </h2>
              <div className="text-xs text-muted">
                {new Date(result.timestamp).toLocaleTimeString()} · {result.duration}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { label:'Processed',  value: result.patients_processed, color:'text-text'    },
                { label:'Critical',   value: result.critical,            color:'text-danger'  },
                { label:'Avg HbA1c',  value: `${result.avg_hba1c}%`,    color:'text-gold'    },
                { label:'Avg TIR',    value: `${result.avg_tir}%`,      color:'text-teal'    },
              ].map(s => (
                <div key={s.label} className="bg-surface border border-border rounded-lg p-3 text-center">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-muted mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="text-xs text-muted uppercase tracking-wide mb-2">Triggered Interventions</div>
              {result.interventions.map((item, i) => (
                <div key={i} className="flex items-start gap-2 py-2 border-b border-border/40 last:border-0">
                  <span className="text-gold font-bold text-sm shrink-0">{i+1}.</span>
                  <p className="text-sm text-text">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* JSON preview */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-text text-sm">JSON Output Preview</h2>
              <button onClick={downloadJson} className="text-xs text-teal hover:underline flex items-center gap-1">
                <Download size={12}/> Download
              </button>
            </div>
            <pre className="text-xs font-mono text-muted bg-surface border border-border rounded-lg p-4 overflow-x-auto max-h-48 overflow-y-auto">
{JSON.stringify({ triage_run: { ...result, patients: undefined }, meta: { model:'AETHER-Glyca v1.0', region:'Tamil Nadu' } }, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
