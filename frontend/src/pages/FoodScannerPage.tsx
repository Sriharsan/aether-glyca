import { useState } from 'react'
import { Camera, CheckCircle } from 'lucide-react'
import FoodPhotoScanner from '../components/patient/FoodPhotoScanner'

export default function FoodScannerPage() {
  const [lastLogged, setLastLogged] = useState<any>(null)

  return (
    <div className="p-6 space-y-6 accent-patient">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Camera size={22} className="text-teal"/> Food Scanner
        </h1>
        <p className="text-muted text-sm mt-0.5">
          Take a photo of your food — AI identifies GI, calories and diabetes impact instantly
        </p>
      </div>

      {lastLogged && (
        <div className="flex items-center gap-2 bg-success/10 border border-success/30 text-success rounded-xl px-4 py-3 text-sm">
          <CheckCircle size={15}/>
          <span><strong>{lastLogged.foodName ?? lastLogged.name}</strong> logged to your diet diary.</span>
        </div>
      )}

      <div className="card">
        <FoodPhotoScanner onFoodLogged={food => setLastLogged(food)} />
      </div>

      {/* How it works */}
      <div className="card">
        <h2 className="font-semibold text-text mb-3">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step:'1', icon:'📸', title:'Photograph your food', desc:'Use your camera or upload from gallery' },
            { step:'2', icon:'🤖', title:'AI analyses the image', desc:'Detects food item, estimates portion size and GI index' },
            { step:'3', icon:'📋', title:'Review & log', desc:'See full nutrition info and log directly to your Diet Log' },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-teal/20 text-teal flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {s.step}
              </div>
              <div>
                <div className="text-lg mb-0.5">{s.icon}</div>
                <div className="text-sm font-semibold text-text">{s.title}</div>
                <div className="text-xs text-muted mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
