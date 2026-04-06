import { useState } from 'react'
import { Brain, Zap, CheckCircle, AlertCircle, Clock, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { AGENT_LOGS, POPULATION_STATS, MOCK_PATIENTS } from '../../data/mockData'

const AGENTS = [
  {
    name: 'Triage Agent',
    status: 'active',
    desc: 'Scans all patients, ranks by risk',
    color: 'text-teal',
    last: '2 min ago',
    queueSize: 3,
    health: 99.1,
    recentActions: [
      'Population scan — 10,000 patients complete',
      'Risk re-score: 23 patients updated',
      'Coimbatore region sweep complete',
      'Flagged Murugan S. as critical (score 87)',
      'Vellore district sweep queued',
    ],
  },
  {
    name: 'Clinical Summary Agent',
    status: 'active',
    desc: 'Generates ICD-10 compliant summaries',
    color: 'text-blue-l',
    last: '5 min ago',
    queueSize: 1,
    health: 97.4,
    recentActions: [
      'Generated ICD-10 summary: Murugan S.',
      'Batch report: 12 patients, Madurai zone',
      'ICD-10 batch: E11.65 codes — 97 patients',
      'Rajesh P. summary — E11.65 assigned',
      'Summary queue cleared — 0 pending',
    ],
  },
  {
    name: 'Diet Advisor Agent',
    status: 'active',
    desc: 'Answers patient food queries in real-time',
    color: 'text-success',
    last: '8 min ago',
    queueSize: 0,
    health: 99.9,
    recentActions: [
      'Responded to Kavitha R. food query',
      'Meal plan generated: Priya S.',
      'Tamil Nadu food guide updated: 65 items',
      'Ragi koozh query — answered with TN context',
      'Festival food query (Pongal) — safe foods listed',
    ],
  },
  {
    name: 'Alert Agent',
    status: 'alerting',
    desc: 'Fires critical glucose notifications',
    color: 'text-danger',
    last: 'Just now',
    queueSize: 2,
    health: 100,
    recentActions: [
      'Critical alert — Rajesh P. glucose 340 mg/dL',
      'High risk alert — Sundari M. HbA1c 9.4%',
      'Weekly critical patient summary sent',
      'Post-meal spike alert: Karthik B. 198 mg/dL',
      'SMS batch: 843 high-risk outreach messages',
    ],
  },
  {
    name: 'Metabolic Twin Trainer',
    status: 'active',
    desc: 'Re-trains personalised models on new data',
    color: 'text-gold',
    last: '18 min ago',
    queueSize: 1,
    health: 94.2,
    recentActions: [
      'Re-trained model: Arjun N. (42 samples)',
      'Model drift detected — Meena K. retraining',
      'Prediction accuracy: Priya S. — 91.3%',
      'Twin model v2 deployed for 8 patients',
      'Training data validated — FHIR R4 compliant',
    ],
  },
  {
    name: 'FHIR Sync Agent',
    status: 'active',
    desc: 'Syncs CGM data via FHIR R4 protocol',
    color: 'text-muted',
    last: '25 min ago',
    queueSize: 0,
    health: 100,
    recentActions: [
      'Synced CGM data — 847 patients',
      'R4 compliance check passed — all records',
      'Real-time CGM push — 14 devices connected',
      'Delta sync completed in 1.2s',
      'Next scheduled sync: 25 min',
    ],
  },
]

export default function AgentMonitor() {
  const [running,      setRunning]      = useState(false)
  const [triageResult, setTriageResult] = useState<any>(null)
  const [expanded,     setExpanded]     = useState<string | null>(null)

  const runMockTriage = () => {
    setRunning(true)
    setTimeout(() => {
      setTriageResult({
        critical_patients: ['p1', 'p7'],
        high_risk_patients: ['p2', 'p3', 'p10'],
        population_tir_avg: 58.4,
        key_interventions: [
          'Immediate outreach to 97 critical-risk patients — glucose above 300 mg/dL',
          'Population-level dietary messaging: switch from Ponni to Mappillai Samba rice',
          'Schedule 843 high-risk patients for clinic review within 14 days',
        ],
        agent_summary: 'Population health status shows 1.4% critical risk requiring immediate intervention. Time-in-Range has improved 4.2% since last month across all monitored regions in Tamil Nadu.'
      })
      setRunning(false)
    }, 2500)
  }

  return (
    <div className="p-6 space-y-6 accent-agents">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Brain size={22} className="text-gold"/> Agent Monitor
          </h1>
          <p className="text-muted text-sm mt-0.5">6 autonomous agents · Real-time clinical intelligence</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={runMockTriage} disabled={running}>
          {running ? <RefreshCw size={15} className="animate-spin"/> : <Zap size={15}/>}
          {running ? 'Running Triage…' : 'Run Population Triage'}
        </button>
      </div>

      {/* Agent grid — expandable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENTS.map(a => {
          const open = expanded === a.name
          return (
            <div key={a.name}
              className={`card border transition-colors cursor-pointer select-none
                ${open ? 'border-teal/40' : 'border-border hover:border-teal/30'}`}
              onClick={() => setExpanded(open ? null : a.name)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`text-sm font-semibold ${a.color}`}>{a.name}</div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 text-xs
                    ${a.status === 'alerting' ? 'text-danger' : 'text-success'}`}>
                    {a.status === 'alerting'
                      ? <AlertCircle size={12} className="animate-pulse"/>
                      : <CheckCircle size={12}/>}
                    {a.status}
                  </div>
                  {open ? <ChevronUp size={14} className="text-muted"/> : <ChevronDown size={14} className="text-muted"/>}
                </div>
              </div>
              <p className="text-muted text-xs leading-relaxed mb-3">{a.desc}</p>

              <div className="flex items-center justify-between text-xs text-muted mb-0">
                <div className="flex items-center gap-1"><Clock size={10}/> {a.last}</div>
                <div>Health: <span className={a.health > 98 ? 'text-success' : a.health > 90 ? 'text-gold' : 'text-danger'}>{a.health}%</span></div>
              </div>

              {/* Expanded details */}
              {open && (
                <div className="mt-4 pt-4 border-t border-border space-y-3"
                  onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Queue size</span>
                    <span className={`font-semibold ${a.queueSize > 0 ? 'text-gold' : 'text-success'}`}>
                      {a.queueSize} {a.queueSize === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-muted mb-2">Last 5 actions</div>
                    <div className="space-y-1.5">
                      {a.recentActions.map((action, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-teal mt-0.5 shrink-0">›</span>
                          <span className="text-text leading-snug">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Triage result */}
      {triageResult && (
        <div className="card border border-teal/30">
          <h2 className="font-semibold text-teal mb-4 flex items-center gap-2">
            <Zap size={16}/> Triage Result — {new Date().toLocaleTimeString()}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-danger/10 border border-danger/30 rounded-lg p-3">
              <div className="text-danger text-2xl font-bold">{triageResult.critical_patients.length}</div>
              <div className="text-xs text-muted mt-0.5">Critical — Immediate Action</div>
              <div className="text-xs text-danger mt-2">
                {MOCK_PATIENTS.filter(p => triageResult.critical_patients.includes(p.id)).map(p => p.name).join(', ')}
              </div>
            </div>
            <div className="bg-gold/10 border border-gold/30 rounded-lg p-3">
              <div className="text-gold text-2xl font-bold">{triageResult.high_risk_patients.length}</div>
              <div className="text-xs text-muted mt-0.5">High Risk — Priority Review</div>
            </div>
            <div className="bg-teal/10 border border-teal/30 rounded-lg p-3">
              <div className="text-teal text-2xl font-bold">{triageResult.population_tir_avg}%</div>
              <div className="text-xs text-muted mt-0.5">Population Time-in-Range</div>
            </div>
          </div>

          <div className="bg-surface rounded-lg p-4 mb-3 border border-border">
            <div className="text-xs text-muted uppercase tracking-wide mb-2">Agent Clinical Summary</div>
            <p className="text-sm text-text leading-relaxed">{triageResult.agent_summary}</p>
          </div>

          <div>
            <div className="text-xs text-muted uppercase tracking-wide mb-2">Recommended Interventions</div>
            {triageResult.key_interventions.map((item: string, i: number) => (
              <div key={i} className="flex items-start gap-2 py-2 border-b border-border/50 last:border-0">
                <span className="text-teal font-bold text-sm">{i + 1}.</span>
                <p className="text-sm text-text">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live agent log */}
      <div className="card">
        <h2 className="font-semibold text-text mb-4">Live Agent Log</h2>
        <div className="space-y-2">
          {AGENT_LOGS.map(log => (
            <div key={log.id} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
              <div className={`w-2 h-2 rounded-full shrink-0
                ${log.status === 'alert'   ? 'bg-danger animate-pulse'
                : log.status === 'running' ? 'bg-gold animate-pulse'
                :                           'bg-success'}`}/>
              <div className="flex-1 min-w-0">
                <span className="text-gold text-xs font-medium">{log.agent}</span>
                <span className="text-muted text-xs mx-2">·</span>
                <span className="text-text text-xs">{log.action}</span>
              </div>
              <span className="text-muted text-xs shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
