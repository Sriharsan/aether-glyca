import { useState, useRef, useEffect } from 'react'
import { Send, Brain, User, RefreshCw, Mic, MicOff } from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string }

// ── Language options ──────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en-IN', label: '🇮🇳 English'   },
  { code: 'ta-IN', label: '🇮🇳 Tamil'     },
  { code: 'hi-IN', label: '🇮🇳 Hindi'     },
  { code: 'te-IN', label: '🇮🇳 Telugu'    },
  { code: 'kn-IN', label: '🇮🇳 Kannada'   },
  { code: 'ml-IN', label: '🇮🇳 Malayalam' },
  { code: 'bn-IN', label: '🇮🇳 Bengali'   },
  { code: 'gu-IN', label: '🇮🇳 Gujarati'  },
  { code: 'mr-IN', label: '🇮🇳 Marathi'   },
  { code: 'pa-IN', label: '🇮🇳 Punjabi'   },
  { code: 'ur-IN', label: '🇮🇳 Urdu'      },
  { code: 'or-IN', label: '🇮🇳 Odia'      },
  { code: 'as-IN', label: '🇮🇳 Assamese'  },
  { code: 'ar',    label: '🌍 Arabic'     },
  { code: 'fr-FR', label: '🇫🇷 French'    },
  { code: 'es-ES', label: '🇪🇸 Spanish'   },
  { code: 'de-DE', label: '🇩🇪 German'    },
  { code: 'ja-JP', label: '🇯🇵 Japanese'  },
  { code: 'zh-CN', label: '🇨🇳 Chinese'   },
]

// ── Knowledge base (57 topics) ────────────────────────────────────────────────
const KB: Array<{ kw: string[]; r: string }> = [
  // ── Original 42 topics ────────────────────────────────────────────────────
  { kw:['idly','idli'], r:"Idly has a GI of 80 — high because fermentation breaks down starch. Limit to 2 small idlies per sitting. Always eat with sambar — sambar's protein+fiber slows absorption by ~30%. Best time: breakfast before 9am when insulin sensitivity is highest." },
  { kw:['dosa'], r:"Plain dosa GI 77. Upgrade path: Adai (GI 52, 2× protein) → Pesarattu (GI 44, highest protein) → Oats dosa (GI ~55). If you have plain dosa, one is fine — pair with sambar and a boiled egg to blunt the spike." },
  { kw:['rice','ponni','mappillai','seeraga'], r:"Rice ranking (lowest → highest GI): Mappillai Samba 55 → Seeraga Samba 60 → Brown rice 50 → Basmati 56 → Ponni 72. Switch from Ponni to Mappillai Samba today — 17 GI points lower, same taste profile. Max 1 small cup (150g cooked) per meal." },
  { kw:['sambar'], r:"Sambar GI 35 — one of the best foods for diabetics. Toor dal protein and soluble fiber actively slow glucose absorption. Have it generously at every meal. The more sambar relative to rice on your plate, the better your post-meal reading will be." },
  { kw:['rasam'], r:"Rasam GI 20 — among the lowest of any Indian dish. Tamarind, pepper, jeera all improve insulin sensitivity. Drink as soup or have with rice. The kollu (horse gram) rasam variant has GI 22 and is clinically proven to lower blood sugar in South Indian populations." },
  { kw:['coffee','filter coffee','tea'], r:"Filter coffee without sugar: GI near zero, perfectly safe. The issue is sugar and condensed milk. Reduce sugar by half each week. Switch to jaggery (lower GI). Avoid condensed milk versions entirely." },
  { kw:['banana','pazham'], r:"Banana GI 51 — medium. Small ripe banana is fine as a snack. Never on empty stomach. Avoid very ripe (brown-spotted) bananas — higher sugar. Raw banana (vazhakkai) curry is excellent — GI ~45 when cooked." },
  { kw:['mango','manga'], r:"Mango GI 60. During season: limit to 100g (5-6 small slices), eat after a protein meal, never standalone. Avoid mango juice — fiber removed, pure glucose spike. Once daily maximum in season." },
  { kw:['snack','evening snack','murukku','chips'], r:"Best TN snacks for diabetics: Sundal (GI 28), Roasted peanuts (GI 14), Neer mor/buttermilk (GI 15), Cucumber/carrot. Avoid: Murukku (GI 75), Seedai, Mixture, all fried snacks." },
  { kw:['breakfast','morning','what to eat morning'], r:"Best TN diabetic breakfast: 1) Pesarattu (GI 44) with sambar, 2) Adai (GI 52) with avial, 3) Ragi koozh (GI 45), 4) Pongal (GI 58) with sambar. Avoid: plain dosa alone, idly without sambar. Eat within 1 hour of waking." },
  { kw:['lunch','meals','diet plan'], r:"Ideal TN diabetic lunch: 1 small cup Mappillai Samba rice + 2 ladles sambar + 1 vegetable kootu or avial + 1 cup rasam + small curd. Rice should be <30% of the plate. Fill the rest with vegetables and protein." },
  { kw:['dinner','night','supper'], r:"Dinner is critical — it determines your morning fasting glucose. Eat by 7-8pm, make it the lightest meal. Replace rice with chapati + sambar or vegetable kootu. Walk 15-20 minutes after dinner — this alone can drop fasting glucose by 10-20 mg/dL." },
  { kw:['curd','yogurt','thayir','dahi'], r:"Curd GI 11 — excellent. Probiotics directly improve insulin sensitivity. Have 100-200g daily with lunch. Thayir sadham (curd rice) is a decent diabetic dinner, especially in summer. Avoid sweetened or flavoured yogurt." },
  { kw:['buttermilk','moru','chaas'], r:"Buttermilk (moru) GI near zero — perfect drink for diabetics. Drink unsweetened, salted, freely between meals. Cumin added to buttermilk has additional glucose-lowering properties." },
  { kw:['coconut','thengai','coconut chutney'], r:"Fresh coconut GI 45, coconut oil fine in moderation. Tender coconut water (GI 54) — one glass ok, not two. Coconut chutney ~2-3 tablespoons is fine; a full bowl adds excess fat." },
  { kw:['tamarind','puli'], r:"Tamarind is excellent — tartaric acid slows starch digestion. Tamarind-based dishes (pulikolambu, vathal kulambu, rasam) have significantly lower glycemic impact than their base carbs suggest." },
  { kw:['curry leaves','karuvepilai'], r:"Curry leaves contain myricetin — proven to improve insulin secretion. Chew 8-10 fresh curry leaves on empty stomach each morning. Research shows regular consumption reduces fasting glucose by 15-25 mg/dL over 3 months." },
  { kw:['hba1c','a1c','glycated','haemoglobin'], r:"HbA1c reflects 2-3 month average glucose. Targets: below 7.0% excellent, 7-8% acceptable, above 9% urgent. Every 1% drop cuts complication risk ~20%. Test every 3 months. Switching from Ponni to Mappillai Samba + post-meal walks can move HbA1c 0.3-0.5% in 3 months." },
  { kw:['yoga','pranayama','meditation'], r:"Yoga offers direct glucose benefits. Key poses: Surya Namaskar (burns glucose), Vajrasana post-meal (aids digestion), Ardha Matsyendrasana (stimulates pancreas). 20 min daily yoga shows 0.5% HbA1c reduction in studies." },
  { kw:['gym','weights','strength','resistance'], r:"Strength training is excellent for Type 2 diabetes — muscle is the body's primary glucose sink. 2-3 sessions/week improves insulin sensitivity for 24-48 hours. Expect temporary spike during session followed by drop 2-4 hours later." },
  { kw:['swimming','cycling','aerobic','cardio'], r:"Aerobic exercise most directly uses blood glucose as fuel. Target: 150 min/week moderate intensity. Swimming/cycling ideal if knee issues prevent walking. Check glucose first — if below 100 mg/dL, have a small snack." },
  { kw:['walk','walking','post meal walk'], r:"Post-meal walking is the single most effective habit in Tamil Nadu diabetes management. 15 minutes after meals reduces post-prandial glucose by 20-30 mg/dL — more effective than most dietary changes." },
  { kw:['how much exercise','minutes of exercise','exercise daily'], r:"Minimum: 150 minutes of moderate exercise per week — about 22 minutes daily. Spreading this across at least 5 days matters more than total minutes. 15 min post-breakfast + 15 min post-lunch + 20 min evening walk covers the target." },
  { kw:['silambam','martial arts','traditional exercise'], r:"Silambam (traditional Tamil martial art) is excellent — combines cardio, coordination, and strength. 30 minutes burns ~300 calories and provides a sustained 2-4 hour glucose-lowering effect. Kalaripayattu (Kerala) similarly excellent." },
  { kw:['morning exercise','evening exercise','best time exercise'], r:"Both morning and evening have advantages. Morning: lowers fasting glucose, sets metabolic tone. Evening (5-7pm): lowers next-morning fasting reading. Post-meal is safest: glucose is elevated, exercise uses it directly." },
  { kw:['exercise insulin','exercise medication'], r:"If on insulin: check glucose before exercise. Avoid if above 250 mg/dL or below 100 mg/dL. If on sulfonylureas, carry glucose tablets. Metformin + exercise = excellent combination — both improve insulin sensitivity." },
  { kw:['dizzy','shaking','sweating','hypoglycemia','low blood sugar','hypo'], r:"Low blood sugar symptoms. If glucose below 70 mg/dL: immediately eat 15g fast carbs — 3 tsp sugar in water, or 150ml juice, or 4 glucose tablets. Wait 15 min, recheck. After stabilising, have a small protein snack." },
  { kw:['blurry vision','vision','eyes'], r:"Blurry vision with high glucose: fluid balance in the eye lens changes temporarily. However, persistent vision changes indicate diabetic retinopathy. Check glucose now. If vision changes persist at normal glucose, or if you see floaters/flashes, see an ophthalmologist urgently." },
  { kw:['thirst','frequent urination','polyuria'], r:"Excessive thirst + frequent urination = classic hyperglycemia signs. Kidneys excrete excess glucose through urine. Check glucose now. Review your diet: reduce rice portions, increase sambar and vegetables. If urinating more than 10 times/day, see your doctor." },
  { kw:['fatigue','tired','tiredness','exhausted','energy'], r:"Diabetes fatigue has two opposite causes: HIGH glucose (cells starved) or LOW glucose (fuel depleted). Check glucose to know which. For post-meal crashes: the spike-drop cycle causes afternoon fatigue — fix with smaller rice portions and a 15-min post-lunch walk." },
  { kw:['stress','anxiety','cortisol','worry'], r:"Stress directly raises blood glucose — cortisol signals the liver to release stored glucose. Effective interventions: 4-7-8 pranayama (lowers cortisol in minutes), regular yoga (proven 0.5% HbA1c reduction), walking, consistent sleep schedule." },
  { kw:['sleep','insomnia','rest'], r:"Even one night of poor sleep raises fasting glucose by 15-30 mg/dL and increases insulin resistance. Target 7-8 hours. Check glucose before bed — above 200: address before sleeping. Below 100: small protein snack prevents 3am hypoglycemia." },
  { kw:['alcohol','beer','wine','brandy'], r:"Alcohol initially lowers glucose then spikes from the mixer. Rules: never drink on empty stomach, limit to 1-2 drinks, check glucose before bed. Avoid: sweet wines, beer (GI 66), cocktails with juice. Safest: dry red wine, 1 glass maximum." },
  { kw:['metformin','tablet','medication','medicine','glycomet'], r:"Metformin works best taken WITH food — reduces nausea significantly. Never on empty stomach. Get B12 checked annually (Metformin depletes B12 — causes fatigue and tingling). High-fiber meals boost Metformin effectiveness." },
  { kw:['insulin','injection','insulin timing'], r:"Rapid-acting insulin (Novorapid, Humalog): inject 15 min before meals. Long-acting (Lantus, Tresiba): same time daily. Never skip a meal after mealtime insulin injection. High-fat Tamil meals delay absorption — peak may come 2-3 hours post-meal." },
  { kw:['pongal','thai pongal','festival'], r:"Pongal festival strategy: the dish Pongal (GI 58) is one of the better festival options. Sakkarai Pongal: small portion (3-4 tbsp), not a full bowl. Sugarcane chewed (GI 43) is far better than juice. Walk after the main meal." },
  { kw:['diwali','deepavali','festival sweets'], r:"Deepavali strategy: eat only after a full meal, never on empty stomach. Choose murukku over kaju katli (fat slows absorption). One piece, not a plateful. Drink water before sweets. Walk 20 min immediately after." },
  { kw:['glucose 200','blood sugar 200','200 mg'], r:"200 mg/dL needs attention. Immediate: drink 2 glasses water, walk 20 minutes. Next meal: halve rice, double sambar and vegetables. If fasting consistently above 180, discuss medication with your doctor." },
  { kw:['glucose 300','300 mg','very high'], r:"Above 300 mg/dL is a medical alert. Drink 500ml water, avoid all carbs next meal, do NOT exercise at this level. If remains above 300 for 3 hours or you feel unwell — go to a clinic immediately." },
  { kw:['fasting glucose','morning glucose','fasting blood sugar'], r:"Fasting glucose targets: 80-130 mg/dL. Above 180: dinner is too heavy or too late. To lower fasting: eat dinner before 7:30pm, walk 20 min after dinner, replace rice with chapati at night." },
  { kw:['post meal','after eating','postprandial'], r:"Post-meal target (2 hours): below 180 mg/dL. Eat vegetables and protein first, rice last — this alone reduces the 2-hour reading by 15-20 mg/dL. Walk within 30 min of finishing — each minute reduces reading by ~1-2 mg/dL." },
  { kw:['frustrated','give up','difficult','depressed','discouraged'], r:"Managing diabetes every day is genuinely hard — your frustration is valid. Tamil Nadu diet is actually ideal for diabetes — rasam (GI 20), sambar (GI 35), sundal (GI 28), curd (GI 11) are among the best diabetic foods anywhere. Start with one change this week." },
  { kw:['thanks','thank you','helpful'], r:"Happy to help! Consistency beats perfection in diabetes management. Your best wins: Mappillai Samba over Ponni rice, 15-min post-meal walks, generous sambar at every meal. What else can I help you with?" },

  // ── 15 new expanded topics ─────────────────────────────────────────────────
  { kw:['exercise','gym','workout','physical activity'],
    r:"Best exercises for diabetes: 1) 15-min post-meal walk reduces glucose spike by 30%. 2) Surya Namaskar 12 rounds stimulates pancreas. 3) Silambam 30min drops glucose 35 mg/dL. 4) Resistance training builds muscle that stores glucose passively. Check glucose before intense exercise." },
  { kw:['surya namaskar','kapalbhati','mandukasana'],
    r:"Yoga for diabetes — top 3: Surya Namaskar (12 rounds, 20min) activates pancreas. Kapalbhati (10min, 60 strokes/min) improves insulin release. Mandukasana directly compresses the pancreas. Morning empty stomach is best. 15min pranayama reduces cortisol which spikes glucose." },
  { kw:['three month','a1c target','reduce hba1c'],
    r:"HbA1c measures your 3-month average glucose. Targets: below 7.0% excellent, 7-8% acceptable, above 9% urgent. Every 1% drop cuts complication risk by 20%. Switching from Ponni to Mappillai Samba rice + daily post-meal walks can move HbA1c by 0.3-0.5% in 3 months." },
  { kw:['tension','worried','cortisol','anxiety attack'],
    r:"Stress directly raises glucose — cortisol tells your liver to release glucose. 5-min Anulom Vilom breathing cuts cortisol fast. Regular yoga + adequate sleep (7-8 hrs) improves glucose control by 15-20% independent of diet. 10min daily meditation is clinically equivalent to one dietary intervention." },
  { kw:['night glucose','sleep glucose','overnight fasting'],
    r:"Poor sleep raises glucose next morning — even one bad night raises fasting glucose by 20-30 mg/dL. 7-8 hours is optimal. Avoid eating 2 hours before sleep. Curd rice (GI 42) or a small kootu is ideal as last meal. Yoga Nidra 20min deeply regulates overnight glucose." },
  { kw:['drink','spirits','whiskey','toddy'],
    r:"For Type 2 diabetics: moderate alcohol (1 unit/day) is risky. Alcohol causes delayed hypoglycaemia — glucose crash 6-12 hrs later. Never drink on empty stomach. Avoid sweet cocktails and beer (GI 66). Dry red wine (GI near 0) is lowest risk. Always eat a protein snack when drinking." },
  { kw:['weight','obese','overweight','bmi','lose weight'],
    r:"Every 1kg lost reduces HbA1c by 0.1%. Tamil Nadu approach: replace Ponni with Mappillai Samba (saves 60 kcal/meal), add 30min morning walk, replace murukku with sundal. These three changes produce 2-3kg loss in 3 months. Ragi koozh breakfast is very filling and low GI — excellent for weight loss." },
  { kw:['chapati','roti','wheat','paratha'],
    r:"Chapati GI 52 — significantly better than Ponni rice (GI 72). Whole wheat chapati with sambar or dal is an excellent diabetic dinner. 2 medium chapatis = fine. Multigrain roti (wheat + ragi + jowar) has GI ~45 and is the best choice. Avoid maida (GI 70) entirely." },
  { kw:['ragi','finger millet','koozh','kurukkala'],
    r:"Ragi is the best grain for Tamil Nadu diabetics — GI 45, high calcium, high fiber. Ragi koozh (porridge) keeps you full 4-5 hours. Ragi mudde with sambar is an ideal meal. Use ragi flour to replace 50% of wheat in rotis. 1 cup ragi koozh for breakfast = best possible diabetic start." },
  { kw:['methi','fenugreek','vendhayam','seeds'],
    r:"Fenugreek (vendhayam) is a proven glucose-lowering food. 1 tsp soaked overnight in water, drink in the morning — reduces fasting glucose by 10-15 mg/dL over 4 weeks. Add to dosa batter (improves GI). Methi leaves in dal reduces glycemic load significantly." },
  { kw:['sugar','jaggery','sweetener','sweet','honey'],
    r:"Jaggery GI 84 vs white sugar GI 65 — jaggery is slightly better but still high. Stevia (GI 0) is the safest sweetener for diabetics. Date sugar GI 42 is a better option. In cooking, reduce sugar by 25% without affecting taste. Never use artificial sweeteners more than 2 servings/day." },
  { kw:['blood pressure','hypertension','bp','salt'],
    r:"Diabetes + hypertension is very common — they share root causes. Reduce salt: use rock salt, lemon and spices for flavour instead. DASH diet principles apply: BRAT foods (banana, rice, apple, tea) help BP. Amla (Indian gooseberry) significantly improves both glucose and blood pressure." },
  { kw:['kidney','renal','creatinine','protein in urine'],
    r:"Diabetes is the leading cause of kidney disease. Protect kidneys: stay well hydrated (8-10 glasses water), reduce salt and protein slightly, control glucose and blood pressure. Get creatinine + urine microalbumin tested annually. Avoid NSAID painkillers. Coconut water is kidney-friendly." },
  { kw:['green tea','herbal tea','amla','bitter gourd','karela'],
    r:"Evidence-based glucose-lowering foods: Bitter gourd (karela) juice 50ml morning reduces fasting glucose 8-12 mg/dL. Amla (GI 15) — 1 fresh or 5g powder daily proven to lower glucose. Green tea (2 cups/day) improves insulin sensitivity. Fenugreek water (overnight soak) reduces fasting glucose." },
  { kw:['type 1','type1','juvenile','insulin dependent'],
    r:"Type 1 diabetes requires insulin — no food or exercise can replace it. Focus: carb counting (1 unit rapid insulin per 10-15g carbs, varies by person), consistent meal timing, always carry fast carbs. Exercise lowers glucose significantly — adjust insulin dose on active days with your doctor's guidance." },

  // ── 8 additional clinical & regional topics ───────────────────────────────
  { kw:['medication','metformin','drug','dose','tablet timing'],
    r:"With Metformin: eat within 30min of taking it to avoid nausea. Never skip meals — take WITH food. With insulin: match meal size to your dose. High-GI meals spike glucose beyond insulin coverage. Switching to lower-GI foods makes insulin more predictable. Always consult your doctor before any dose changes." },
  { kw:['glucose is 200','reading 200','sugar 200','my sugar is 200'],
    r:"Glucose at 200 mg/dL: 1) Walk 15 minutes immediately — most effective single action. 2) Drink 2 glasses of water. 3) Do NOT eat anything high-GI. 4) Check again in 90 minutes. If still above 200 after 2 hours, call your doctor. If above 300 or you feel unwell — go to hospital immediately." },
  { kw:['too high','glucose 300','very high sugar','emergency glucose'],
    r:"Glucose above 300 is a medical concern. Do NOT exercise vigorously. Drink water — 3 glasses over 1 hour. Check for ketones if Type 1. Go to hospital if: dizzy, nauseous, difficulty breathing, or glucose doesn't drop in 2 hours. Do not manage this alone at home — this is an emergency threshold." },
  { kw:['morning reading','woke up','empty stomach','before breakfast','fasting reading'],
    r:"Ideal fasting glucose (morning, before eating): 80-130 mg/dL. Above 140 fasting is high. To lower it: avoid late dinners, eat curd rice or small kootu as last meal, do 10 minutes stretching before bed. Consistent sleep time significantly regulates morning glucose levels." },
  { kw:['festival','onam','navratri','celebration','payasam','sweet dish'],
    r:"Festival strategy: eat your normal meal first before the celebration. Choose the smallest portions of sweets — one piece not a serving. Avoid liquid sweets like payasam — solid form slows absorption. Walk 20 minutes after the celebration meal. Pongal dish itself (GI 58) is reasonable — Sakkarai Pongal: 3-4 tbsp max." },
  { kw:['north indian','punjabi','gujarati','rajasthani','maharashtrian','bengali'],
    r:"Best diabetic choices: Punjab — dal makhani (GI 29), sarson saag, bajra roti. Gujarat — dhokla (GI 35), thepla with methi, khandvi. Maharashtra — jowar bhakri, pithla, thalipeeth. Rajasthan — bajra roti, dal bati (baked). Traditional regional foods are actually excellent — modern processed snacks are the problem." },
  { kw:['symptom','tingling','numbness','neuropathy','feet pain'],
    r:"These need attention: frequent urination + excessive thirst (high glucose), blurry vision (glucose fluctuation), dizziness after meals (post-prandial drop), tingling in feet (neuropathy). Log your glucose now. If symptoms are new or severe, see your doctor this week — do not wait for your next scheduled appointment." },
  { kw:['children','kids','child','juvenile diabetes','young diabetic'],
    r:"Type 1 in children: hypoglycaemia is more dangerous — keep glucose tablets accessible always. School meals are often high-GI — pack sundal, pesarattu, or adai. Exercise is excellent but check glucose before and after sports. HbA1c target for children is below 7.5%. Work closely with a paediatric endocrinologist." },
]

function getRuleBasedResponse(query: string): string {
  const q = query.toLowerCase()
  for (const entry of KB) {
    if (entry.kw.some(k => q.includes(k))) return entry.r
  }
  const m = q.match(/\b([0-9]{2,3})\s*(mg|mg\/dl|mmol)?\b/)
  if (m) {
    const val = parseInt(m[1], 10)
    if (val >= 40 && val <= 600) {
      if (val < 70)  return `${val} mg/dL is low — hypoglycemia. Act now: eat 15g fast carbs — 3 tsp sugar in water, or 150ml juice, or 4 glucose tablets. Recheck in 15 minutes. Log this and discuss with your doctor.`
      if (val <= 130) return `${val} mg/dL is a good reading — you're in target range. Keep it up. Is there a specific meal or situation you'd like advice on?`
      if (val <= 180) return `${val} mg/dL is slightly above ideal. Take a 15-min walk right now — it will bring this down 10-20 mg/dL. Review the previous meal for high-GI content.`
      if (val <= 250) return `${val} mg/dL is above target. Drink 2 glasses of water, walk 20 minutes. Next meal: no rice — sambar + vegetables + curd only. If this is a consistent fasting reading, talk to your doctor.`
      return `${val} mg/dL is dangerously high. Drink 500ml water immediately. Skip carbs at the next meal. If you feel nauseous, have stomach pain, or smell something fruity — go to a clinic now.`
    }
  }
  return "I specialise in South Indian diet and diabetes. Ask me about specific foods (idly, dosa, rice varieties, sambar), glucose readings, exercise, HbA1c, or festival eating. Try: 'Is Mappillai Samba better than Ponni?', 'My glucose is 200', 'Best exercise for diabetes?'"
}

// ── Ollama integration (/api/chat — chat format) ──────────────────────────────
async function tryOllama(query: string): Promise<string | null> {
  try {
    const res = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        model: 'mistral:latest',
        stream: false,
        messages: [
          {
            role: 'system',
            content: 'You are AETHER-Glyca, an AI health advisor for diabetic patients in India especially Tamil Nadu. You specialize in South Indian foods and diabetes. Key facts you know: Idly GI 80, Dosa GI 77, Sambar GI 35, Ponni Rice GI 72, Mappillai Samba GI 55, Ragi GI 45. Give specific practical advice in 2-3 sentences max. Be warm, culturally aware. If asked about exercise recommend yoga, walking, silambam, or cricket. Never say you cannot answer — always give practical guidance.',
          },
          { role: 'user', content: query },
        ],
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.message?.content?.trim() || null
  } catch {
    return null
  }
}

// ── Starter chips ─────────────────────────────────────────────────────────────
const STARTERS = [
  'Can I eat dosa for breakfast?',
  'Which rice is best for diabetes?',
  'What snacks can I have?',
  'Is filter coffee okay?',
  'Best lunch diet plan?',
  'Can I eat banana?',
  'My glucose is 200 — what now?',
  'Pongal festival eating tips',
  'What is HbA1c?',
  'Best exercise for diabetes?',
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function AIAdvisor() {
  const [messages,       setMessages]       = useState<Message[]>([{
    role: 'assistant',
    content: "Vanakkam! I'm AETHER-Glyca, your AI diet advisor powered by Mistral AI (Ollama). I specialise in South Indian foods and their glucose impact — idly, dosa, Ponni vs Mappillai Samba rice, sambar, everything. Also ask me about HbA1c, glucose readings, exercise, and festival eating. Ask anything! 🌿",
  }])
  const [input,          setInput]          = useState('')
  const [loading,        setLoading]        = useState(false)
  const [ollamaStatus,   setOllamaStatus]   = useState<'checking' | 'online' | 'offline'>('checking')
  const [lastSource,     setLastSource]     = useState<'ollama' | 'builtin'>('builtin')
  const [listening,      setListening]      = useState(false)
  const [lang,           setLang]           = useState('en-IN')
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const bottomRef      = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // ── Health-check Ollama on mount ───────────────────────────────────────────
  useEffect(() => {
    fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(3000) })
      .then(r => { setOllamaStatus(r.ok ? 'online' : 'offline') })
      .catch(() => setOllamaStatus('offline'))
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // ── Voice input ────────────────────────────────────────────────────────────
  function startVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Voice not supported. Please use Chrome browser.'); return }

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const recognition = new SR()
    recognitionRef.current = recognition
    recognition.lang           = lang
    recognition.continuous     = true      // keep listening continuously
    recognition.interimResults = true      // show live transcript while speaking

    let silenceTimer: ReturnType<typeof setTimeout> | null = null
    let finalTranscript = ''

    recognition.start()
    setListening(true)
    setVoiceTranscript('')

    recognition.onresult = (e: any) => {
      if (silenceTimer) clearTimeout(silenceTimer)
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript
        } else {
          interim += e.results[i][0].transcript
        }
      }
      setVoiceTranscript(finalTranscript + interim)
      setInput(finalTranscript + interim)

      // Auto-send after 2 seconds of silence
      silenceTimer = setTimeout(() => {
        const textToSend = finalTranscript || interim
        if (textToSend.trim()) {
          recognition.stop()
          setListening(false)
          setVoiceTranscript('')
          sendMessage(textToSend.trim())
        }
      }, 2000)
    }

    recognition.onerror = (e: any) => {
      if (silenceTimer) clearTimeout(silenceTimer)
      setListening(false)
      setVoiceTranscript('')
      if (e.error !== 'aborted') console.error('Voice error:', e.error)
    }

    recognition.onend = () => {
      if (silenceTimer) clearTimeout(silenceTimer)
      setListening(false)
    }
  }

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = async (text?: string) => {
    const q = (text ?? input).trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setLoading(true)

    const ollamaReply = ollamaStatus === 'online' ? await tryOllama(q) : null

    if (ollamaReply) {
      setLastSource('ollama')
      setMessages(prev => [...prev, { role: 'assistant', content: ollamaReply }])
    } else {
      if (ollamaStatus === 'online') setOllamaStatus('offline')
      setLastSource('builtin')
      setMessages(prev => [...prev, { role: 'assistant', content: getRuleBasedResponse(q) }])
    }

    setLoading(false)
  }

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Brain size={22} className="text-teal"/> AI Diet Advisor
          </h1>
          {/* Ollama status indicator */}
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-card border border-border">
            <div className={`w-2 h-2 rounded-full ${
              ollamaStatus === 'online'   ? 'bg-success animate-pulse' :
              ollamaStatus === 'checking' ? 'bg-gold animate-pulse'    :
                                           'bg-muted'
            }`}/>
            <span className="text-muted">
              {ollamaStatus === 'online'   ? 'Mistral AI: Live' :
               ollamaStatus === 'checking' ? 'Connecting…'      :
                                            'Built-in KB: 65 topics'}
            </span>
          </div>
          {/* Language indicator — shown when non-English is selected */}
          {lang !== 'en-IN' && (
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-teal/10 border border-teal/20 text-teal">
              <Mic size={11}/>
              <span>{LANGUAGES.find(l => l.code === lang)?.label}</span>
            </div>
          )}
        </div>
        <p className="text-muted text-sm mt-1">
          {lastSource === 'ollama'
            ? 'Powered by Mistral via Ollama · South Indian diabetes specialist'
            : '65+ food & health topics · Voice in 19 languages · Works offline'}
        </p>
      </div>

      {/* Starter chips */}
      <div className="flex gap-2 flex-wrap mb-4">
        {STARTERS.map(s => (
          <button key={s} onClick={() => sendMessage(s)}
            className="text-xs px-3 py-1.5 rounded-full bg-card border border-border text-muted hover:text-teal hover:border-teal transition-colors">
            {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
              ${m.role === 'assistant' ? 'bg-teal/20' : 'bg-blue/20'}`}>
              {m.role === 'assistant'
                ? <Brain size={14} className="text-teal"/>
                : <User  size={14} className="text-blue-l"/>}
            </div>
            <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed
              ${m.role === 'assistant'
                ? 'bg-card text-text rounded-tl-none border border-border'
                : 'bg-blue/20 text-blue-l rounded-tr-none'}`}>
              {m.content}
            </div>
          </div>
        ))}

        {/* Loading bubble */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center shrink-0">
              <Brain size={14} className="text-teal"/>
            </div>
            <div className="bg-card rounded-2xl rounded-tl-none px-4 py-3 border border-border">
              <div className="flex gap-1 items-center">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-teal rounded-full animate-bounce"
                    style={{ animationDelay:`${i * 0.15}s` }}/>
                ))}
                <span className="text-xs text-muted ml-2 flex items-center gap-1">
                  <RefreshCw size={10} className="animate-spin"/>
                  {ollamaStatus === 'online' ? 'Mistral thinking…' : 'Processing…'}
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input area */}
      <div className="mt-4 space-y-2">

        {/* Listening indicator */}
        {listening && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
            <span className="text-xs text-red-400 font-medium">
              Listening in {LANGUAGES.find(l => l.code === lang)?.label.split(' ')[1] || 'English'} — speak now, auto-sends after 2 sec silence...
            </span>
          </div>
        )}

        {/* Input row */}
        <div className="flex gap-2 items-center">

          {/* Language selector */}
          <select
            value={lang}
            onChange={e => setLang(e.target.value)}
            className="text-xs rounded-lg border border-border px-2 py-2 cursor-pointer"
            style={{
              width: '148px',
              minWidth: '148px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              borderColor: 'var(--color-border)',
            }}
            title="Select voice language"
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>

          {/* Text input */}
          <input
            className="input flex-1 text-sm"
            placeholder={listening ? 'Speaking... (auto-sends after 2 sec silence)' : 'Ask about any South Indian food, glucose reading, exercise…'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            disabled={loading}
          />

          {/* Mic button */}
          <button
            onClick={startVoice}
            title={listening ? 'Stop listening' : 'Start voice input'}
            className={`btn-ghost p-2 rounded-lg transition-all ${
              listening
                ? 'text-red-400 bg-red-500/10 border border-red-500/30 animate-pulse'
                : 'text-teal hover:bg-teal/10'
            }`}
          >
            {listening ? <MicOff size={18}/> : <Mic size={18}/>}
          </button>

          {/* Send button */}
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="btn-primary px-4 py-2 text-sm rounded-lg disabled:opacity-50"
          >
            <Send size={16}/>
          </button>
        </div>
      </div>
    </div>
  )
}
