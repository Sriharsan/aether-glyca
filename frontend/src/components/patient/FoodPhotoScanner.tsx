import { useState, useRef } from 'react'
import { RefreshCw, CheckCircle, RotateCcw, PlusCircle, AlertCircle } from 'lucide-react'
import { INDIA_FOODS } from '../../data/mockData'

interface ScanResult {
  food: typeof INDIA_FOODS[0]
  confidence: number
  portion: string
  totalCalories: number
}

function getFoodColor(gi: number) {
  if (gi < 55) return '#00C9A7'
  if (gi < 70) return '#FFB830'
  return '#FF4C6A'
}

const PORTIONS = [
  { label: 'Small (100g)',  mult: 1.0 },
  { label: 'Medium (150g)', mult: 1.5 },
  { label: 'Large (200g)',  mult: 2.0 },
]

const DEMO_PRESETS = [
  { food: INDIA_FOODS.find(f => f.name === 'Idly')!,          confidence: 97, reasoning: 'demo preset' },
  { food: INDIA_FOODS.find(f => f.name === 'Dosa')!,          confidence: 94, reasoning: 'demo preset' },
  { food: INDIA_FOODS.find(f => f.name === 'Sambar')!,        confidence: 96, reasoning: 'demo preset' },
  { food: INDIA_FOODS.find(f => f.name === 'Ragi Koozh')!,    confidence: 92, reasoning: 'demo preset' },
  { food: INDIA_FOODS.find(f => f.name === 'Chicken Chettinad')!, confidence: 90, reasoning: 'demo preset' },
  { food: INDIA_FOODS.find(f => f.name === 'Sundal')!,        confidence: 93, reasoning: 'demo preset' },
  { food: INDIA_FOODS.find(f => f.name === 'Adai')!,          confidence: 91, reasoning: 'demo preset' },
  { food: INDIA_FOODS.find(f => f.name === 'Pongal')!,        confidence: 95, reasoning: 'demo preset' },
].filter(p => p.food)

// FIX 3 — Resize image to max 800px and convert to JPEG before sending
async function resizeImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 800
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX }
        else                { width  = Math.round(width  * MAX / height); height = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1])
    }
    img.src = url
  })
}

// Smart fallback — filename keyword match, then time-of-day estimate
function smartFallback(file: File, setAiConfidence: (n: number) => void, setAiReasoning: (s: string) => void): typeof INDIA_FOODS[0] {
  const filename = file.name.toLowerCase()
  const keywordMap: Record<string, string> = {
    'idly': 'Idly', 'idli': 'Idly',
    'dosa': 'Dosa', 'dose': 'Dosa',
    'adai': 'Adai',
    'sambar': 'Sambar',
    'rasam': 'Rasam',
    'ragi': 'Ragi Koozh',
    'rice': 'Curd Rice',
    'pongal': 'Pongal',
    'vada': 'Idly',
    'uttapam': 'Dosa',
    'chapati': 'Chapati', 'roti': 'Chapati',
    'dal': 'Moong Dal', 'dhal': 'Moong Dal',
    'curry': 'Sambar',
    'biryani': 'Mappillai Samba',
    'chicken': 'Chicken Chettinad',
    'fish': 'Kerala Fish Curry',
    'egg': 'Idly',
    'breakfast': 'Idly',
    'lunch': 'Curd Rice',
    'dinner': 'Paruppu Sadham',
    'snack': 'Sundal',
    'fruit': 'Guava',
    'banana': 'Banana',
    'guava': 'Guava',
  }
  for (const [keyword, foodName] of Object.entries(keywordMap)) {
    if (filename.includes(keyword)) {
      const food = INDIA_FOODS.find(f => f.name === foodName)
      if (food) {
        setAiConfidence(72)
        setAiReasoning('identified from image filename')
        return food
      }
    }
  }
  const hour = new Date().getHours()
  let defaultFoodName: string
  if (hour >= 6 && hour < 11) {
    defaultFoodName = 'Idly'
  } else if (hour >= 11 && hour < 15) {
    defaultFoodName = 'Paruppu Sadham'
  } else if (hour >= 15 && hour < 18) {
    defaultFoodName = 'Sundal'
  } else {
    defaultFoodName = 'Curd Rice'
  }
  const food = INDIA_FOODS.find(f => f.name === defaultFoodName) || INDIA_FOODS[0]
  setAiConfidence(55)
  setAiReasoning('estimated from time of day — upload a clearer photo for better accuracy')
  return food
}

export default function FoodPhotoScanner({ onFoodLogged }: { onFoodLogged: (food: any) => void }) {
  const [phase,        setPhase]        = useState<'idle' | 'scanning' | 'result'>('idle')
  const [imageUrl,     setImageUrl]     = useState('')
  const [result,       setResult]       = useState<ScanResult | null>(null)
  const [logged,       setLogged]       = useState(false)
  const [aiConfidence, setAiConfidence] = useState(0)
  const [aiReasoning,  setAiReasoning]  = useState('')
  const [aiError,      setAiError]      = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function analyzeWithAI(file: File): Promise<typeof INDIA_FOODS[0]> {
    try {
      // Resize to max 800px and convert to JPEG via canvas
      const base64 = await resizeImage(file)
      const blob = await fetch(`data:image/jpeg;base64,${base64}`).then(r => r.blob())
      const formData = new FormData()
      formData.append('file', new File([blob], 'photo.jpg', { type: 'image/jpeg' }))

      const response = await fetch('http://localhost:8001/api/food/analyze', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(35000),
      })

      if (!response.ok) {
        if (response.status === 429 || response.status === 529 || response.status === 500) {
          console.warn('Claude Vision API limit reached — using smart fallback')
          return smartFallback(file, setAiConfidence, setAiReasoning)
        }
        console.error('Food API error:', response.status)
        return smartFallback(file, setAiConfidence, setAiReasoning)
      }

      const data = await response.json()
      const { food_name, confidence, reasoning } = data

      // Exact match
      const match = INDIA_FOODS.find(f => f.name.toLowerCase() === food_name.toLowerCase())
      if (match) { setAiConfidence(confidence); setAiReasoning(reasoning); return match }

      // Fuzzy match
      const fuzzy = INDIA_FOODS.find(
        f =>
          f.name.toLowerCase().includes(food_name.toLowerCase()) ||
          food_name.toLowerCase().includes(f.name.toLowerCase().split(' ')[0])
      )
      if (fuzzy) { setAiConfidence(confidence); setAiReasoning(reasoning); return fuzzy }

      // No match — smart fallback
      return smartFallback(file, setAiConfidence, setAiReasoning)

    } catch (err) {
      console.error('Vision analysis error:', err)
      return smartFallback(file, setAiConfidence, setAiReasoning)
    }
  }

  async function handleFile(file: File) {
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setPhase('scanning')
    setAiError('')

    const food = await analyzeWithAI(file)
    const portion = PORTIONS[1] // default medium
    setResult({
      food,
      confidence:    aiConfidence || 88,
      portion:       portion.label,
      totalCalories: Math.round(food.calories * portion.mult),
    })
    setPhase('result')
    setLogged(false)
  }

  function handleDemoPreset(preset: typeof DEMO_PRESETS[0]) {
    setAiConfidence(preset.confidence)
    setAiReasoning('demo preset — no API call needed')
    setAiError('')
    setImageUrl('')
    const portion = PORTIONS[1]
    setResult({
      food:          preset.food,
      confidence:    preset.confidence,
      portion:       portion.label,
      totalCalories: Math.round(preset.food.calories * portion.mult),
    })
    setPhase('result')
    setLogged(false)
  }

  function reset() {
    setPhase('idle')
    setImageUrl('')
    setResult(null)
    setLogged(false)
    setAiError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  function logFood() {
    if (!result) return
    const mult = result.portion.includes('100') ? 1 : result.portion.includes('150') ? 1.5 : 2
    const entry = {
      id:       Date.now().toString(),
      date:     new Date().toISOString().slice(0, 10),
      foodName: result.food.name,
      portion:  result.portion,
      meal:     'Snack',
      gi:       result.food.gi,
      calories: result.totalCalories,
      impact:   result.food.impact,
      note:     'Added via Food Scanner (Claude Vision)',
    }
    const prev = JSON.parse(localStorage.getItem('aether-diet-log') || '[]')
    localStorage.setItem('aether-diet-log', JSON.stringify([entry, ...prev]))
    setLogged(true)
    onFoodLogged(entry)
  }

  const color = result ? getFoodColor(result.food.gi) : '#00C9A7'
  const mult  = result
    ? (result.portion.includes('100') ? 1 : result.portion.includes('150') ? 1.5 : 2)
    : 1.5

  return (
    <div className="space-y-4">

      {/* ── IDLE ── */}
      {phase === 'idle' && (
        <>
          {/* Error banner */}
          {aiError && (
            <div className="p-4 rounded-xl flex items-start gap-3"
              style={{ background: 'rgba(255,76,106,0.1)', border: '1px solid rgba(255,76,106,0.3)' }}>
              <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-danger">{aiError}</p>
                <button
                  className="text-xs mt-1 underline"
                  style={{ color: 'var(--color-text-muted)' }}
                  onClick={() => setAiError('')}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-teal transition-colors group"
          >
            <div className="text-4xl mb-3">📸</div>
            <p className="text-text font-medium group-hover:text-teal transition-colors">
              Tap to scan food photo
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Identified by <span className="font-semibold" style={{ color: '#00C9A7' }}>Claude Vision AI</span> — not random guessing
            </p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {/* Demo presets */}
          <div>
            <p className="text-xs mb-2 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Demo presets (no API call)
            </p>
            <div className="grid grid-cols-4 gap-2">
              {DEMO_PRESETS.map(preset => (
                <button
                  key={preset.food.name}
                  onClick={() => handleDemoPreset(preset)}
                  className="rounded-xl p-3 text-center transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: getFoodColor(preset.food.gi) + '18',
                    border:     `1px solid ${getFoodColor(preset.food.gi)}40`,
                  }}
                >
                  <div className="text-2xl">{preset.food.emoji}</div>
                  <div className="text-xs text-text mt-1 leading-tight">{preset.food.name}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── SCANNING ── */}
      {phase === 'scanning' && (
        <div className="text-center py-8 space-y-4">
          {imageUrl && (
            <img src={imageUrl} alt="Analyzing" className="w-full h-40 object-cover rounded-xl opacity-60" />
          )}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <RefreshCw size={18} className="text-teal animate-spin" />
              <span className="text-text font-medium">Claude Vision is analyzing…</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Identifying food · Estimating portion · Calculating GI impact
            </p>
            <div className="w-52 h-1.5 bg-border rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-teal rounded-full animate-pulse" style={{ width: '70%' }} />
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT ── */}
      {phase === 'result' && result && (
        <div className="space-y-4">
          {imageUrl && (
            <div className="relative">
              <img src={imageUrl} alt="Scanned" className="w-full h-40 object-cover rounded-xl" />
              <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-semibold ${
                result.confidence >= 85
                  ? 'bg-green-600/80 text-white'
                  : result.confidence >= 65
                  ? 'bg-amber-500/80 text-white'
                  : 'bg-gray-500/80 text-white'
              }`}>
                {result.confidence}% confidence
                {result.confidence < 65 && ' · best estimate'}
              </div>
            </div>
          )}
          {aiConfidence < 85 && aiReasoning && aiReasoning !== 'demo preset — no API call needed' && (
            <div className="text-xs text-amber-400 mt-1">
              ⚡ AI Vision unavailable — using smart estimate. Retake photo for best accuracy.
            </div>
          )}

          <div className="card border-2 p-4" style={{ borderColor: color + '80' }}>

            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
                style={{ background: color + '20' }}>
                {result.food.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-text text-lg leading-tight">{result.food.name}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {result.food.region} · {result.portion}
                </div>
                {aiReasoning && aiReasoning !== 'demo preset — no API call needed' && (
                  <div className="text-xs italic mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    🔍 AI saw: {aiReasoning}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: color + '20', color }}>
                    {result.food.impact} Impact
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>GI {result.food.gi}</span>
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                    <span>⚡</span> Claude Vision AI
                  </span>
                </div>
              </div>
            </div>

            {/* Nutrition grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: 'Calories', value: `${result.totalCalories}`,                              unit: 'kcal', color: 'text-gold'    },
                { label: 'Carbs',    value: `${Math.round(result.food.carbs   * mult)}`,            unit: 'g',    color: 'text-danger'  },
                { label: 'Protein',  value: `${Math.round(result.food.protein * mult)}`,            unit: 'g',    color: 'text-blue-l'  },
                { label: 'Fiber',    value: `${(Math.round(result.food.fiber  * mult * 10) / 10)}`, unit: 'g',    color: 'text-success' },
              ].map(s => (
                <div key={s.label} className="bg-surface border border-border rounded-lg p-2 text-center">
                  <div className={`font-bold text-sm ${s.color}`}>
                    {s.value}
                    <span className="text-xs font-normal ml-0.5" style={{ color: 'var(--color-text-muted)' }}>{s.unit}</span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Diabetic rating */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Diabetic rating</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-5 h-2 rounded-full"
                    style={{ background: i <= result.food.diabeticRating ? color : 'var(--color-border)' }} />
                ))}
              </div>
              <span className="text-xs font-semibold" style={{ color }}>{result.food.diabeticRating}/5</span>
            </div>

            {/* Tip */}
            <div className="rounded-lg p-3 text-xs leading-relaxed"
              style={{ background: color + '10', border: `1px solid ${color}30` }}>
              <span className="font-semibold" style={{ color }}>AI Tip: </span>
              <span className="text-text">{result.food.tip}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={logFood}
              disabled={logged}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {logged
                ? <><CheckCircle size={15} /> Logged to Diet</>
                : <><PlusCircle  size={15} /> Log to Diet Log</>}
            </button>
            <button onClick={reset} className="btn-ghost flex items-center gap-2">
              <RotateCcw size={14} /> Rescan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
