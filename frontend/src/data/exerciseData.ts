// ── Exercise database for AETHER-Glyca ───────────────────────────────────────
// glucoseReduction = estimated mg/dL drop for a 70 kg Type 2 diabetic

export interface Exercise {
  id:               string
  name:             string
  duration:         number        // minutes
  category:         string
  intensity:        'Low' | 'Medium' | 'High'
  glucoseReduction: number        // mg/dL
  calories:         number        // kcal
  emoji:            string
  region:           string
  bestTime:         string
  tip:              string
  equipment:        string
}

export const EXERCISES: Exercise[] = [
  // ── Running ────────────────────────────────────────────────────────────────
  {id:'jog_20',name:'Light Jog 20min',duration:20,category:'Running',intensity:'Medium',glucoseReduction:28,calories:160,emoji:'🏃',region:'Universal',bestTime:'Morning',tip:'Start: 5 min walk + 10 min jog + 5 min walk for beginners',equipment:'Running shoes'},
  {id:'run_30',name:'Running 30min',duration:30,category:'Running',intensity:'High',glucoseReduction:40,calories:280,emoji:'🏃',region:'Universal',bestTime:'Morning',tip:'Check glucose before — if below 100 have a small snack first',equipment:'Running shoes'},
  {id:'run_60',name:'Running 60min',duration:60,category:'Running',intensity:'High',glucoseReduction:62,calories:520,emoji:'🏃',region:'Universal',bestTime:'Morning',tip:'Long run — carry glucose tablets. Reduces HbA1c by 0.8% over 12 weeks.',equipment:'Running shoes'},

  // ── Walking ────────────────────────────────────────────────────────────────
  {id:'post_meal_walk',name:'Post-Meal Walk 20min',duration:20,category:'Walking',intensity:'Low',glucoseReduction:33,calories:80,emoji:'🚶',region:'Pan India',bestTime:'After every meal',tip:'Single most important habit — reduces post-prandial glucose by 30%',equipment:'None'},
  {id:'brisk_walk_30',name:'Brisk Walk 30min',duration:30,category:'Walking',intensity:'Medium',glucoseReduction:28,calories:120,emoji:'🚶',region:'Universal',bestTime:'Morning/Evening',tip:'Keep pace where you can talk but not sing. 5 days/week reduces HbA1c by 0.5%',equipment:'Good shoes'},
  {id:'temple_walk',name:'Temple Steps Walk',duration:20,category:'Walking',intensity:'Medium',glucoseReduction:25,calories:150,emoji:'🛕',region:'Tamil Nadu',bestTime:'Morning',tip:'Climbing temple gopuram steps — traditional TN morning exercise',equipment:'None'},
  {id:'market_walk',name:'Market Walking',duration:30,category:'Walking',intensity:'Low',glucoseReduction:18,calories:100,emoji:'🛒',region:'Tamil Nadu',bestTime:'Morning',tip:'Daily market walk common in TN — counts as real exercise',equipment:'None'},
  {id:'stair_climb',name:'Stair Climbing 15min',duration:15,category:'Walking',intensity:'High',glucoseReduction:30,calories:180,emoji:'🪜',region:'Universal',bestTime:'Anytime',tip:'10 min stairs = 30 min walking for glucose reduction',equipment:'None'},
  {id:'beach_walk',name:'Evening Walk at Beach',duration:30,category:'Walking',intensity:'Low',glucoseReduction:18,calories:100,emoji:'🌊',region:'Tamil Nadu',bestTime:'Evening',tip:'Marina Beach Chennai, Elliot Beach — combine walk with fresh air',equipment:'None'},
  {id:'nordic_walk',name:'Nordic Walking 30min',duration:30,category:'Walking',intensity:'Medium',glucoseReduction:32,calories:160,emoji:'🚶',region:'Universal',bestTime:'Morning',tip:'Poles engage upper body — burns 40% more calories than normal walking',equipment:'Nordic poles'},

  // ── Yoga ───────────────────────────────────────────────────────────────────
  {id:'surya_namaskar',name:'Surya Namaskar',duration:20,category:'Yoga',intensity:'Medium',glucoseReduction:20,calories:110,emoji:'🧘',region:'Pan India',bestTime:'Morning empty stomach',tip:'12 rounds = complete body workout. Most powerful yoga for diabetes',equipment:'Yoga mat'},
  {id:'pranayama',name:'Pranayama 15min',duration:15,category:'Yoga',intensity:'Low',glucoseReduction:10,calories:20,emoji:'🫁',region:'Pan India',bestTime:'Morning',tip:'Reduces cortisol — high cortisol chronically raises glucose levels',equipment:'None'},
  {id:'diabetes_yoga',name:'Diabetes Yoga Sequence',duration:30,category:'Yoga',intensity:'Low',glucoseReduction:18,calories:60,emoji:'🧘',region:'Pan India',bestTime:'Morning',tip:'Mandukasana+Vakrasana+Ardha Matsyendrasana for pancreas stimulation',equipment:'Yoga mat'},
  {id:'kapalbhati',name:'Kapalbhati 10min',duration:10,category:'Yoga',intensity:'Low',glucoseReduction:12,calories:30,emoji:'🫁',region:'Pan India',bestTime:'Morning empty stomach',tip:'60 strokes per minute — stimulates pancreas and improves insulin',equipment:'None'},
  {id:'anulom_vilom',name:'Anulom Vilom',duration:10,category:'Yoga',intensity:'Low',glucoseReduction:8,calories:15,emoji:'🫁',region:'Pan India',bestTime:'Morning/Evening',tip:'Alternate nostril breathing — reduces stress glucose spikes',equipment:'None'},
  {id:'power_yoga',name:'Power Yoga 45min',duration:45,category:'Yoga',intensity:'High',glucoseReduction:38,calories:200,emoji:'🧘',region:'Pan India',bestTime:'Morning',tip:'Dynamic yoga with holds — comparable to moderate gym workout',equipment:'Yoga mat'},
  {id:'chair_yoga',name:'Chair Yoga',duration:20,category:'Yoga',intensity:'Low',glucoseReduction:10,calories:40,emoji:'🪑',region:'Universal',bestTime:'Anytime',tip:'Excellent for elderly diabetics — full benefit without floor work',equipment:'Chair'},
  {id:'hatha_yoga',name:'Hatha Yoga 45min',duration:45,category:'Yoga',intensity:'Medium',glucoseReduction:22,calories:120,emoji:'🧘',region:'Pan India',bestTime:'Morning',tip:'Classic poses held — builds insulin sensitivity over weeks',equipment:'Yoga mat'},

  // ── Traditional ────────────────────────────────────────────────────────────
  {id:'silambam',name:'Silambam 30min',duration:30,category:'Traditional',intensity:'High',glucoseReduction:35,calories:250,emoji:'🥢',region:'Tamil Nadu',bestTime:'Morning/Evening',tip:'Tamil martial art with bamboo staff — exceptional full-body cardio',equipment:'Silambam staff'},
  {id:'kabbadi',name:'Kabaddi 20min',duration:20,category:'Traditional',intensity:'High',glucoseReduction:30,calories:220,emoji:'🤼',region:'Pan India',bestTime:'Evening',tip:'Explosive bursts of activity — excellent for insulin resistance',equipment:'None'},
  {id:'kolattam',name:'Kolattam 20min',duration:20,category:'Traditional',intensity:'Medium',glucoseReduction:20,calories:120,emoji:'🎋',region:'Tamil Nadu',bestTime:'Evening',tip:'Traditional stick dance — full body coordination with cultural value',equipment:'Kolattam sticks'},
  {id:'kalaripayattu',name:'Kalaripayattu 30min',duration:30,category:'Traditional',intensity:'High',glucoseReduction:38,calories:270,emoji:'🥋',region:'Kerala',bestTime:'Morning',tip:'Oldest martial art — excellent for flexibility, strength and glucose',equipment:'Traditional equipment'},
  {id:'farming_work',name:'Farm/Field Work 60min',duration:60,category:'Traditional',intensity:'Medium',glucoseReduction:40,calories:300,emoji:'🌾',region:'Tamil Nadu',bestTime:'Morning',tip:'Common in rural TN — 1 hour farm work equals 45 min gym session',equipment:'None'},
  {id:'household',name:'Active Housework 30min',duration:30,category:'Traditional',intensity:'Low',glucoseReduction:15,calories:110,emoji:'🏠',region:'Universal',bestTime:'Morning',tip:'Mopping+washing+cleaning counts as real exercise — 30 min daily',equipment:'None'},
  {id:'mallakhamb',name:'Mallakhamb 20min',duration:20,category:'Traditional',intensity:'High',glucoseReduction:35,calories:220,emoji:'🎭',region:'Maharashtra',bestTime:'Morning',tip:'Pole gymnastics — incredible strength and glucose management',equipment:'Mallakhamb pole'},
  {id:'varma_kalai',name:'Varma Kalai 30min',duration:30,category:'Traditional',intensity:'Medium',glucoseReduction:26,calories:180,emoji:'👊',region:'Tamil Nadu',bestTime:'Morning',tip:'Ancient pressure-point martial art — improves circulation and flexibility',equipment:'None'},

  // ── Cycling ────────────────────────────────────────────────────────────────
  {id:'cycle_outdoor',name:'Outdoor Cycling 30min',duration:30,category:'Cycling',intensity:'Medium',glucoseReduction:32,calories:220,emoji:'🚴',region:'Universal',bestTime:'Morning/Evening',tip:'Cycling 5km equals glucose reduction of 30 min walk',equipment:'Bicycle'},
  {id:'cycle_stationary',name:'Stationary Cycling',duration:30,category:'Cycling',intensity:'Medium',glucoseReduction:28,calories:200,emoji:'🚴',region:'Universal',bestTime:'Anytime',tip:'Indoor cycling — excellent for rainy season',equipment:'Exercise bike'},
  {id:'cycle_commute',name:'Cycling to Work',duration:20,category:'Cycling',intensity:'Low',glucoseReduction:15,calories:120,emoji:'🚴',region:'Tamil Nadu',bestTime:'Morning',tip:'Replace auto commute — free exercise that builds daily habit',equipment:'Bicycle'},
  {id:'cycle_hiit',name:'Cycling HIIT 20min',duration:20,category:'Cycling',intensity:'High',glucoseReduction:38,calories:260,emoji:'🚴',region:'Universal',bestTime:'Morning',tip:'30 sec sprint / 90 sec easy — most time-efficient glucose reducer',equipment:'Bicycle or exercise bike'},

  // ── Swimming ───────────────────────────────────────────────────────────────
  {id:'swim_laps',name:'Swimming Laps 30min',duration:30,category:'Swimming',intensity:'Medium',glucoseReduction:35,calories:250,emoji:'🏊',region:'Universal',bestTime:'Morning',tip:'Zero joint stress — excellent for overweight diabetics',equipment:'Pool access'},
  {id:'water_aerobics',name:'Water Aerobics',duration:30,category:'Swimming',intensity:'Low',glucoseReduction:20,calories:160,emoji:'🏊',region:'Universal',bestTime:'Morning',tip:'Easy on joints — recommended for elderly diabetics',equipment:'Pool access'},
  {id:'swim_breaststroke',name:'Breaststroke 20min',duration:20,category:'Swimming',intensity:'Medium',glucoseReduction:26,calories:180,emoji:'🏊',region:'Universal',bestTime:'Morning',tip:'Most accessible stroke — full body, low injury risk for diabetics',equipment:'Pool access'},

  // ── Strength ───────────────────────────────────────────────────────────────
  {id:'bodyweight_squats',name:'Bodyweight Squats 15min',duration:15,category:'Strength',intensity:'Medium',glucoseReduction:20,calories:100,emoji:'🏋️',region:'Universal',bestTime:'Morning/Evening',tip:'Largest muscle group — squats are most efficient glucose-clearing exercise',equipment:'None'},
  {id:'resistance_bands',name:'Resistance Band Training',duration:20,category:'Strength',intensity:'Medium',glucoseReduction:22,calories:120,emoji:'💪',region:'Universal',bestTime:'Morning',tip:'Full body strength — builds muscle that passively clears glucose 24/7',equipment:'Resistance bands'},
  {id:'pushups_core',name:'Push-ups and Core 15min',duration:15,category:'Strength',intensity:'Medium',glucoseReduction:18,calories:90,emoji:'💪',region:'Universal',bestTime:'Morning',tip:'Upper body strength — muscle mass directly improves insulin sensitivity',equipment:'None'},
  {id:'gym_weights',name:'Weight Training 45min',duration:45,category:'Strength',intensity:'High',glucoseReduction:42,calories:280,emoji:'🏋️',region:'Universal',bestTime:'Morning',tip:'Best long-term glucose reducer — muscle mass means more glucose storage',equipment:'Gym'},
  {id:'kettlebell',name:'Kettlebell Training 20min',duration:20,category:'Strength',intensity:'High',glucoseReduction:32,calories:220,emoji:'🏋️',region:'Universal',bestTime:'Morning',tip:'Combines cardio+strength — very efficient for busy people',equipment:'Kettlebell'},
  {id:'dumbbell',name:'Dumbbell Training 30min',duration:30,category:'Strength',intensity:'Medium',glucoseReduction:28,calories:180,emoji:'🏋️',region:'Universal',bestTime:'Morning',tip:'2-3x per week reduces HbA1c by 0.6% independently of cardio',equipment:'Dumbbells'},

  // ── Sport ──────────────────────────────────────────────────────────────────
  {id:'cricket',name:'Cricket Practice 60min',duration:60,category:'Sport',intensity:'Medium',glucoseReduction:30,calories:210,emoji:'🏏',region:'Tamil Nadu',bestTime:'Evening',tip:'Most popular TN sport — batting+fielding provides interval exercise',equipment:'Cricket equipment'},
  {id:'badminton',name:'Badminton 30min',duration:30,category:'Sport',intensity:'Medium',glucoseReduction:28,calories:200,emoji:'🏸',region:'Pan India',bestTime:'Evening',tip:'Fast reflexes+footwork — excellent cardio that feels like fun',equipment:'Racket and shuttle'},
  {id:'football',name:'Football 45min',duration:45,category:'Sport',intensity:'High',glucoseReduction:40,calories:320,emoji:'⚽',region:'Pan India',bestTime:'Evening',tip:'Intermittent sprints in football are scientifically optimal for glucose',equipment:'Football'},
  {id:'volleyball',name:'Volleyball 30min',duration:30,category:'Sport',intensity:'Medium',glucoseReduction:22,calories:160,emoji:'🏐',region:'Pan India',bestTime:'Evening',tip:'Social sport — teams keep you accountable to regular exercise',equipment:'Volleyball'},
  {id:'table_tennis',name:'Table Tennis 20min',duration:20,category:'Sport',intensity:'Medium',glucoseReduction:18,calories:120,emoji:'🏓',region:'Pan India',bestTime:'Anytime',tip:'Reflexes+light cardio — excellent for elderly or joint issues',equipment:'TT table and paddle'},
  {id:'kho_kho',name:'Kho Kho 20min',duration:20,category:'Sport',intensity:'High',glucoseReduction:28,calories:200,emoji:'🏃',region:'Pan India',bestTime:'Evening',tip:'Traditional Indian tag sport — excellent interval training in disguise',equipment:'None'},

  // ── Dance ──────────────────────────────────────────────────────────────────
  {id:'bharatanatyam',name:'Bharatanatyam Practice',duration:30,category:'Dance',intensity:'High',glucoseReduction:32,calories:210,emoji:'💃',region:'Tamil Nadu',bestTime:'Evening',tip:'Classical dance — equivalent to aerobic exercise, burns 7 cal/min',equipment:'Dance ankle bells'},
  {id:'dance_folk',name:'Folk Dance 30min',duration:30,category:'Dance',intensity:'Medium',glucoseReduction:25,calories:180,emoji:'💃',region:'Pan India',bestTime:'Evening',tip:'Garba, Bhangra, Karagattam, Kolattam — cultural dance is genuine cardio',equipment:'None'},
  {id:'zumba',name:'Zumba/Aerobics 45min',duration:45,category:'Dance',intensity:'High',glucoseReduction:38,calories:300,emoji:'🕺',region:'Urban India',bestTime:'Evening',tip:'Dance fitness — people who enjoy it stick to it longer',equipment:'None'},
  {id:'therukoothu',name:'Therukoothu 30min',duration:30,category:'Dance',intensity:'Medium',glucoseReduction:28,calories:190,emoji:'🎭',region:'Tamil Nadu',bestTime:'Evening',tip:'Street theatre dance — energetic footwork, 1 hr equals moderate cardio',equipment:'None'},

  // ── Flexibility ────────────────────────────────────────────────────────────
  {id:'stretching',name:'Full Body Stretching',duration:15,category:'Flexibility',intensity:'Low',glucoseReduction:5,calories:30,emoji:'🤸',region:'Universal',bestTime:'Morning/Bedtime',tip:'Improves blood circulation — indirect glucose benefit over weeks',equipment:'None'},
  {id:'tai_chi',name:'Tai Chi 30min',duration:30,category:'Flexibility',intensity:'Low',glucoseReduction:18,calories:90,emoji:'🕊️',region:'Universal',bestTime:'Morning',tip:'Slow flowing movements — improves balance and glucose in elderly diabetics',equipment:'None'},
  {id:'foam_roll',name:'Foam Rolling 10min',duration:10,category:'Flexibility',intensity:'Low',glucoseReduction:4,calories:20,emoji:'🟤',region:'Universal',bestTime:'Post-workout',tip:'Myofascial release improves muscle blood flow and recovery',equipment:'Foam roller'},
  {id:'meditation',name:'Meditation 10min',duration:10,category:'Flexibility',intensity:'Low',glucoseReduction:6,calories:12,emoji:'🧘',region:'Universal',bestTime:'Morning',tip:'10 min daily reduces HbA1c 0.3% through cortisol reduction alone',equipment:'None'},

  // ── HIIT ───────────────────────────────────────────────────────────────────
  {id:'hiit_home',name:'HIIT Home 20min',duration:20,category:'HIIT',intensity:'High',glucoseReduction:52,calories:240,emoji:'⚡',region:'Universal',bestTime:'Morning',tip:'20 min HIIT = 45 min steady cardio for glucose. Start slow — high hypo risk.',equipment:'None'},
  {id:'jump_rope',name:'Jump Rope / Skipping',duration:10,category:'HIIT',intensity:'High',glucoseReduction:40,calories:130,emoji:'🪢',region:'Universal',bestTime:'Morning',tip:'Highest cal/min exercise. 10 min highly effective. Avoid if foot neuropathy.',equipment:'Jump rope (₹100)'},
  {id:'burpees',name:'Burpees 10min',duration:10,category:'HIIT',intensity:'High',glucoseReduction:35,calories:120,emoji:'⚡',region:'Universal',bestTime:'Morning',tip:'5 burpees every hour during work day = 50 min of cardio by evening',equipment:'None'},
  {id:'tabata',name:'Tabata 15min',duration:15,category:'HIIT',intensity:'High',glucoseReduction:45,calories:180,emoji:'⚡',region:'Universal',bestTime:'Morning',tip:'20 sec on / 10 sec off x 8 rounds — proven protocol for T2 diabetes',equipment:'None'},
]

// ── Lookup helpers ─────────────────────────────────────────────────────────────
export const EXERCISE_CATEGORIES = [
  'All', 'Walking', 'Running', 'Yoga', 'Traditional', 'Cycling',
  'Swimming', 'Strength', 'Sport', 'Dance', 'Flexibility', 'HIIT',
] as const

export const INTENSITY_COLORS: Record<Exercise['intensity'], string> = {
  Low:    'text-success bg-success/10 border-success/30',
  Medium: 'text-gold    bg-gold/10    border-gold/30',
  High:   'text-danger  bg-danger/10  border-danger/30',
}

export const CATEGORY_EMOJI: Record<string, string> = {
  Walking:     '🚶', Running:     '🏃', Yoga:       '🧘',
  Traditional: '🥋', Cycling:     '🚴', Swimming:   '🏊',
  Strength:    '💪', Sport:       '⚽', Dance:      '💃',
  Flexibility: '🤸', HIIT:        '⚡',
}
