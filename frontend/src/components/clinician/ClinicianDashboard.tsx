import { useState } from 'react'
import { Users, AlertTriangle, TrendingUp, Activity } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { MOCK_PATIENTS, POPULATION_STATS, RISK_COLORS } from '../../data/mockData'
import RiskBadge from '../shared/RiskBadge'
import { useTheme } from '../../hooks/useTheme'

const PIE_DATA = [
  { name: 'Critical', value: POPULATION_STATS.critical, color: RISK_COLORS.critical },
  { name: 'High',     value: POPULATION_STATS.high,     color: RISK_COLORS.high },
  { name: 'Medium',   value: POPULATION_STATS.medium,   color: RISK_COLORS.medium },
  { name: 'Low',      value: POPULATION_STATS.low,      color: RISK_COLORS.low },
]

const TIR_DATA = [
  { region: 'Chennai',     tir: 54 },
  { region: 'Coimbatore',      tir: 61 },
  { region: 'Madurai',     tir: 49 },
  { region: 'Coimbatore',  tir: 63 },
  { region: 'Salem',       tir: 57 },
  { region: 'Tirunelveli', tir: 52 },
]

export default function ClinicianDashboard() {
  const [selected, setSelected] = useState<string | null>(null)
  const { isDark } = useTheme()
  const critical = MOCK_PATIENTS.filter(p => p.risk === 'critical')

  const gridColor    = isDark ? '#1E3A5F' : '#D1DCF0'
  const tickColor    = isDark ? '#8899AA' : '#5A7090'
  const tooltipStyle = {
    background:   isDark ? '#112240' : '#FFFFFF',
    border:       `1px solid ${isDark ? '#1E3A5F' : '#D1DCF0'}`,
    borderRadius: 8,
    fontSize:     12,
    color:        isDark ? '#E8F0FE' : '#0A1628',
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Population Overview</h1>
        <p className="text-muted text-sm mt-0.5">Real-time triage across Tamil Nadu — 10,000 patients</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: POPULATION_STATS.total.toLocaleString(), icon: <Users size={16} className="text-blue-l"/>,        color: 'text-blue-l' },
          { label: 'Critical Risk',  value: POPULATION_STATS.critical,               icon: <AlertTriangle size={16} className="text-danger"/>, color: 'text-danger' },
          { label: 'Population TIR', value: `${POPULATION_STATS.avg_tir}%`,          icon: <Activity size={16} className="text-teal"/>,        color: 'text-teal' },
          { label: 'Avg HbA1c',      value: `${POPULATION_STATS.avg_hba1c}%`,        icon: <TrendingUp size={16} className="text-gold"/>,       color: 'text-gold' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex justify-between mb-2"><span className="stat-label">{s.label}</span>{s.icon}</div>
            <div className={`stat-value ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk distribution */}
        <div className="card">
          <h2 className="font-semibold text-text mb-4">Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                dataKey="value" paddingAngle={3}>
                {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v} patients`, n]} contentStyle={tooltipStyle}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {PIE_DATA.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: d.color }}/>
                <span className="text-xs text-muted">{d.name}: {d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional TIR */}
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-text mb-4">Time-in-Range by Region</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={TIR_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false}/>
              <XAxis dataKey="region" tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false}/>
              <YAxis domain={[0, 100]} tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, 'TIR']}/>
              <Bar dataKey="tir" radius={[4,4,0,0]}>
                {TIR_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.tir >= 65 ? RISK_COLORS.low : entry.tir >= 55 ? RISK_COLORS.medium : RISK_COLORS.high}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Critical patients */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text">
            <span className="text-danger">⚡ Critical Patients</span>
            <span className="text-muted text-sm font-normal ml-2">— requires immediate attention</span>
          </h2>
          <span className="badge-critical">{critical.length} patients</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs uppercase tracking-wide border-b border-border">
                {['Patient','Age','Type','HbA1c','TIR','Risk Score','Region','Action'].map(h => (
                  <th key={h} className="text-left py-2 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_PATIENTS.filter(p => p.risk === 'critical' || p.risk === 'high').map(p => (
                <tr key={p.id}
                  className={`border-b border-border/40 hover:bg-surface/50 cursor-pointer transition-colors
                    ${selected === p.id ? 'bg-surface' : ''}`}
                  onClick={() => setSelected(selected === p.id ? null : p.id)}>
                  <td className="py-3 pr-4 font-medium text-text">{p.name}</td>
                  <td className="py-3 pr-4 text-muted">{p.age}</td>
                  <td className="py-3 pr-4 text-muted capitalize">{p.type}</td>
                  <td className="py-3 pr-4 font-mono text-gold">{p.hba1c}%</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-teal" style={{ width: `${p.tir}%` }}/>
                      </div>
                      <span className="text-muted text-xs">{p.tir}%</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <RiskBadge level={p.risk} score={p.score}/>
                  </td>
                  <td className="py-3 pr-4 text-muted text-xs">{p.region}</td>
                  <td className="py-3">
                    <button className="text-xs text-teal hover:underline">View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
