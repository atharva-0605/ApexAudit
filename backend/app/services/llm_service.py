import json
import logging
import re
from typing import List, Optional, Dict, Any
from app.config import settings
from app.models.schemas import BlueprintItem, SourceInput, Claim
from app.services.verifier_service import verify_quote_verbatim

logger = logging.getLogger(__name__)

# In-memory LRU-style cache for blueprints to preserve LLM quota
_BLUEPRINT_CACHE: Dict[str, List[BlueprintItem]] = {}

def get_gemini_client():
    """Initializes and returns the official Google GenAI client if an API key is configured."""
    if not settings.GEMINI_API_KEY:
        return None
    try:
        from google import genai
        # Initialize client with a fast timeout (default 4.0s) to avoid stalling requests
        timeout_val = getattr(settings, "GEMINI_TIMEOUT_SECONDS", 4.0)
        return genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options={"timeout": timeout_val}
        )
    except Exception as e:
        logger.warning(f"Could not initialize Google GenAI Client: {e}")
        return None

def clean_json_response(text: str) -> str:
    """Strips markdown code fences and extraneous text from JSON responses."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def generate_blueprint_with_gemini(goal: str, context: str = "") -> Optional[List[BlueprintItem]]:
    """
    Calls Google Gemini to generate a structured pre-mortem blueprint.
    Worked backward from catastrophic failure scenarios into knowledge items.
    Returns None if the LLM is unavailable or fails, allowing graceful fallback.
    """
    cache_key = f"{goal.strip().lower()}::{context.strip().lower()}"
    if cache_key in _BLUEPRINT_CACHE:
        return _BLUEPRINT_CACHE[cache_key]

    client = get_gemini_client()
    if not client:
        return None

    prompt = f"""
You are a Senior Pre-Mortem Risk Analyst and Knowledge Blueprint Architect for ApexAudit.

GOAL / DECISION OBJECTIVE:
"{goal}"

ADDITIONAL CONTEXT:
"{context or 'None provided'}"

TASK:
Perform a rigorous Pre-Mortem Analysis on this objective. Assume the user acted on partial, contradictory, or outdated information and failed completely (e.g. application rejected, scholarship cancelled, license revoked, visa denied, severe penalty incurred).
Work backward from these catastrophic failure scenarios to derive 5 to 7 critical knowledge aspects that must be verified.

OUTPUT SPECIFICATION:
Respond ONLY with a valid JSON array of objects with the following schema:
[
  {{
    "id": "bp-aspect-slug",
    "aspect": "Clear, concise name of the requirement/policy",
    "failure_scenario": "Specific catastrophic failure mode that occurs if this is unverified, outdated, or conflicting",
    "criticality": "HIGH" | "MEDIUM" | "LOW",
    "description": "Specific guideline, documentation, or threshold to verify",
    "weight": 1.0 (for HIGH), 0.6 (for MEDIUM), or 0.3 (for LOW)
  }}
]

RULES:
- Provide between 5 and 7 items.
- At least 3 items must have "criticality": "HIGH".
- Return ONLY the JSON array, no commentary.
"""

    from google.genai import types

    model_name = settings.GEMINI_MODEL or "gemini-3.5-flash"
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2
            )
        )
        raw_text = clean_json_response(response.text)
        parsed = json.loads(raw_text)

        items: List[BlueprintItem] = []
        if isinstance(parsed, list):
            for idx, entry in enumerate(parsed):
                try:
                    crit = entry.get("criticality", "HIGH").upper()
                    if crit not in ["HIGH", "MEDIUM", "LOW"]:
                        crit = "HIGH"
                    weight = 1.0 if crit == "HIGH" else (0.6 if crit == "MEDIUM" else 0.3)
                    
                    item = BlueprintItem(
                        id=entry.get("id") or f"bp-{idx+1}",
                        aspect=entry.get("aspect", f"Requirement {idx+1}"),
                        failure_scenario=entry.get("failure_scenario", "Failure due to unverified criteria."),
                        criticality=crit,
                        description=entry.get("description", ""),
                        weight=float(entry.get("weight", weight))
                    )
                    items.append(item)
                except Exception as parse_err:
                    logger.warning(f"Skipping malformed blueprint item: {parse_err}")

        if len(items) >= 3:
            _BLUEPRINT_CACHE[cache_key] = items
            logger.info(f"Successfully generated {len(items)} blueprint items using {model_name}")
            return items

    except Exception as e:
        logger.warning(
            f"Gemini blueprint generation failed/timed out with {model_name} ({e}). "
            "Immediately failing fast to instant pre-cached fallback."
        )
        return None

    return None

def extract_claims_with_gemini(
    sources: List[SourceInput],
    blueprint: List[BlueprintItem]
) -> Optional[List[Claim]]:
    """
    Batches sources into an LLM call to extract candidate atomic claims from source texts matching blueprint items,
    then strictly enforces the Verbatim Quote Verifier on every single extracted claim.
    Returns None if LLM is unavailable or fails, allowing seamless rule-based fallback.
    """
    client = get_gemini_client()
    if not client or not sources or not blueprint:
        return None

    # Prepare blueprint requirements
    bp_summary = [
        {"aspect_id": b.id, "aspect": b.aspect, "failure_scenario": b.failure_scenario}
        for b in blueprint
    ]

    # Prepare batched source texts
    source_payload = []
    source_map = {s.id: s for s in sources}
    for s in sources:
        source_payload.append({
            "source_id": s.id,
            "title": s.title,
            "text": s.raw_text[:4000] # Safe excerpt for prompt
        })

    prompt = f"""
You are the Strict Information Extraction Engine for ApexAudit.

BLUEPRINT REQUIREMENTS TO VERIFY:
{json.dumps(bp_summary, indent=2)}

SOURCE DOCUMENTS TO ANALYZE:
{json.dumps(source_payload, indent=2)}

TASK:
For each blueprint requirement discussed in the source documents, extract the claim and the EXACT verbatim quotation from that specific source's text.

CRITICAL VERBATIM QUOTE RULE:
- Every `exact_quote` MUST be an exact, word-for-word, verbatim substring found in that source's text.
- Do NOT edit, omit punctuation inside the quote, or paraphrase.
- If a source does not state a rule for a requirement, DO NOT extract a claim for it.
- In `extracted_value`, provide the specific key value (e.g. deadline date, income limit amount, percentage, or requirement).

OUTPUT FORMAT:
Return a JSON array of objects:
[
  {{
    "source_id": "matching source_id from above",
    "aspect_id": "matching aspect_id from above",
    "claim_text": "Concise statement of what the source asserts",
    "exact_quote": "Exact verbatim sentence or clause directly copied from the source text",
    "extracted_value": "Key value (e.g., Rs. 4,50,000 / October 31 / 50% marks)",
    "confidence": 0.95
  }}
]
"""

    from google.genai import types

    model_name = settings.GEMINI_MODEL or "gemini-3.5-flash"
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )
        raw_json = clean_json_response(response.text)
        parsed_claims = json.loads(raw_json)

        claims: List[Claim] = []
        claim_counter = 1

        if isinstance(parsed_claims, list):
            for c_entry in parsed_claims:
                quote = c_entry.get("exact_quote", "").strip()
                aspect_id = c_entry.get("aspect_id", "")
                src_id = c_entry.get("source_id", "")
                src = source_map.get(src_id)

                if not src:
                    continue

                # STRICT QUOTE VERIFICATION: Must exist verbatim in source text
                is_verbatim, s_idx, e_idx = verify_quote_verbatim(quote, src.raw_text)
                if is_verbatim and aspect_id:
                    claims.append(Claim(
                        id=f"clm-llm-{claim_counter}",
                        source_id=src_id,
                        aspect_id=aspect_id,
                        claim_text=c_entry.get("claim_text", quote[:80]),
                        exact_quote=quote,
                        verified_verbatim=True,
                        char_start=s_idx,
                        char_end=e_idx,
                        extracted_value=c_entry.get("extracted_value"),
                        confidence=float(c_entry.get("confidence", src.authority_score))
                    ))
                    claim_counter += 1
                else:
                    logger.info(f"Discarded non-verbatim claim from LLM output for '{aspect_id}' in '{src_id}': {quote[:40]}...")

        if len(claims) > 0:
            logger.info(f"Extracted {len(claims)} strictly verified claims via {model_name}")
            return claims

    except Exception as e:
        logger.warning(
            f"Gemini claim extraction failed/timed out with {model_name} ({e}). "
            "Immediately failing fast to instant heuristic extraction."
        )
        return None

    return None
