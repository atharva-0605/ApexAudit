import re
from typing import List
from app.models.schemas import SourceInput, IndependenceEdge

def extract_significant_shingles(text: str, n: int = 5) -> set:
    """Extracts lowercase word n-grams, filtering out short punctuation."""
    words = re.findall(r'\b[a-zA-Z0-9]{3,}\b', text.lower())
    shingles = set()
    for i in range(len(words) - n + 1):
        shingles.add(" ".join(words[i:i+n]))
    return shingles

def find_shared_phrases(text1: str, text2: str, min_words: int = 6) -> List[str]:
    """Finds exact shared verbatim sentence fragments of at least min_words words."""
    words1 = text1.split()
    shared = []
    
    # Simple window slide
    for window_len in [12, 8, 6]:
        for i in range(0, len(words1) - window_len + 1, 2):
            phrase = " ".join(words1[i:i+window_len])
            # Clean punctuation for matching
            cleaned = re.sub(r'[^\w\s]', '', phrase).lower()
            cleaned_text2 = re.sub(r'[^\w\s]', '', text2).lower()
            if len(cleaned.split()) >= min_words and cleaned in cleaned_text2:
                if not any(phrase in existing for existing in shared):
                    shared.append(phrase)
                if len(shared) >= 3:
                    break
        if shared:
            break

    return shared

def build_source_independence_graph(sources: List[SourceInput]) -> List[IndependenceEdge]:
    """
    Detects echo sources, syndications, or single origins across ingested sources.
    Warns users when two sources agree not because of independent truth,
    but because one copied the other verbatim.
    """
    edges: List[IndependenceEdge] = []

    for i in range(len(sources)):
        for j in range(i + 1, len(sources)):
            s1, s2 = sources[i], sources[j]

            shingles1 = extract_significant_shingles(s1.raw_text, n=4)
            shingles2 = extract_significant_shingles(s2.raw_text, n=4)

            if not shingles1 or not shingles2:
                continue

            intersection = shingles1.intersection(shingles2)
            union = shingles1.union(shingles2)
            jaccard = len(intersection) / len(union) if union else 0.0

            shared_phrases = find_shared_phrases(s1.raw_text, s2.raw_text)

            if jaccard > 0.35 or len(shared_phrases) >= 2 or (jaccard > 0.2 and len(shared_phrases) >= 1):
                relation = "echo_source"
                risk_summary = (
                    f"High phrase overlap ({round(jaccard*100, 1)}% n-gram match). "
                    f"'{s2.title}' appears to echo or mirror '{s1.title}'. "
                    f"These sources do not represent independent confirmation."
                )
            elif jaccard > 0.15 or len(shared_phrases) >= 1:
                relation = "derived_copy"
                risk_summary = (
                    f"Moderate text overlap detected ({round(jaccard*100, 1)}% match). "
                    f"Possible secondary aggregation or syndication between sources."
                )
            else:
                relation = "independent"
                risk_summary = f"No significant phrasing overlap detected ({round(jaccard*100, 1)}% match). Sources appear independently authored."

            edges.append(IndependenceEdge(
                source_a_id=s1.id,
                source_a_title=s1.title,
                source_b_id=s2.id,
                source_b_title=s2.title,
                relation_type=relation,
                similarity_score=round(jaccard, 3),
                shared_phrases=shared_phrases[:3],
                risk_summary=risk_summary
            ))

    return edges
