/** @type {import('tailwindcss').Config} */

function withOpacity(variable) {
  return ({ opacityValue }) =>
    opacityValue !== undefined
      ? `rgba(var(${variable}), ${opacityValue})`
      : `rgb(var(${variable}))`
}

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:       'var(--color-bg)',
        card:     'var(--color-card)',
        surface:  'var(--color-surface)',
        border:   'var(--color-border)',
        text:     'var(--color-text)',
        muted:    'var(--color-text-muted)',
        'teal-d': 'var(--teal-d)',
        'blue-l': 'var(--blue-l)',
        teal:    withOpacity('--teal-rgb'),
        danger:  withOpacity('--danger-rgb'),
        gold:    withOpacity('--gold-rgb'),
        success: withOpacity('--success-rgb'),
        blue:    withOpacity('--blue-rgb'),
      },
      fontFamily: {
        sans:    ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        'sm':       'var(--shadow-sm)',
        'card':     'var(--shadow)',
        'lg':       'var(--shadow-lg)',
        'glow':     'var(--shadow-glow)',
        'inner-sm': 'inset 0 1px 2px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'gradient-teal': 'linear-gradient(135deg, var(--teal) 0%, var(--teal-d) 100%)',
        'gradient-card': 'var(--card-gradient)',
      },
      animation: {
        'fade-up':    'fadeUp 0.4s ease forwards',
        'fade-in':    'fadeIn 0.3s ease forwards',
        'slide-in':   'slideIn 0.25s ease forwards',
        'shimmer':    'shimmer 1.5s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: '0' },                                 to: { opacity: '1' }                            },
        slideIn: { from: { opacity: '0', transform: 'translateX(-8px)' },  to: { opacity: '1', transform: 'translateX(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      letterSpacing: {
        'tightest': '-0.05em',
        'widest':   '0.15em',
      },
    },
  },
  plugins: [],
}
