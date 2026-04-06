"""
Food Vision API — uses Claude claude-sonnet-4-6 to identify Indian food from photos.
"""
import base64
import json
import httpx
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.config import settings

router = APIRouter()

FOOD_LIST = [
    "Idly", "Dosa", "Adai", "Pesarattu", "Pongal", "Ponni Rice", "Mappillai Samba",
    "Seeraga Samba", "Ragi Koozh", "Sambar", "Rasam", "Kootu", "Avial", "Sundal",
    "Kollu Rasam", "Keerai Masiyal", "Drumstick Sambar", "Vazhaipoo Kootu", "Ragi Mudde",
    "Moringa Leaf Dal", "Curd Rice", "Neer Mor", "Filter Coffee", "Karunai Kizhangu",
    "Kathirikai Gotsu", "Murukku", "Paniyaram", "Paruppu Sadham", "Guava", "Banana",
    "Jackfruit", "Poriyal", "Chicken Chettinad", "Prawn Masala", "Kanji",
    "Kerala Fish Curry", "Puttu", "Appam", "Idiyappam", "Tapioca Kappa", "Bisibele Bath",
    "Jowar Roti", "Andhra Gongura", "Neer Dosa", "Coconut Chutney", "Pesarattu Upma",
    "Akki Roti", "Mirchi Bajji", "Hyderabadi Dal", "Chapati", "Multigrain Roti",
    "Bajra Roti", "Dal Makhani", "Rajma", "Chana Dal", "Moong Dal", "Methi Paratha",
    "Sarson Saag", "Palak Paneer", "Besan Cheela", "Karela Sabzi", "Lauki Sabzi",
    "Jamun", "Jowar Bhakri", "Sattu Drink", "Oats Porridge", "Brown Rice", "Poha",
    "Sprouts Chaat", "Upma", "Lemon Rice", "Ragi Dosa", "Thoran", "Kerala Sadya",
    "Makhana/Fox Nuts", "Peanuts", "Almonds", "Flaxseeds", "Okra/Bhindi",
    "Boiled Egg", "Watermelon", "Green Tea", "Pomegranate", "Apple", "Papaya",
]

SYSTEM_PROMPT = f"""You are an expert Indian food identifier specialising in South Indian cuisine,
especially Tamil Nadu foods. When shown a food photo, identify the exact food item and respond
ONLY with a valid JSON object in this exact format (no other text, no markdown):

{{"food_name": "Idly", "confidence": 95, "reasoning": "white steamed rice cakes, soft texture, served on plate"}}

The food_name MUST exactly match one of these options (pick the closest match):
{", ".join(FOOD_LIST)}

Key visual references:
- Idly (also spelled idli): white round steamed rice cakes, usually served in pairs or sets of 4 on a plate. Soft, pillowy, light-coloured. Very common South Indian breakfast. If you see white round steamed dumplings or cakes on a plate, they are almost certainly Idly.
- Dosa: thin crispy crepe, golden-brown, usually rolled or folded.
- Sambar: brownish-orange lentil and vegetable soup/stew, often served alongside idly.
- Pongal: creamy yellow rice-lentil porridge, soft texture.
- Vada: ring-shaped fried lentil doughnuts, golden-brown and crispy.

Rules:
- confidence: integer 0-100 reflecting how certain you are
- reasoning: 1 short sentence describing the visual features you saw
- If the food is not Indian or not in the list, pick the closest match and set confidence below 60
- If the image is not food at all: {{"food_name": "Idly", "confidence": 5, "reasoning": "not a food image"}}
- NEVER return anything except the raw JSON object"""


@router.post("/analyze")
async def analyze_food(file: UploadFile = File(...)):
    """Identify Indian food from an uploaded photo using Claude Vision."""
    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="ANTHROPIC_API_KEY not configured. Add it to backend/.env"
        )

    # Read and base64-encode the image
    image_bytes = await file.read()
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    media_type = file.content_type or "image/jpeg"

    payload = {
        "model": "claude-sonnet-4-6",
        "max_tokens": 300,
        "system": SYSTEM_PROMPT,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_b64,
                        },
                    },
                    {
                        "type": "text",
                        "text": "What Indian food is this? Respond with JSON only.",
                    },
                ],
            }
        ],
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": settings.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json=payload,
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Claude API error {resp.status_code}: {resp.text[:200]}"
        )

    raw_text = resp.json()["content"][0]["text"].strip()

    # Strip markdown fences if Claude wraps in ```json
    clean = raw_text.replace("```json", "").replace("```", "").strip()

    try:
        result = json.loads(clean)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail=f"Could not parse AI response: {raw_text[:100]}")

    return {
        "food_name":  result.get("food_name", ""),
        "confidence": int(result.get("confidence", 0)),
        "reasoning":  result.get("reasoning", ""),
    }
