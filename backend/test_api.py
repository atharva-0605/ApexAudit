"""
Direct test script to verify all backend services, demo execution, and Google Gemini integration.
"""
import sys
import os

# Ensure backend root is on python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.source_service import load_demo_csss
from app.services.blueprint_service import generate_blueprint_for_goal
from app.services.verifier_service import extract_grounded_claims, verify_quote_verbatim
from app.services.conflict_service import detect_conflicts, detect_temporal_drifts, build_evidence_matrix
from app.services.independence_service import build_source_independence_graph
from app.services.readiness_service import calculate_readiness_and_kit
from app.models.schemas import SourceInput, BlueprintItem
from app.config import settings

def test_pipeline():
    print("=== TEST 1: Load CSSS Scholarship Demo Dataset ===")
    demo_data = load_demo_csss()
    print(f"Loaded demo: {demo_data.get('name')}")
    assert len(demo_data.get("sources", [])) == 3
    assert len(demo_data.get("blueprint", [])) == 7

    sources = [SourceInput(**s) for s in demo_data["sources"]]
    blueprint = [BlueprintItem(**b) for b in demo_data["blueprint"]]

    print("\n=== TEST 2: Strict Verbatim Quote Verification ===")
    claims = extract_grounded_claims(sources, blueprint)
    print(f"Extracted {len(claims)} strictly verified claims.")
    for c in claims[:4]:
        print(f" - [{c.aspect_id}] from '{c.source_id}': \"{c.exact_quote[:60]}...\" (Verbatim: {c.verified_verbatim})")
        # Ensure it exists in the source text
        src = next(s for s in sources if s.id == c.source_id)
        is_verb, s_idx, e_idx = verify_quote_verbatim(c.exact_quote, src.raw_text)
        assert is_verb, f"Claim quote failed verbatim verification: {c.exact_quote}"

    print("\n=== TEST 3: Conflict & Temporal Drift Detection ===")
    conflicts = detect_conflicts(claims, sources, blueprint)
    print(f"Detected {len(conflicts)} cross-source conflicts:")
    for cf in conflicts:
        print(f" - Conflict in '{cf.aspect_name}': {cf.contrast_summary}")
    assert len(conflicts) > 0, "Expected to find conflicts in CSSS demo (e.g. income limit 4.5L vs 8L, deadline Oct vs Dec, Aadhaar mandatory vs optional)"

    drifts = detect_temporal_drifts(sources)
    print(f"\nDetected {len(drifts)} temporal drift findings:")
    for td in drifts:
        print(f" - [{td.source_title}]: {td.reason}")

    print("\n=== TEST 4: Source Independence & Echo Graph ===")
    edges = build_source_independence_graph(sources)
    print(f"Independence edges ({len(edges)} pairs):")
    for e in edges:
        print(f" - [{e.source_a_title[:30]} <-> {e.source_b_title[:30]}]: {e.relation_type} ({e.similarity_score*100}% overlap)")
    echo_edges = [e for e in edges if e.relation_type in ["echo_source", "derived_copy"]]
    assert len(echo_edges) > 0, "Expected to detect echo source relationship between StudentSpot blog and EduInfo portal!"

    print("\n=== TEST 5: Evidence Matrix ===")
    matrix = build_evidence_matrix(blueprint, sources, claims, conflicts, drifts)
    print(f"Matrix built with {len(matrix)} cells ({len(blueprint)} aspects x {len(sources)} sources).")

    print("\n=== TEST 6: Decision Readiness Score & Verification Kit ===")
    readiness, checklist, three_lane = calculate_readiness_and_kit(
        goal=demo_data["goal"],
        blueprint=blueprint,
        sources=sources,
        claims=claims,
        conflicts=conflicts,
        temporal_drifts=drifts,
        independence_edges=edges,
        verified_checklist_ids=[]
    )
    print(f"Initial Readiness Score: {readiness.score}/100 ({readiness.status})")
    print(f"Breakdown: Base={readiness.breakdown.base_coverage_score}, Conflict Penalty={readiness.breakdown.conflict_penalty}, Freshness Penalty={readiness.breakdown.freshness_penalty}, Echo Penalty={readiness.breakdown.echo_penalty}")
    print(f"Top 3 Prioritized Checklist Items (Impact x Uncertainty):")
    for item in checklist[:3]:
        print(f" - [Rank #{item.priority_rank}] {item.title} (Priority Score: {item.priority_score} = {item.impact_score} x {item.uncertainty_score})")
    print(f"Three-Lane Trust Dashboard:")
    print(f" - Lane 1 (Quote-Grounded): {len(three_lane.quote_grounded)} claims")
    print(f" - Lane 2 (AI-Suggested Rules): {len(three_lane.ai_suggested)} rules")
    print(f" - Lane 3 (Not Found / Gaps): {len(three_lane.not_found)} blindspots")

    print("\n=== TEST 7: Interactive Verification Live Score Update ===")
    # Simulate user verifying top 2 critical items (e.g. income and bank NPCI)
    verified_ids = [checklist[0].id, checklist[1].id]
    readiness_updated, checklist_updated, _ = calculate_readiness_and_kit(
        goal=demo_data["goal"],
        blueprint=blueprint,
        sources=sources,
        claims=claims,
        conflicts=conflicts,
        temporal_drifts=drifts,
        independence_edges=edges,
        verified_checklist_ids=verified_ids
    )
    print(f"Updated Readiness Score after user verification: {readiness_updated.score}/100 (+{readiness_updated.score - readiness.score} points!)")
    assert readiness_updated.score > readiness.score

    print("\n=== TEST 8: Google Gemini API Live Integration & Graceful Fallback ===")
    print(f"Configured GEMINI_API_KEY present: {bool(settings.GEMINI_API_KEY)}")
    print(f"Configured GEMINI_MODEL: {settings.GEMINI_MODEL}")

    # Test blueprint generation for a custom novel goal
    novel_goal = "Renew high-risk hazardous chemical handling commercial license for a manufacturing facility"
    bp_novel = generate_blueprint_for_goal(novel_goal)
    print(f"Generated {len(bp_novel)} blueprint items for novel goal.")
    assert len(bp_novel) >= 3, "Blueprint generation must produce at least 3 requirements"
    for item in bp_novel[:3]:
        print(f" - [{item.criticality}] {item.aspect}: {item.failure_scenario[:75]}...")

    # Test claim extraction with live sources and blueprint
    claims_extracted = extract_grounded_claims(sources, blueprint)
    assert len(claims_extracted) > 0, "Claim extraction must extract grounded claims"
    print(f"Verified {len(claims_extracted)} total grounded claims across sources.")

    print("\nALL APEXAUDIT BACKEND TESTS PASSED SUCCESSFULLY! [PASS]")

if __name__ == "__main__":
    test_pipeline()
