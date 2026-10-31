import re
import logging
from typing import List, Tuple, Optional, Set
from app.models.schemas import Claim, SourceInput, BlueprintItem

logger = logging.getLogger(__name__)

def normalize_text_for_search(text: str) -> str:
    """Normalizes whitespace and standardizes quotes for robust verbatim matching."""
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = text.replace('“', '"').replace('”', '"').replace('‘', "'").replace('’', "'")
    return text

def verify_quote_verbatim(quote: str, raw_text: str) -> Tuple[bool, Optional[int], Optional[int]]:
    """
    STRICT QUOTE VERIFIER:
    Verifies whether the quote exists verbatim within the raw source text.
    Returns (is_verbatim, char_start, char_end).
    """
    if not quote or not raw_text:
        return False, None, None

    # Direct substring search
    idx = raw_text.find(quote)
    if idx != -1:
        return True, idx, idx + len(quote)

    # Whitespace normalized search
    norm_quote = normalize_text_for_search(quote).strip()
    norm_raw = normalize_text_for_search(raw_text)

    # Regex search allowing flexible intra-word whitespace
    escaped_tokens = [re.escape(tok) for tok in norm_quote.split()]
    if not escaped_tokens:
        return False, None, None

    pattern = r'\s+'.join(escaped_tokens)
    match = re.search(pattern, norm_raw, flags=re.IGNORECASE)
    if match:
        return True, match.start(), match.end()

    return False, None, None

def _extract_heuristic_claims(sources: List[SourceInput], blueprint: List[BlueprintItem]) -> List[Claim]:
    """Heuristic / pattern-based claim extractor for demo packs and fast offline operation."""
    claims: List[Claim] = []
    claim_counter = 100

    aspect_patterns = {
        "bp-income": [
            (r'(?:income\s*(?:ceiling|limit|criteria)?|parental\s*income).*?(?:Rs\.?\s*[\d,]+(?:\/-)?(?:\s*(?:per\s*annum|lakh))?)', "Income Ceiling"),
            (r'Rs\.?\s*4,50,000(?:\/-)?(?:\s*per\s*annum)?', "Rs. 4,50,000/- per annum"),
            (r'Rs\.?\s*8,00,000(?:\s*per\s*annum)?', "Rs. 8,00,000 per annum"),
            (r'Rs\.?\s*8\s*Lakh(?:\s*per\s*annum)?', "Rs. 8 Lakh per annum")
        ],
        "bp-academic-marks": [
            (r'(?:securing\s*at\s*least|minimum)\s*50%\s*marks(?:\s*in\s*the\s*annual\s*examination)?', "50% marks in annual examination"),
            (r'(?:minimum\s*60%\s*marks(?:\s*in\s*your\s*semester\s*exams)?)', "60% marks in semester exams"),
            (r'80th\s*percentile\s*of\s*successful\s*candidates', "80th percentile in Class XII")
        ],
        "bp-attendance": [
            (r'maintaining\s*not\s*less\s*than\s*75%\s*attendance', "75% minimum attendance"),
            (r'attendance\s*(?:requirement|conduct)?', "Good attendance conduct")
        ],
        "bp-concurrent-scholarship": [
            (r'must\s*not\s*be\s*receiving\s*any\s*other\s*scholarship\s*from\s*Central\s*or\s*State\s*Government', "Dual scholarship prohibited")
        ],
        "bp-bank-npci": [
            (r'bank\s*account\s*must\s*be\s*Aadhaar-seeded\s*and\s*active\s*on\s*the\s*NPCI.*?mapper', "Aadhaar-seeded on NPCI mapper"),
            (r'Aadhaar\s*card\s*is\s*optional\s*for\s*identity\s*proof', "Aadhaar card is optional")
        ],
        "bp-submission-deadline": [
            (r'(?:deadline\s*for\s*student\s*online\s*renewal\s*application\s*submission\s*is\s*strictly|last\s*date).*?October\s*31,\s*2024', "October 31, 2024"),
            (r'(?:extended\s*to|last\s*date.*?)\s*December\s*31,\s*2024', "December 31, 2024")
        ]
    }

    for source in sources:
        text = source.raw_text
        sentences = [s.strip() for s in re.split(r'\n+|\.\s+', text) if len(s.strip()) > 15]

        for bp_item in blueprint:
            matched_for_item = False
            patterns = aspect_patterns.get(bp_item.id, [])
            for pattern, extracted_summary in patterns:
                matches = list(re.finditer(pattern, text, flags=re.IGNORECASE))
                for m in matches:
                    candidate_quote = text[m.start():m.end()].strip()
                    for sentence in sentences:
                        if candidate_quote in sentence:
                            candidate_quote = sentence
                            break

                    is_verbatim, s_idx, e_idx = verify_quote_verbatim(candidate_quote, text)
                    if is_verbatim:
                        claims.append(Claim(
                            id=f"clm-pat-{claim_counter}",
                            source_id=source.id,
                            aspect_id=bp_item.id,
                            claim_text=f"{bp_item.aspect}: {extracted_summary}",
                            exact_quote=candidate_quote,
                            verified_verbatim=True,
                            char_start=s_idx,
                            char_end=e_idx,
                            extracted_value=extracted_summary,
                            confidence=source.authority_score
                        ))
                        claim_counter += 1
                        matched_for_item = True

            # If no pattern matched, fallback to keyword matching inside sentences
            if not matched_for_item:
                keywords = [k.lower() for k in re.findall(r'\b[A-Za-z]{4,}\b', bp_item.aspect) if k.lower() not in ['scheme', 'criteria', 'rules', 'minimum', 'requirement', 'mandatory']]
                for s in sentences:
                    s_lower = s.lower()
                    if any(k in s_lower for k in keywords):
                        is_verbatim, s_idx, e_idx = verify_quote_verbatim(s, text)
                        if is_verbatim:
                            claims.append(Claim(
                                id=f"clm-pat-{claim_counter}",
                                source_id=source.id,
                                aspect_id=bp_item.id,
                                claim_text=f"Observed reference regarding {bp_item.aspect}",
                                exact_quote=s,
                                verified_verbatim=True,
                                char_start=s_idx,
                                char_end=e_idx,
                                extracted_value=s[:60] + "...",
                                confidence=source.authority_score * 0.8
                            ))
                            claim_counter += 1
                            break

    return claims

def extract_grounded_claims(sources: List[SourceInput], blueprint: List[BlueprintItem]) -> List[Claim]:
    """
    Extracts atomic claims tagged by aspect, value, and source location.
    Runs Google Gemini LLM extraction if available, merged with deterministic pattern extraction.
    EVERY finding must carry an exact verbatim quote matching the source text; unmatched claims are discarded.
    """
    all_claims: List[Claim] = []
    seen_quotes: Set[Tuple[str, str, str]] = set()

    # 1. Attempt LLM Claim Extraction with Google Gemini
    try:
        from app.services.llm_service import extract_claims_with_gemini
        llm_claims = extract_claims_with_gemini(sources, blueprint)
        if llm_claims:
            for c in llm_claims:
                key = (c.source_id, c.aspect_id, c.exact_quote.strip().lower())
                if key not in seen_quotes:
                    seen_quotes.add(key)
                    all_claims.append(c)
    except Exception as e:
        logger.warning(f"LLM claim extraction skipped or failed: {e}")

    # 2. Extract Pattern / Heuristic Claims (ensuring high recall and 100% demo stability)
    pattern_claims = _extract_heuristic_claims(sources, blueprint)
    for c in pattern_claims:
        key = (c.source_id, c.aspect_id, c.exact_quote.strip().lower())
        if key not in seen_quotes:
            seen_quotes.add(key)
            all_claims.append(c)

    return all_claims
