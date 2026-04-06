import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { useTheme } from '../../hooks/useTheme'

interface Props { data: Array<{ time: string; glucose: number }> }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  const color = val > 180 ? 'var(--danger)' : val < 70 ? 'var(--gold)' : 'var(--teal)'
  const status = val > 180 ? 'Above target' : val < 70 ? 'Below target' : 'In range ✓'
  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 14,
      padding: '10px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      backdropFilter: 'blur(12px)',
    }}>
      <div className="text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
      <div className="text-xl font-bold tracking-tight" style={{ color, fontFamily: 'Manrope, sans-serif' }}>
        {val} <span className="text-sm font-normal">mg/dL</span>
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{status}</div>
    </div>
  )
}

export default function GlucoseChart({ data }: Props) {
  const { isDark } = useTheme()
  const gridColor = isDark ? 'rgba(30,45,74,0.8)' : 'rgba(226,232,240,0.8)'
  const tickColor = isDark ? '#7A90B0' : '#64748B'

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 12, left: -24, bottom: 0 }}>
        <defs>
          {/* Main area gradient */}
          <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--teal)" stopOpacity={isDark ? 0.35 : 0.25} />
            <stop offset="100%" stopColor="var(--teal)" stopOpacity={0} />
          </linearGradient>
          {/* Stroke gradient (horizontal) */}
          <linearGradient id="glucoseStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="var(--blue-l)" stopOpacity={0.8} />
            <stop offset="50%"  stopColor="var(--teal)"   stopOpacity={1}   />
            <stop offset="100%" stopColor="var(--teal-d)" stopOpacity={0.9} />
          </linearGradient>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <CartesianGrid strokeDasharray="2 4" stroke={gridColor} vertical={false} />

        <XAxis
          dataKey="time"
          tick={{ fill: tickColor, fontSize: 10, fontFamily: 'Inter, sans-serif' }}
          tickLine={false} axisLine={false}
          interval={Math.floor(data.length / 6)}
        />
        <YAxis
          domain={[50, 320]}
          tick={{ fill: tickColor, fontSize: 10, fontFamily: 'Inter, sans-serif' }}
          tickLine={false} axisLine={false}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(var(--teal-rgb),0.3)', strokeWidth: 1, strokeDasharray: '4 4' }} />

        <ReferenceLine y={180} stroke="var(--danger)" strokeDasharray="5 4" strokeOpacity={0.5} strokeWidth={1.5}
          label={{ value: '180', position: 'right', fill: 'var(--danger)', fontSize: 9 }} />
        <ReferenceLine y={70}  stroke="var(--gold)"   strokeDasharray="5 4" strokeOpacity={0.5} strokeWidth={1.5}
          label={{ value: '70',  position: 'right', fill: 'var(--gold)',   fontSize: 9 }} />

        <Area
          type="monotoneX"
          dataKey="glucose"
          stroke="url(#glucoseStroke)"
          strokeWidth={2.5}
          fill="url(#glucoseGrad)"
          dot={false}
          activeDot={{
            r: 5,
            fill: 'var(--teal)',
            stroke: 'var(--color-card)',
            strokeWidth: 2,
            filter: 'url(#glow)',
          }}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
