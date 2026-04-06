import { useEffect, useState, useRef } from 'react'

interface SplashScreenProps {
  onComplete: () => void
}

const GREETINGS = [
  "Initializing metabolic intelligence...",
  "Loading Tamil Nadu food intelligence...",
  "Calibrating your digital twin...",
  "Connecting autonomous health agents...",
  "Preparing personalized glucose insights...",
]

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter')
  const [greeting, setGreeting] = useState('')
  const [greetingVisible, setGreetingVisible] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Detect theme from: app's localStorage theme setting OR system preference
  // Check if the app has a stored theme preference (matches your existing useTheme hook)
  // Also watch for system changes in real time
  useEffect(() => {
    const storedTheme = localStorage.getItem('aether-theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const htmlDark = document.documentElement.classList.contains('dark')
    if (storedTheme === 'light') {
      setIsDark(false)
    } else if (storedTheme === 'dark') {
      setIsDark(true)
    } else if (htmlDark) {
      setIsDark(true)
    } else {
      setIsDark(systemDark)
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (!storedTheme || storedTheme === 'system') setIsDark(e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Pick a random greeting
  useEffect(() => {
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)])
  }, [])

  // Phase timeline
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 700)
    const t2 = setTimeout(() => setGreetingVisible(true), 1200)
    const t3 = setTimeout(() => setPhase('exit'), 3300)
    const t4 = setTimeout(() => onComplete(), 3950)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onComplete])

  // Soft audio pulse — Web Audio API sine wave tone (like Apple startup)
  const playPulse = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioCtxRef.current = ctx

      // Soft sine tone at 432 Hz (healing frequency, calming)
      // Envelope: fade in → hold → fade out (very soft — max 0.06 volume)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(432, ctx.currentTime)
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.4)
      gain.gain.setValueAtTime(0.06, ctx.currentTime + 0.8)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 1.8)

      // Second harmonic — very faint (octave up)
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(864, ctx.currentTime)
      gain2.gain.setValueAtTime(0, ctx.currentTime)
      gain2.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.3)
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
      osc2.start(ctx.currentTime + 0.1)
      osc2.stop(ctx.currentTime + 1.2)
    } catch { /* Audio not available — fail silently */ }
  }

  // Play tone when hold phase starts
  useEffect(() => {
    if (phase === 'hold') playPulse()
  }, [phase])

  // Theme colors
  const bg            = isDark ? '#070E1A' : '#F0F4FF'
  const gridColor     = isDark ? 'rgba(0,201,167,0.04)' : 'rgba(0,120,100,0.06)'
  const glowColor     = isDark ? 'rgba(0,201,167,0.14)' : 'rgba(0,180,140,0.10)'
  const textPrimary   = isDark ? '#FFFFFF' : '#0A1628'
  const textSecondary = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(10,22,40,0.5)'
  const textMuted     = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(10,22,40,0.3)'
  const pillBorder    = isDark ? 'rgba(0,201,167,0.2)' : 'rgba(0,120,100,0.2)'
  const pillBg        = isDark ? 'rgba(0,201,167,0.07)' : 'rgba(0,120,100,0.06)'
  const pillText      = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(10,22,40,0.6)'
  const teal          = '#00C9A7'
  const gold          = '#FFB830'

  return (
    <div
      onClick={onComplete}
      title="Click to skip"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'default',
        overflow: 'hidden',
        // Exit: fade + blur together
        opacity: phase === 'exit' ? 0 : 1,
        filter: phase === 'exit' ? 'blur(8px)' : 'blur(0px)',
        transition: phase === 'exit'
          ? 'opacity 0.65s ease, filter 0.65s ease'
          : 'opacity 0.5s ease, filter 0.5s ease',
      }}
    >
      {/* Grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(${gridColor} 1px, transparent 1px),
          linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
        `,
        backgroundSize: '52px 52px',
        animation: 'gridPulse 5s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Center radial glow */}
      <div style={{
        position: 'absolute',
        width: '700px',
        height: '700px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${glowColor} 0%, transparent 65%)`,
        animation: 'glowPulse 4s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Top-left accent blob */}
      <div style={{
        position: 'absolute',
        top: '-80px',
        left: '-80px',
        width: '340px',
        height: '340px',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(0,201,167,0.07) 0%, transparent 65%)'
          : 'radial-gradient(circle, rgba(0,150,120,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Bottom-right accent blob */}
      <div style={{
        position: 'absolute',
        bottom: '-80px',
        right: '-80px',
        width: '340px',
        height: '340px',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(255,184,48,0.06) 0%, transparent 65%)'
          : 'radial-gradient(circle, rgba(200,140,0,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* ── MAIN CONTENT ── */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: phase === 'enter' ? 'translateY(28px)' : 'translateY(0px)',
        opacity: phase === 'enter' ? 0 : 1,
        transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s ease',
      }}>

        {/* App icon */}
        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '22px',
          background: 'linear-gradient(135deg, #00C9A7 0%, #006B58 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '30px',
          boxShadow: isDark
            ? '0 0 0 1px rgba(0,201,167,0.35), 0 24px 64px rgba(0,201,167,0.28)'
            : '0 0 0 1px rgba(0,180,140,0.25), 0 16px 48px rgba(0,180,140,0.22)',
          animation: phase === 'hold' ? 'iconFloat 3.5s ease-in-out infinite' : 'none',
        }}>
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
            <path
              d="M3 19 L9 19 L12 9 L16 30 L20 13 L23 24 L26 19 L35 19"
              stroke="white"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="19" cy="19" r="15.5" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
          </svg>
        </div>

        {/* AETHER */}
        <div style={{
          fontSize: '54px',
          fontWeight: '800',
          letterSpacing: '14px',
          color: textPrimary,
          fontFamily: "'Trebuchet MS', sans-serif",
          lineHeight: 1,
          marginBottom: '6px',
          textShadow: isDark ? '0 0 40px rgba(255,255,255,0.06)' : 'none',
        }}>
          AETHER
        </div>

        {/* Glyca */}
        <div style={{
          fontSize: '28px',
          fontWeight: '300',
          letterSpacing: '10px',
          color: teal,
          fontFamily: "'Trebuchet MS', sans-serif",
          fontStyle: 'italic',
          marginBottom: '28px',
        }}>
          Glyca
        </div>

        {/* Divider with glow */}
        <div style={{
          width: '200px',
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${teal}, transparent)`,
          marginBottom: '20px',
          opacity: 0.7,
        }} />

        {/* Tagline */}
        <div style={{
          fontSize: '11px',
          color: textSecondary,
          letterSpacing: '3.5px',
          textTransform: 'uppercase',
          fontFamily: 'Calibri, sans-serif',
          fontWeight: '500',
          marginBottom: '40px',
          textAlign: 'center',
        }}>
          Autonomous Metabolic Intelligence
        </div>

        {/* 3 feature pills */}
        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          opacity: phase === 'hold' ? 1 : 0,
          transform: phase === 'hold' ? 'translateY(0)' : 'translateY(14px)',
          transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s',
          marginBottom: '16px',
        }}>
          {[
            { icon: '⚡', text: 'Real-time AI' },
            { icon: '🇮🇳', text: 'Pan-India Foods' },
            { icon: '🔒', text: 'Offline First' },
            { icon: '🗣️', text: '15 Languages' },
          ].map((pill) => (
            <div key={pill.text} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '100px',
              border: `1px solid ${pillBorder}`,
              background: pillBg,
              fontSize: '11px',
              color: pillText,
              letterSpacing: '0.4px',
              fontFamily: 'Calibri, sans-serif',
              whiteSpace: 'nowrap',
            }}>
              <span style={{ fontSize: '13px' }}>{pill.icon}</span>
              {pill.text}
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM SECTION ── */}
      <div style={{
        position: 'absolute',
        bottom: '36px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        paddingInline: '24px',
      }}>
        {/* Dynamic greeting */}
        <div style={{
          fontSize: '11.5px',
          color: isDark ? 'rgba(0,201,167,0.6)' : 'rgba(0,120,100,0.65)',
          letterSpacing: '0.8px',
          fontFamily: "'Courier New', monospace",
          opacity: greetingVisible ? 1 : 0,
          transition: 'opacity 0.5s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: teal,
            animation: 'dotBlink 1s ease-in-out infinite',
          }} />
          {greeting}
        </div>

        {/* Team credit */}
        <div style={{
          fontSize: '10px',
          color: textMuted,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontFamily: 'Calibri, sans-serif',
        }}>
          Team AI Architect · Tamil Nadu, India
        </div>

        {/* Loading progress bar */}
        <div style={{
          width: '140px',
          height: '2px',
          background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${teal}, ${gold})`,
            borderRadius: '4px',
            animation: phase === 'hold' ? 'loadBar 2.4s cubic-bezier(0.4,0,0.2,1) forwards' : 'none',
          }} />
        </div>

        {/* Skip hint */}
        <div style={{
          fontSize: '9px',
          color: textMuted,
          letterSpacing: '1px',
          opacity: phase === 'hold' ? 0.6 : 0,
          transition: 'opacity 0.5s ease 1s',
          fontFamily: 'Calibri, sans-serif',
          marginTop: '-2px',
        }}>
          click anywhere to skip
        </div>
      </div>

      {/* ── KEYFRAMES ── */}
      <style>{`
        @keyframes gridPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes loadBar {
          0%   { width: 0%; }
          15%  { width: 12%; }
          40%  { width: 45%; }
          70%  { width: 72%; }
          90%  { width: 90%; }
          100% { width: 100%; }
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
