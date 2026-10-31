from typing import List, Dict, Any, Set
from app.models.schemas import (
    BlueprintItem, SourceInput, Claim, ConflictFinding,
    TemporalDriftFinding, IndependenceEdge, ReadinessScore,
    ReadinessBreakdown, VerificationChecklistItem, ThreeLaneTrust
)

def calculate_readiness_and_kit(
    goal: str,
    blueprint: List[BlueprintItem],
    sources: List[SourceInput],
    claims: List[Claim],
    conflicts: List[ConflictFinding],
    temporal_drifts: List[TemporalDriftFinding],
    independence_edges: List[IndependenceEdge],
    verified_checklist_ids: List[str] = None
) -> (ReadinessScore, List[VerificationChecklistItem], ThreeLaneTrust):
    """
    Computes the live Decision Readiness Score, builds the Three-Lane Trust Dashboard,
    and generates the Prioritized Verification Checklist ranked by Impact x Uncertainty.
    """
    if verified_checklist_ids is None:
        verified_checklist_ids = []
    verified_set: Set[str] = set(verified_checklist_ids)

    outdated_source_ids = {td.source_id for td in temporal_drifts}
    echo_source_ids = {edge.source_b_id for edge in independence_edges if edge.relation_type in ["echo_source", "derived_copy"]}
    conflict_aspect_ids = {cf.aspect_id for cf in conflicts}

    # Map aspect -> claims
    aspect_claims_map: Dict[str, List[Claim]] = {}
    for c in claims:
        aspect_claims_map.setdefault(c.aspect_id, []).append(c)

    # 1. Calculate Base Coverage Score
    total_blueprint_weight = sum(item.weight for item in blueprint) if blueprint else 1.0
    covered_weight = 0.0

    uncovered_aspects: List[BlueprintItem] = []
    conflicted_aspects: List[BlueprintItem] = []

    for bp in blueprint:
        c_list = aspect_claims_map.get(bp.id, [])
        is_user_verified = bp.id in verified_set or f"chk-{bp.id}" in verified_set

        if is_user_verified:
            covered_weight += bp.weight
        elif not c_list:
            uncovered_aspects.append(bp)
        elif bp.id in conflict_aspect_ids:
            conflicted_aspects.append(bp)
            # Partial weight if conflicting
            covered_weight += bp.weight * 0.25
        else:
            # Check if all sources covering this are outdated or echo
            sources_covering = [c.source_id for c in c_list]
            all_flawed = all(sid in outdated_source_ids or sid in echo_source_ids for sid in sources_covering)
            if all_flawed:
                covered_weight += bp.weight * 0.5
            else:
                covered_weight += bp.weight

    base_coverage_pct = min(100.0, (covered_weight / total_blueprint_weight) * 100.0) if total_blueprint_weight > 0 else 0.0

    # 2. Penalties
    conflict_penalty = min(35.0, len(conflicts) * 12.0)
    freshness_penalty = min(25.0, len(temporal_drifts) * 8.0)
    echo_penalty = min(20.0, len([e for e in independence_edges if e.relation_type == "echo_source"]) * 7.0)
    
    # 3. User verification bonus
    user_verified_count = len(verified_set)
    user_verified_bonus = min(30.0, user_verified_count * 10.0)

    # Final score
    raw_final = base_coverage_pct - conflict_penalty - freshness_penalty - echo_penalty + user_verified_bonus
    final_score = int(max(0.0, min(100.0, round(raw_final))))

    if final_score >= 80:
        status = "Decision Ready"
        summary = "High coverage with verified verbatim evidence and minimal unresolved conflict. Ready for confident real-world execution."
    elif final_score >= 50:
        status = "Needs Verification"
        summary = "Core information exists but significant conflicts, outdated dates, or unverified blindspots require checking before acting."
    else:
        status = "High Risk / Blindspots Present"
        summary = "Critical failure scenarios remain unaddressed, conflicting, or dependent on uncorroborated echo sources. Acting now carries severe rejection risk."

    readiness = ReadinessScore(
        score=final_score,
        status=status,
        breakdown=ReadinessBreakdown(
            base_coverage_score=round(base_coverage_pct, 1),
            freshness_penalty=round(conflict_penalty, 1),
            conflict_penalty=round(conflict_penalty, 1),
            echo_penalty=round(echo_penalty, 1),
            user_verified_bonus=round(user_verified_bonus, 1),
            final_score=float(final_score)
        ),
        summary=summary
    )

    # 4. Three-Lane Trust Dashboard
    quote_grounded = []
    for c in claims:
        quote_grounded.append({
            "id": c.id,
            "aspect_id": c.aspect_id,
            "claim_text": c.claim_text,
            "exact_quote": c.exact_quote,
            "source_id": c.source_id,
            "confidence": c.confidence,
            "badge": "Verbatim Verified"
        })

    ai_suggested = []
    for bp in blueprint:
        ai_suggested.append({
            "aspect_id": bp.id,
            "aspect": bp.aspect,
            "suggested_risk_rule": bp.failure_scenario,
            "criticality": bp.criticality,
            "badge": "Inferred Pre-Mortem Rule"
        })

    not_found = []
    for bp in blueprint:
        if bp.id not in aspect_claims_map or len(aspect_claims_map[bp.id]) == 0:
            not_found.append({
                "aspect_id": bp.id,
                "aspect": bp.aspect,
                "gap_description": f"No reviewed sources contained verified guidelines on '{bp.aspect}'.",
                "failure_risk": bp.failure_scenario,
                "badge": "Potential Blindspot"
            })

    three_lane = ThreeLaneTrust(
        quote_grounded=quote_grounded,
        ai_suggested=ai_suggested,
        not_found=not_found
    )

    # 5. Prioritized Verification Checklist (Ranked by Impact * Uncertainty)
    checklist: List[VerificationChecklistItem] = []

    # Domain specific official portals & templates
    domain_official_links = [
        "https://scholarships.gov.in/ (National Scholarship Portal)",
        "https://pfms.nic.in/ (Public Financial Management System / DBT Tracker)",
        "https://myaadhaar.uidai.gov.in/ (UIDAI Aadhaar - Bank Seeding Status Check)"
    ]

    for idx, bp in enumerate(blueprint):
        chk_id = f"chk-{bp.id}"
        is_verified = chk_id in verified_set or bp.id in verified_set

        # Impact score
        if bp.criticality == "HIGH":
            impact = 10
        elif bp.criticality == "MEDIUM":
            impact = 6
        else:
            impact = 3

        # Uncertainty score
        has_conflict = bp.id in conflict_aspect_ids
        is_missing = bp.id not in aspect_claims_map or len(aspect_claims_map[bp.id]) == 0
        has_outdated = any(c.source_id in outdated_source_ids for c in aspect_claims_map.get(bp.id, []))

        if is_verified:
            uncertainty = 1
        elif has_conflict:
            uncertainty = 10
        elif is_missing:
            uncertainty = 9
        elif has_outdated:
            uncertainty = 7
        else:
            uncertainty = 3

        priority_score = impact * uncertainty

        # Draft email query
        draft_email = (
            f"Subject: Urgent Clarification Request: {bp.aspect} for {goal}\n\n"
            f"Respected Authority / Helpdesk Officer,\n\n"
            f"I am preparing my application/renewal for '{goal}'. "
            f"I noticed conflicting or incomplete information regarding '{bp.aspect}'. Specifically, I need to prevent the following failure condition:\n"
            f"\"{bp.failure_scenario}\"\n\n"
            f"Could you please confirm the official guideline and acceptable documentation for the current cycle?\n\n"
            f"Thank you,\nApplicant"
        )

        # Recommended action
        if has_conflict:
            rec_action = f"Possible conflict detected across sources. Contact official authority or verify against current circular before relying on third-party aggregators."
        elif is_missing:
            rec_action = f"Information not found in sources reviewed. Check institute nodal officer or official helpdesk directly."
        elif has_outdated:
            rec_action = f"Source may be dated. Verify current operational year notifications."
        else:
            rec_action = f"Quote verified in official guidelines. Confirm your personal documents match these exact criteria."

        checklist.append(VerificationChecklistItem(
            id=chk_id,
            aspect_id=bp.id,
            title=f"Verify {bp.aspect}",
            impact_score=impact,
            uncertainty_score=uncertainty,
            priority_rank=0, # populated after sorting
            priority_score=priority_score,
            verified_by_user=is_verified,
            verification_notes=None,
            official_links=domain_official_links,
            draft_email_query=draft_email,
            recommended_action=rec_action
        ))

    # Sort checklist by priority_score descending
    checklist.sort(key=lambda item: item.priority_score, reverse=True)
    for rank, item in enumerate(checklist, start=1):
        item.priority_rank = rank

    return readiness, checklist, three_lane
