import { useState, useEffect, useCallback } from 'react'
import { FileText, RefreshCw, Filter } from 'lucide-react'
import { AGENT_LOGS } from '../../data/mockData'

type LogEntry = { id: string; agent: string; action: string; time: string; status: string }

const ALL_AGENTS = ['All', ...Array.from(new Set(AGENT_LOGS.map(l => l.agent)))]

const EXTRA_LOGS: Omit<LogEntry, 'id'>[] = [
  { agent:'Triage Agent',           action:'Incremental scan — Vellore district (42 patients)',     time:'just now', status:'done'    },
  { agent:'Diet Advisor',           action:'Ragi koozh query — Lakshmi D.',                        time:'just now', status:'done'    },
  { agent:'Alert Agent',            action:'Post-meal spike alert — Karthik B. 198 mg/dL',         time:'just now', status:'alert'   },
  { agent:'FHIR Sync Agent',        action:'Real-time CGM push — 14 devices connected',            time:'just now', status:'done'    },
  { agent:'Metabolic Twin',         action:'Prediction accuracy updated: 91.3% for Priya S.',      time:'just now', status:'done'    },
  { agent:'Clinical Summary Agent', action:'Auto-summary triggered: Meena K. 30-day review',       time:'just now', status:'done'    },
]

export default function LogsPage() {
  const [logs,      setLogs]      = useState<LogEntry[]>(AGENT_LOGS)
  const [filter,    setFilter]    = useState('All')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<string>('')
  let extraIdx = 0

  const addRandomLog = useCallback(() => {
    const entry = EXTRA_LOGS[extraIdx % EXTRA_LOGS.length]
    extraIdx++
    const newLog: LogEntry = {
      id:     `auto-${Date.now()}`,
      ...entry,
      time:   new Date().toLocaleTimeString(),
    }
    setLogs(prev => [newLog, ...prev].slice(0, 50))
    setLastRefresh(new Date().toLocaleTimeString())
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(addRandomLog, 30000)
    return () => clearInterval(id)
  }, [autoRefresh, addRandomLog])

  const filtered = filter === 'All' ? logs : logs.filter(l => l.agent === filter)

  return (
    <div className="p-6 space-y-6 accent-agents">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <FileText size={22} className="text-gold"/> Agent Logs
          </h1>
          <p className="text-muted text-sm mt-0.5">
            {logs.length} entries · {lastRefresh ? `Last updated ${lastRefresh}` : 'Live feed'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setAutoRefresh(v => !v) }}
            className={`btn-ghost flex items-center gap-2 text-sm ${autoRefresh ? 'border-teal/50 text-teal' : ''}`}
          >
            <RefreshCw size={14} className={autoRefresh ? 'animate-spin' : ''}/>
            {autoRefresh ? 'Auto ON' : 'Auto OFF'}
          </button>
          <button onClick={addRandomLog} className="btn-primary flex items-center gap-2 text-sm">
            <RefreshCw size={14}/> Refresh
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-muted shrink-0"/>
        {ALL_AGENTS.map(agent => (
          <button
            key={agent}
            onClick={() => setFilter(agent)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
              ${filter === agent
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'bg-card border border-border text-muted hover:text-text'}`}
          >
            {agent}
          </button>
        ))}
      </div>

      {/* Log table */}
      <div className="card p-0">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-text">
            {filtered.length} {filter !== 'All' ? `${filter} ` : ''}entries
          </span>
          {autoRefresh && (
            <span className="text-xs text-teal flex items-center gap-1">
              <RefreshCw size={10} className="animate-spin"/> Auto-refresh every 30s
            </span>
          )}
        </div>
        <div className="divide-y divide-border/40">
          {filtered.map((log, i) => (
            <div
              key={log.id}
              className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-card/30
                ${i === 0 && log.time === 'just now' ? 'bg-teal/3' : ''}`}
            >
              <div className={`w-2 h-2 rounded-full shrink-0
                ${log.status === 'alert'   ? 'bg-danger animate-pulse'
                : log.status === 'running' ? 'bg-gold animate-pulse'
                :                           'bg-success'}`}/>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-gold shrink-0">{log.agent}</span>
                  <span className="text-muted text-xs">·</span>
                  <span className="text-text text-xs truncate">{log.action}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${log.status === 'alert'   ? 'bg-danger/20 text-danger'
                  : log.status === 'running' ? 'bg-gold/20 text-gold'
                  :                           'bg-success/20 text-success'}`}>
                  {log.status}
                </span>
                <span className="text-muted text-xs w-20 text-right">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
