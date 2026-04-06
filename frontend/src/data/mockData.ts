// ── Patient seed data ────────────────────────────────────────────────────────
export const MOCK_PATIENTS = [
  { id:'p1',  name:'Murugan Selvam',    age:58, gender:'M', type:'type2',       risk:'critical', score:87, hba1c:11.2, tir:28, region:'Coimbatore' },
  { id:'p2',  name:'Kavitha Rajan',     age:44, gender:'F', type:'type2',       risk:'high',     score:63, hba1c:9.1,  tir:44, region:'Madurai' },
  { id:'p3',  name:'Senthil Kumar',     age:62, gender:'M', type:'type2',       risk:'high',     score:61, hba1c:9.8,  tir:42, region:'Chennai' },
  { id:'p4',  name:'Lakshmi Devi',      age:51, gender:'F', type:'type1',       risk:'medium',   score:39, hba1c:7.8,  tir:61, region:'Coimbatore' },
  { id:'p5',  name:'Arjun Natarajan',   age:37, gender:'M', type:'prediabetes', risk:'medium',   score:32, hba1c:6.8,  tir:68, region:'Salem' },
  { id:'p6',  name:'Priya Subramaniam', age:49, gender:'F', type:'type2',       risk:'low',      score:14, hba1c:6.9,  tir:74, region:'Coimbatore' },
  { id:'p7',  name:'Rajesh Pandian',    age:67, gender:'M', type:'type2',       risk:'critical', score:91, hba1c:12.1, tir:21, region:'Chennai' },
  { id:'p8',  name:'Meena Krishnan',    age:55, gender:'F', type:'type2',       risk:'medium',   score:41, hba1c:8.2,  tir:59, region:'Tirunelveli' },
  { id:'p9',  name:'Karthik Balaji',    age:42, gender:'M', type:'type2',       risk:'low',      score:18, hba1c:7.1,  tir:72, region:'Vellore' },
  { id:'p10', name:'Sundari Mani',      age:60, gender:'F', type:'type1',       risk:'high',     score:58, hba1c:9.4,  tir:47, region:'Madurai' },
]

export const RISK_COLORS: Record<string,string> = {
  critical:'#FF4C6A', high:'#FFB830', medium:'#4F9BFF', low:'#2ECC71',
}

// ── Glucose timeline generator ────────────────────────────────────────────────
export function generateGlucoseTimeline(riskLevel: string) {
  const baseline: Record<string,number> = { critical:240, high:195, medium:158, low:128 }
  const noise:    Record<string,number> = { critical:60,  high:45,  medium:30,  low:20  }
  const base = baseline[riskLevel] ?? 150
  const n    = noise[riskLevel]    ?? 25
  const points = []
  for (let day = 6; day >= 0; day--) {
    const dayLabel = day===0 ? 'Today' : day===1 ? 'Yesterday' : `${day}d ago`
    for (const hour of [7,11,14,18,21]) {
      const mealSpike = [11,14,18].includes(hour) ? Math.random()*40 : 0
      const val = Math.max(55, Math.min(380, base + mealSpike + (Math.random()-0.5)*n*2))
      points.push({ time:`${dayLabel} ${hour}:00`, glucose:Math.round(val), target_high:180, target_low:70 })
    }
  }
  return points
}

// ── Comprehensive India food database (100+ entries) ─────────────────────────
export interface IndiaFood {
  name: string; gi: number; category: string; impact: 'Low'|'Medium'|'High'
  region: string; calories: number; protein: number; carbs: number; fiber: number
  diabeticRating: number; emoji: string; tip: string; state: string
}

export const INDIA_FOODS: IndiaFood[] = [
  // ── Tamil Nadu (35) ────────────────────────────────────────────────────────
  {name:'Idly',gi:80,category:'Breakfast',impact:'High',region:'Tamil Nadu',calories:58,protein:2,carbs:11,fiber:0.5,diabeticRating:2,emoji:'🫓',tip:'Always pair with sambar — buffers glucose spike by 30%',state:'TN'},
  {name:'Dosa',gi:77,category:'Breakfast',impact:'High',region:'Tamil Nadu',calories:120,protein:3,carbs:22,fiber:0.5,diabeticRating:2,emoji:'🥞',tip:'Switch to adai — same taste, half the glucose impact',state:'TN'},
  {name:'Adai',gi:52,category:'Breakfast',impact:'Medium',region:'Tamil Nadu',calories:95,protein:6,carbs:14,fiber:2.1,diabeticRating:4,emoji:'🫓',tip:'Best diabetic dosa — multi-lentil mix means high protein',state:'TN'},
  {name:'Pesarattu',gi:44,category:'Breakfast',impact:'Low',region:'Andhra/TN',calories:85,protein:7,carbs:12,fiber:2.8,diabeticRating:5,emoji:'🫓',tip:'Green gram crepe — top diabetic breakfast choice in South India',state:'AP'},
  {name:'Pongal',gi:58,category:'Breakfast',impact:'Medium',region:'Tamil Nadu',calories:110,protein:4,carbs:18,fiber:1.2,diabeticRating:3,emoji:'🍚',tip:'Ghee version slows carb absorption — do not skip the ghee',state:'TN'},
  {name:'Ponni Rice',gi:72,category:'Staple',impact:'High',region:'Tamil Nadu',calories:130,protein:2.7,carbs:28,fiber:0.3,diabeticRating:2,emoji:'🍚',tip:'Switch to Mappillai Samba today — 17 GI points lower, same taste',state:'TN'},
  {name:'Mappillai Samba',gi:55,category:'Staple',impact:'Medium',region:'Tamil Nadu',calories:125,protein:3,carbs:26,fiber:0.8,diabeticRating:4,emoji:'🍚',tip:'Heritage rice — single best rice switch for TN diabetics',state:'TN'},
  {name:'Seeraga Samba',gi:60,category:'Staple',impact:'Medium',region:'Tamil Nadu',calories:126,protein:3,carbs:27,fiber:0.6,diabeticRating:3,emoji:'🍚',tip:'Aromatic rice — significantly better than Ponni for glucose',state:'TN'},
  {name:'Ragi Koozh',gi:45,category:'Breakfast',impact:'Low',region:'Tamil Nadu',calories:72,protein:2,carbs:15,fiber:3.2,diabeticRating:5,emoji:'🥤',tip:'Finger millet porridge — superfood for TN diabetics. Drink daily',state:'TN'},
  {name:'Sambar',gi:35,category:'Side',impact:'Low',region:'Tamil Nadu',calories:45,protein:3,carbs:6,fiber:2.5,diabeticRating:5,emoji:'🍲',tip:'Add generously — protein+fiber actively buffers glucose every meal',state:'TN'},
  {name:'Rasam',gi:20,category:'Side',impact:'Low',region:'Tamil Nadu',calories:25,protein:1,carbs:4,fiber:0.8,diabeticRating:5,emoji:'🍵',tip:'Pepper and jeera proven to improve insulin sensitivity',state:'TN'},
  {name:'Kootu',gi:38,category:'Side',impact:'Low',region:'Tamil Nadu',calories:80,protein:4,carbs:8,fiber:3.5,diabeticRating:5,emoji:'🥗',tip:'Vegetable+lentil — eat freely at every meal',state:'TN'},
  {name:'Avial',gi:40,category:'Side',impact:'Low',region:'Kerala/TN',calories:95,protein:3,carbs:9,fiber:4.0,diabeticRating:4,emoji:'🥘',tip:'Mixed vegetables in coconut yogurt — very high fiber',state:'KL'},
  {name:'Sundal',gi:28,category:'Snack',impact:'Low',region:'Tamil Nadu',calories:90,protein:6,carbs:12,fiber:5.5,diabeticRating:5,emoji:'🫘',tip:'Festival snack that is genuinely diabetic-friendly — eat freely',state:'TN'},
  {name:'Kollu Rasam',gi:22,category:'Side',impact:'Low',region:'Tamil Nadu',calories:35,protein:3,carbs:5,fiber:3.0,diabeticRating:5,emoji:'🍵',tip:'Horse gram — clinically proven blood sugar reducer',state:'TN'},
  {name:'Keerai Masiyal',gi:15,category:'Side',impact:'Low',region:'Tamil Nadu',calories:40,protein:3,carbs:4,fiber:3.5,diabeticRating:5,emoji:'🌿',tip:'Spinach mash — eat freely, actively lowers glucose',state:'TN'},
  {name:'Drumstick Sambar',gi:28,category:'Side',impact:'Low',region:'Tamil Nadu',calories:50,protein:3,carbs:7,fiber:3.2,diabeticRating:5,emoji:'🌱',tip:'Moringa improves insulin function — eat 3x per week',state:'TN'},
  {name:'Vazhaipoo Kootu',gi:25,category:'Side',impact:'Low',region:'Tamil Nadu',calories:65,protein:3,carbs:8,fiber:4.0,diabeticRating:5,emoji:'🌸',tip:'Banana flower curry — exceptional anti-diabetic properties',state:'TN'},
  {name:'Ragi Mudde',gi:45,category:'Staple',impact:'Low',region:'Karnataka/TN',calories:150,protein:3,carbs:30,fiber:4.5,diabeticRating:4,emoji:'🟤',tip:'Finger millet ball — traditional diabetic staple across South India',state:'KA'},
  {name:'Moringa Leaf Dal',gi:20,category:'Side',impact:'Low',region:'Tamil Nadu',calories:55,protein:4,carbs:6,fiber:4.5,diabeticRating:5,emoji:'🌿',tip:'Murungai keerai — one of the top anti-diabetic foods in Tamil Nadu',state:'TN'},
  {name:'Curd Rice',gi:42,category:'Staple',impact:'Low',region:'Tamil Nadu',calories:110,protein:4,carbs:18,fiber:0.5,diabeticRating:4,emoji:'🍚',tip:'Fermented curd + rice — probiotics actively help glucose metabolism',state:'TN'},
  {name:'Neer Mor',gi:18,category:'Beverage',impact:'Low',region:'Tamil Nadu',calories:15,protein:1,carbs:2,fiber:0,diabeticRating:5,emoji:'🥛',tip:'Spiced buttermilk — perfect summer drink, zero glucose impact',state:'TN'},
  {name:'Filter Coffee',gi:5,category:'Beverage',impact:'Low',region:'Tamil Nadu',calories:15,protein:0.3,carbs:2,fiber:0,diabeticRating:4,emoji:'☕',tip:'Without sugar — safe. Use jaggery instead of sugar',state:'TN'},
  {name:'Karunai Kizhangu',gi:51,category:'Side',impact:'Medium',region:'Tamil Nadu',calories:95,protein:2,carbs:18,fiber:3.5,diabeticRating:4,emoji:'🥔',tip:'Yam — much better than potato for glucose control',state:'TN'},
  {name:'Kathirikai Gotsu',gi:30,category:'Side',impact:'Low',region:'Tamil Nadu',calories:55,protein:2,carbs:6,fiber:3.0,diabeticRating:5,emoji:'🍆',tip:'Brinjal — excellent blood sugar control properties',state:'TN'},
  {name:'Murukku',gi:75,category:'Snack',impact:'High',region:'Tamil Nadu',calories:170,protein:3,carbs:22,fiber:0.8,diabeticRating:2,emoji:'🌀',tip:'Limit to 2 pieces — substitute with sundal when possible',state:'TN'},
  {name:'Paniyaram',gi:60,category:'Breakfast',impact:'Medium',region:'Tamil Nadu',calories:130,protein:3,carbs:20,fiber:1.0,diabeticRating:3,emoji:'🫙',tip:'Oil reduces GI slightly — better than plain dosa',state:'TN'},
  {name:'Paruppu Sadham',gi:48,category:'Staple',impact:'Medium',region:'Tamil Nadu',calories:140,protein:5,carbs:22,fiber:3.5,diabeticRating:4,emoji:'🍚',tip:'Dal rice — protein+carb balance makes this a good combination',state:'TN'},
  {name:'Guava',gi:25,category:'Fruit',impact:'Low',region:'Pan India',calories:68,protein:2.5,carbs:14,fiber:5.4,diabeticRating:5,emoji:'🍈',tip:'Best fruit for Indian diabetics — very low GI, very high fiber',state:'ALL'},
  {name:'Banana',gi:51,category:'Fruit',impact:'Medium',region:'Pan India',calories:89,protein:1.1,carbs:23,fiber:2.6,diabeticRating:3,emoji:'🍌',tip:'Small raw banana better than ripe. Never eat on empty stomach',state:'ALL'},
  {name:'Jackfruit',gi:75,category:'Fruit',impact:'High',region:'South India',calories:95,protein:1.5,carbs:24,fiber:1.5,diabeticRating:2,emoji:'🫐',tip:'Seasonal treat only — small portion. Raw jackfruit actually lowers glucose',state:'TN'},
  {name:'Poriyal',gi:35,category:'Side',impact:'Low',region:'Tamil Nadu',calories:70,protein:2,carbs:8,fiber:3.5,diabeticRating:5,emoji:'🥦',tip:'Stir-fried vegetables — eat freely as much as you want',state:'TN'},
  {name:'Chicken Chettinad',gi:5,category:'NonVeg',impact:'Low',region:'Tamil Nadu',calories:180,protein:25,carbs:4,fiber:0.5,diabeticRating:5,emoji:'🍗',tip:'Zero carb impact. Chettinad spices improve insulin sensitivity',state:'TN'},
  {name:'Prawn Masala',gi:5,category:'NonVeg',impact:'Low',region:'South India',calories:120,protein:20,carbs:3,fiber:0.3,diabeticRating:5,emoji:'🦐',tip:'Seafood — no glucose spike, high protein. Eat freely',state:'TN'},
  {name:'Kanji',gi:65,category:'Breakfast',impact:'Medium',region:'Tamil Nadu',calories:60,protein:1.5,carbs:13,fiber:0.4,diabeticRating:3,emoji:'🥣',tip:'Rice porridge — add ragi or vegetables to lower the GI',state:'TN'},

  // ── Kerala / Andhra / Karnataka (20) ──────────────────────────────────────
  {name:'Kerala Fish Curry',gi:20,category:'NonVeg',impact:'Low',region:'Kerala',calories:120,protein:18,carbs:3,fiber:0.5,diabeticRating:5,emoji:'🐟',tip:'Excellent — protein+omega-3, no glucose spike whatsoever',state:'KL'},
  {name:'Puttu',gi:54,category:'Breakfast',impact:'Medium',region:'Kerala/TN',calories:100,protein:3,carbs:20,fiber:1.8,diabeticRating:3,emoji:'🫙',tip:'Ragi puttu GI 45 is the superior diabetic choice over rice puttu',state:'KL'},
  {name:'Appam',gi:52,category:'Breakfast',impact:'Medium',region:'Kerala/TN',calories:90,protein:2,carbs:18,fiber:0.8,diabeticRating:3,emoji:'🥞',tip:'Fermented — better GI than plain dosa due to fermentation',state:'KL'},
  {name:'Idiyappam',gi:58,category:'Breakfast',impact:'Medium',region:'Kerala',calories:90,protein:2,carbs:20,fiber:0.8,diabeticRating:3,emoji:'🕸️',tip:'String hoppers — eat with coconut milk and curry for complete meal',state:'KL'},
  {name:'Tapioca Kappa',gi:70,category:'Staple',impact:'High',region:'Kerala',calories:160,protein:1.5,carbs:38,fiber:1.8,diabeticRating:2,emoji:'🟤',tip:'High GI — always pair with spicy fish curry to lower impact',state:'KL'},
  {name:'Bisibele Bath',gi:55,category:'Staple',impact:'Medium',region:'Karnataka',calories:160,protein:6,carbs:26,fiber:3.5,diabeticRating:4,emoji:'🍲',tip:'Lentil rice one-pot — good protein-carb balance for diabetes',state:'KA'},
  {name:'Jowar Roti',gi:50,category:'Staple',impact:'Medium',region:'Karnataka',calories:110,protein:4,carbs:22,fiber:2.5,diabeticRating:4,emoji:'🫓',tip:'Sorghum flatbread — excellent diabetic choice across Deccan region',state:'KA'},
  {name:'Andhra Gongura',gi:15,category:'Side',impact:'Low',region:'Andhra',calories:25,protein:2,carbs:3,fiber:2.5,diabeticRating:5,emoji:'🌿',tip:'Sorrel leaves — excellent anti-inflammatory anti-diabetic',state:'AP'},
  {name:'Neer Dosa',gi:60,category:'Breakfast',impact:'Medium',region:'Karnataka',calories:80,protein:1.5,carbs:16,fiber:0.3,diabeticRating:3,emoji:'🥞',tip:'Light rice crepe — pair with coconut chutney and dal',state:'KA'},
  {name:'Coconut Chutney',gi:15,category:'Side',impact:'Low',region:'South India',calories:80,protein:1,carbs:4,fiber:2.5,diabeticRating:4,emoji:'🥥',tip:'Fresh coconut — medium chain fats do not spike glucose',state:'TN'},
  {name:'Pesarattu Upma',gi:46,category:'Breakfast',impact:'Low',region:'Andhra',calories:130,protein:7,carbs:18,fiber:2.5,diabeticRating:4,emoji:'🫓',tip:'Green gram crepe with upma filling — excellent complete breakfast',state:'AP'},
  {name:'Akki Roti',gi:52,category:'Breakfast',impact:'Medium',region:'Karnataka',calories:120,protein:2,carbs:24,fiber:1.5,diabeticRating:3,emoji:'🫓',tip:'Rice flour flatbread with vegetables — moderate GI, filling',state:'KA'},
  {name:'Mirchi Bajji',gi:65,category:'Snack',impact:'Medium',region:'Andhra',calories:180,protein:3,carbs:22,fiber:2.0,diabeticRating:2,emoji:'🌶️',tip:'Fried — limit frequency. The chilli itself has blood sugar benefits',state:'AP'},
  {name:'Hyderabadi Dal',gi:29,category:'Side',impact:'Low',region:'Andhra',calories:130,protein:8,carbs:18,fiber:5.5,diabeticRating:5,emoji:'🫘',tip:'Slow-digesting lentils — excellent for every meal',state:'AP'},
  {name:'Thoran',gi:30,category:'Side',impact:'Low',region:'Kerala',calories:65,protein:2,carbs:7,fiber:4.0,diabeticRating:5,emoji:'🥗',tip:'Kerala stir-fry — rich in fiber, virtually no glucose impact',state:'KL'},
  {name:'Moru Kachiyathu',gi:15,category:'Beverage',impact:'Low',region:'Kerala',calories:20,protein:1.5,carbs:2,fiber:0,diabeticRating:5,emoji:'🥛',tip:'Tempered buttermilk — excellent digestive and glucose-stabilising drink',state:'KL'},
  {name:'Kerala Sadya',gi:48,category:'Staple',impact:'Medium',region:'Kerala',calories:250,protein:8,carbs:40,fiber:6.0,diabeticRating:3,emoji:'🍃',tip:'Festival meal — fiber from 12+ side dishes moderates glucose spike',state:'KL'},
  {name:'Curd/Yogurt',gi:11,category:'Side',impact:'Low',region:'Pan India',calories:61,protein:5,carbs:5,fiber:0,diabeticRating:5,emoji:'🥛',tip:'Probiotics improve insulin sensitivity — eat daily with lunch',state:'ALL'},
  {name:'Ragi Dosa',gi:48,category:'Breakfast',impact:'Low',region:'South India',calories:100,protein:3,carbs:16,fiber:2.8,diabeticRating:4,emoji:'🥞',tip:'Finger millet dosa — all benefits of ragi with lower GI than plain dosa',state:'KA'},
  {name:'Nellikai Chutney',gi:15,category:'Side',impact:'Low',region:'Tamil Nadu',calories:20,protein:0.5,carbs:4,fiber:2.2,diabeticRating:5,emoji:'🟢',tip:'Amla/gooseberry — richest Indian source of Vitamin C, lowers HbA1c',state:'TN'},

  // ── North India / Pan-India (45) ────────────────────────────────────────────
  {name:'Chapati',gi:52,category:'Staple',impact:'Medium',region:'North India',calories:120,protein:4,carbs:22,fiber:2.5,diabeticRating:3,emoji:'🫓',tip:'Whole wheat — eat 2 max with dal and vegetables, not alone',state:'PB'},
  {name:'Multigrain Roti',gi:42,category:'Staple',impact:'Low',region:'North India',calories:115,protein:4.5,carbs:20,fiber:4.0,diabeticRating:4,emoji:'🫓',tip:'Best roti choice for diabetics — mix wheat jowar bajra ragi',state:'PB'},
  {name:'Bajra Roti',gi:54,category:'Staple',impact:'Medium',region:'Rajasthan',calories:115,protein:3.5,carbs:21,fiber:2.8,diabeticRating:4,emoji:'🫓',tip:'Pearl millet — traditional Rajasthani staple, excellent for blood sugar',state:'RJ'},
  {name:'Dal Makhani',gi:29,category:'Side',impact:'Low',region:'Punjab',calories:140,protein:8,carbs:18,fiber:5.5,diabeticRating:5,emoji:'🫘',tip:'Slow-digesting black lentils — can eat daily, excellent for diabetes',state:'PB'},
  {name:'Rajma',gi:29,category:'Side',impact:'Low',region:'North India',calories:130,protein:8.5,carbs:19,fiber:7.5,diabeticRating:5,emoji:'🫘',tip:'Kidney beans — one of best foods for Type 2 diabetes, proven',state:'PB'},
  {name:'Chana Dal',gi:27,category:'Side',impact:'Low',region:'Pan India',calories:130,protein:8,carbs:20,fiber:8.0,diabeticRating:5,emoji:'🫘',tip:'Bengal gram — lowest GI dal available. Base of every meal',state:'ALL'},
  {name:'Moong Dal',gi:31,category:'Side',impact:'Low',region:'Pan India',calories:115,protein:8,carbs:18,fiber:4.0,diabeticRating:5,emoji:'🫘',tip:'Easiest to digest dal — excellent for diabetics',state:'ALL'},
  {name:'Methi Paratha',gi:40,category:'Breakfast',impact:'Low',region:'Punjab',calories:160,protein:4,carbs:24,fiber:3.5,diabeticRating:4,emoji:'🫓',tip:'Fenugreek actively lowers blood sugar — eat at least 3x per week',state:'PB'},
  {name:'Sarson Saag',gi:15,category:'Side',impact:'Low',region:'Punjab',calories:60,protein:3,carbs:6,fiber:4.5,diabeticRating:5,emoji:'🌿',tip:'Mustard greens — powerful anti-diabetic anti-inflammatory properties',state:'PB'},
  {name:'Palak Paneer',gi:20,category:'Side',impact:'Low',region:'North India',calories:160,protein:10,carbs:6,fiber:2.5,diabeticRating:5,emoji:'🟩',tip:'Spinach+protein combination — excellent, eat 3-4 times per week',state:'PB'},
  {name:'Besan Cheela',gi:35,category:'Breakfast',impact:'Low',region:'North India',calories:110,protein:7,carbs:14,fiber:4.0,diabeticRating:5,emoji:'🥞',tip:'Chickpea flour crepe — excellent diabetic breakfast, very filling',state:'PB'},
  {name:'Karela Sabzi',gi:18,category:'Side',impact:'Low',region:'Pan India',calories:18,protein:1,carbs:3,fiber:2.0,diabeticRating:5,emoji:'🟢',tip:'Bitter gourd — clinically proven most effective vegetable for diabetes',state:'ALL'},
  {name:'Lauki Sabzi',gi:15,category:'Side',impact:'Low',region:'North India',calories:25,protein:1,carbs:4,fiber:1.0,diabeticRating:5,emoji:'🥒',tip:'Bottle gourd — very low GI, cooling, eat freely in summers',state:'UP'},
  {name:'Jamun',gi:25,category:'Fruit',impact:'Low',region:'Pan India',calories:62,protein:0.7,carbs:14,fiber:0.6,diabeticRating:5,emoji:'🫐',tip:'Black plum — jamun seed powder proven to reduce blood sugar',state:'ALL'},
  {name:'Jowar Bhakri',gi:50,category:'Staple',impact:'Medium',region:'Maharashtra',calories:108,protein:3.5,carbs:20,fiber:2.5,diabeticRating:4,emoji:'🫓',tip:'Sorghum flatbread — traditional Maharashtrian diabetic food',state:'MH'},
  {name:'Sattu Drink',gi:30,category:'Beverage',impact:'Low',region:'Bihar',calories:100,protein:6,carbs:18,fiber:4.0,diabeticRating:5,emoji:'🥤',tip:'Roasted gram flour drink — excellent pre-exercise morning drink',state:'BR'},
  {name:'Bitter Gourd Juice',gi:10,category:'Beverage',impact:'Low',region:'Pan India',calories:15,protein:1,carbs:2,fiber:1.5,diabeticRating:5,emoji:'🥤',tip:'Drink 30ml on empty stomach — plant insulin reduces fasting glucose',state:'ALL'},
  {name:'Masoor Dal',gi:21,category:'Side',impact:'Low',region:'Pan India',calories:116,protein:9,carbs:20,fiber:8.0,diabeticRating:5,emoji:'🫘',tip:'Red lentils — fastest to cook, highest protein/fiber ratio among dals',state:'ALL'},
  {name:'Toor Dal',gi:30,category:'Side',impact:'Low',region:'Pan India',calories:118,protein:7,carbs:20,fiber:6.5,diabeticRating:5,emoji:'🫘',tip:'Arhar dal — staple of every Indian diabetic meal plan',state:'ALL'},
  {name:'Amla/Indian Gooseberry',gi:18,category:'Fruit',impact:'Low',region:'Pan India',calories:44,protein:0.9,carbs:10,fiber:4.3,diabeticRating:5,emoji:'🟢',tip:'Richest natural Vitamin C source — 2 raw amla daily reduces HbA1c',state:'ALL'},
  {name:'Pomegranate',gi:35,category:'Fruit',impact:'Low',region:'Pan India',calories:83,protein:1.7,carbs:19,fiber:4.0,diabeticRating:4,emoji:'❤️',tip:'Antioxidants improve insulin sensitivity — 1/2 cup seeds daily',state:'ALL'},
  {name:'Apple',gi:36,category:'Fruit',impact:'Low',region:'Pan India',calories:52,protein:0.3,carbs:14,fiber:2.4,diabeticRating:4,emoji:'🍎',tip:'Quercetin in skin improves insulin sensitivity — always eat with skin',state:'ALL'},
  {name:'Papaya',gi:59,category:'Fruit',impact:'Medium',region:'Pan India',calories:43,protein:0.5,carbs:11,fiber:1.7,diabeticRating:3,emoji:'🍑',tip:'Medium GI but very low calorie — half papaya for breakfast is fine',state:'ALL'},
  {name:'Brown Rice',gi:50,category:'Staple',impact:'Medium',region:'Pan India',calories:123,protein:2.7,carbs:26,fiber:1.8,diabeticRating:4,emoji:'🍚',tip:'Better than white rice — but Mappillai Samba is still superior for TN',state:'ALL'},
  {name:'Oats Porridge',gi:55,category:'Breakfast',impact:'Medium',region:'Pan India',calories:147,protein:5,carbs:27,fiber:4.0,diabeticRating:4,emoji:'🥣',tip:'Beta-glucan fiber proven to reduce post-meal glucose — eat unsweetened',state:'ALL'},
  {name:'Peanuts',gi:14,category:'Snack',impact:'Low',region:'Pan India',calories:567,protein:26,carbs:16,fiber:8.5,diabeticRating:5,emoji:'🥜',tip:'Best snack for diabetics — very low GI, protein+fat+fiber combination',state:'ALL'},
  {name:'Makhana/Fox Nuts',gi:14,category:'Snack',impact:'Low',region:'Pan India',calories:347,protein:9,carbs:76,fiber:14.5,diabeticRating:5,emoji:'⚪',tip:'Roasted foxnuts — excellent evening snack, very low GI, high fiber',state:'ALL'},
  {name:'Okra/Bhindi',gi:20,category:'Side',impact:'Low',region:'Pan India',calories:33,protein:2,carbs:7,fiber:3.2,diabeticRating:5,emoji:'🫑',tip:'Mucilage slows glucose absorption — best vegetable for diabetics',state:'ALL'},
  {name:'Poha',gi:55,category:'Breakfast',impact:'Medium',region:'Central India',calories:180,protein:4,carbs:35,fiber:1.2,diabeticRating:3,emoji:'🍽️',tip:'Add vegetables, peanuts, lemon — significantly lowers GI',state:'MH'},
  {name:'Sprouts Chaat',gi:28,category:'Snack',impact:'Low',region:'Pan India',calories:90,protein:7,carbs:14,fiber:5.5,diabeticRating:5,emoji:'🌱',tip:'Mixed sprouts — eaten raw, live enzymes improve glucose tolerance',state:'ALL'},
  {name:'Cucumber Raita',gi:10,category:'Side',impact:'Low',region:'Pan India',calories:45,protein:3,carbs:5,fiber:0.5,diabeticRating:5,emoji:'🥒',tip:'Cooling, zero glucose impact — eat freely with any meal',state:'ALL'},
  {name:'Boiled Egg',gi:0,category:'Protein',impact:'Low',region:'Pan India',calories:78,protein:6,carbs:0.6,fiber:0,diabeticRating:5,emoji:'🥚',tip:'Zero carb impact — perfect protein. Eat 1-2 daily if non-vegetarian',state:'ALL'},
  {name:'Watermelon',gi:72,category:'Fruit',impact:'High',region:'Pan India',calories:30,protein:0.6,carbs:8,fiber:0.4,diabeticRating:2,emoji:'🍉',tip:'High GI but low sugar load — 1 cup only, not half a melon',state:'ALL'},
  {name:'Green Tea',gi:0,category:'Beverage',impact:'Low',region:'Pan India',calories:2,protein:0,carbs:0.5,fiber:0,diabeticRating:5,emoji:'🍵',tip:'EGCG catechins lower post-meal glucose — 2 cups daily recommended',state:'ALL'},
  {name:'Flaxseeds',gi:10,category:'Snack',impact:'Low',region:'Pan India',calories:534,protein:18,carbs:29,fiber:27.3,diabeticRating:5,emoji:'🟤',tip:'1 tbsp ground in water — highest fiber density, reduces glucose spike by 25%',state:'ALL'},
  {name:'Almonds',gi:0,category:'Snack',impact:'Low',region:'Pan India',calories:579,protein:21,carbs:22,fiber:12.5,diabeticRating:5,emoji:'🤎',tip:'8-10 soaked almonds daily — proven to reduce fasting glucose and HbA1c',state:'ALL'},
  {name:'Masala Chai (no sugar)',gi:5,category:'Beverage',impact:'Low',region:'Pan India',calories:25,protein:1,carbs:3,fiber:0,diabeticRating:4,emoji:'🫖',tip:'Cinnamon and cardamom in chai improve insulin sensitivity — skip the sugar',state:'ALL'},
  {name:'Methi Seeds Water',gi:5,category:'Beverage',impact:'Low',region:'Pan India',calories:10,protein:0.5,carbs:1,fiber:1.0,diabeticRating:5,emoji:'🥤',tip:'Soak 1 tsp overnight, drink fasting — proven to lower fasting glucose',state:'ALL'},
  {name:'Cabbage Sabzi',gi:10,category:'Side',impact:'Low',region:'Pan India',calories:25,protein:1.3,carbs:5,fiber:2.5,diabeticRating:5,emoji:'🥬',tip:'Cruciferous vegetable — anti-inflammatory, eat freely at every meal',state:'ALL'},
  {name:'Tomato Chutney',gi:15,category:'Side',impact:'Low',region:'South India',calories:30,protein:1,carbs:6,fiber:1.5,diabeticRating:4,emoji:'🍅',tip:'Lycopene in tomatoes reduces insulin resistance over time',state:'TN'},
  {name:'Upma',gi:65,category:'Breakfast',impact:'Medium',region:'South India',calories:160,protein:4,carbs:28,fiber:2.0,diabeticRating:3,emoji:'🍽️',tip:'Add lots of vegetables — doubles the fiber and halves the glucose impact',state:'TN'},
  {name:'Vermicelli Upma',gi:58,category:'Breakfast',impact:'Medium',region:'South India',calories:150,protein:4,carbs:28,fiber:1.5,diabeticRating:3,emoji:'🍜',tip:'Wheat vermicelli better than rice noodles — always add vegetables',state:'TN'},
  {name:'Wheat Puttu',gi:52,category:'Breakfast',impact:'Medium',region:'Kerala',calories:98,protein:3,carbs:20,fiber:2.0,diabeticRating:3,emoji:'🫙',tip:'Wheat version is better than rice puttu for glucose management',state:'KL'},
  {name:'Lemon Rice',gi:68,category:'Staple',impact:'High',region:'Tamil Nadu',calories:130,protein:2,carbs:26,fiber:0.8,diabeticRating:2,emoji:'🍚',tip:'High GI — add groundnuts and curry leaves to lower impact',state:'TN'},
]

// Backward-compat alias (used by PatientDashboard, DietLogPage)
export const TAMIL_FOODS = INDIA_FOODS

// ── Population stats ──────────────────────────────────────────────────────────
export const POPULATION_STATS = {
  total:10000, critical:97, high:843, medium:3241, low:5819, avg_tir:58.4, avg_hba1c:8.6,
}

// ── Agent logs ────────────────────────────────────────────────────────────────
export const AGENT_LOGS = [
  { id:'1',  agent:'Triage Agent',           action:'Population scan — 10,000 patients',       time:'2 min ago',   status:'done'    },
  { id:'2',  agent:'Clinical Summary Agent', action:'Generated ICD-10 summary: Murugan S.',    time:'5 min ago',   status:'done'    },
  { id:'3',  agent:'Diet Advisor',           action:'Responded to Kavitha R. food query',      time:'8 min ago',   status:'done'    },
  { id:'4',  agent:'Alert Agent',            action:'Critical alert — Rajesh P. glucose 340',  time:'12 min ago',  status:'alert'   },
  { id:'5',  agent:'Metabolic Twin',         action:'Re-trained model: Arjun N. (42 samples)', time:'18 min ago',  status:'done'    },
  { id:'6',  agent:'FHIR Sync Agent',        action:'Synced CGM data — 847 patients',          time:'25 min ago',  status:'done'    },
  { id:'7',  agent:'Triage Agent',           action:'Risk re-score: 23 patients updated',      time:'34 min ago',  status:'done'    },
  { id:'8',  agent:'Diet Advisor',           action:'Meal plan generated: Priya S.',           time:'41 min ago',  status:'done'    },
  { id:'9',  agent:'Alert Agent',            action:'High risk alert — Sundari M. HbA1c 9.4%', time:'55 min ago',  status:'alert'   },
  { id:'10', agent:'Clinical Summary Agent', action:'Batch report: 12 patients, Madurai zone', time:'1 hr ago',    status:'done'    },
  { id:'11', agent:'FHIR Sync Agent',        action:'R4 compliance check passed — all records', time:'1.5 hrs ago', status:'done'   },
  { id:'12', agent:'Metabolic Twin',         action:'Model drift detected — Meena K. retraining','time':'2 hrs ago',status:'running'},
  { id:'13', agent:'Triage Agent',           action:'Coimbatore region sweep complete',        time:'2.5 hrs ago', status:'done'    },
  { id:'14', agent:'Diet Advisor',           action:'Tamil Nadu food guide updated: 65 items', time:'3 hrs ago',   status:'done'    },
  { id:'15', agent:'Alert Agent',            action:'Weekly critical patient summary sent',    time:'4 hrs ago',   status:'done'    },
  { id:'16', agent:'Clinical Summary Agent', action:'ICD-10 batch: E11.65 codes — 97 patients','time':'5 hrs ago', status:'done'  },
]
