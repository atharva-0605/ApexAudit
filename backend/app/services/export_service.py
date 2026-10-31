"""
Export Service for ApexAudit.
Generates comprehensive, quote-grounded Markdown verification reports.
"""

from datetime import datetime
from typing import Dict, Any
from app.models.schemas import AnalysisResponse

def generate_markdown_report(data: AnalysisResponse) -> str:
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    score = data.readiness_score
    b = score.breakdown

    lines = []
    
    # Title & Metadata
    lines.append("# ApexAudit - Decision Readiness Report")
    lines.append(f"**Generated:** {now_str}  ")
    lines.append(f"**Status:** `{score.status}`  ")
    lines.append(f"**Overall Readiness Score:** **{score.score} / 100**\n")
    lines.append("---")
    
    # Executive Summary & Goal
    lines.append("## 1. Executive Summary & Goal")
    lines.append(f"**Decision Goal / Target Question:**")
    lines.append(f"> {data.goal}\n")
    lines.append(f"**Readiness Assessment:**")
    lines.append(f"> {score.summary}\n")
    
    # Score Breakdown Table
    lines.append("### Score Breakdown")
    lines.append("| Metric | Value | Impact |")
    lines.append("| :--- | :---: | :--- |")
    lines.append(f"| Base Coverage Score | {b.base_coverage_score:.0f}% | Weighted coverage of pre-mortem requirements |")
    lines.append(f"| Conflict Penalty | -{b.conflict_penalty:.0f} pts | Deducted for contradictory policy claims |")
    lines.append(f"| Freshness Penalty | -{b.freshness_penalty:.0f} pts | Deducted for stale/outdated sources |")
    lines.append(f"| Echo Source Penalty | -{b.echo_penalty:.0f} pts | Deducted for duplicate/derivative sourcing |")
    lines.append(f"| User Verified Bonus | +{b.user_verified_bonus:.0f} pts | Added for manually confirmed checklist items |")
    lines.append(f"| **Final Decision Readiness** | **{b.final_score:.0f} / 100** | **{score.status}** |\n")

    # Sources Reviewed
    lines.append("## 2. Ingested Sources Reviewed")
    lines.append(f"Total Sources Ingested: **{len(data.sources)}**\n")
    lines.append("| Source Title | Type | Authority | Published / Detected Date | URL |")
    lines.append("| :--- | :---: | :---: | :---: | :--- |")
    for s in data.sources:
        url_link = f"[{s.url}]({s.url})" if s.url else "Pasted Text"
        pub = s.published_date or "Not specified"
        lines.append(f"| {s.title} | `{s.source_type}` | {s.authority_score * 100:.0f}% | {pub} | {url_link} |")
    lines.append("")

    # Pre-Mortem Blueprint
    lines.append("## 3. Pre-Mortem Blueprint & Failure Scenarios")
    lines.append("The pre-mortem blueprint defines catastrophic or costly failure scenarios and works backward to derive non-negotiable verification requirements:\n")
    lines.append("| Requirement / Aspect | Criticality | Weight | Failure Scenario (If Inaccurate/Unverified) |")
    lines.append("| :--- | :---: | :---: | :--- |")
    for bp in data.blueprint:
        lines.append(f"| **{bp.aspect}** | `{bp.criticality}` | {bp.weight} | {bp.failure_scenario} |")
    lines.append("")

    # Evidence Matrix Table
    lines.append("## 4. Evidence Matrix Summary")
    lines.append("Cross-source coverage matrix (`Aspects` × `Sources`):\n")
    # Table header
    source_titles = [s.title[:25] + ("..." if len(s.title) > 25 else "") for s in data.sources]
    header = "| Blueprint Requirement | " + " | ".join(source_titles) + " |"
    separator = "| :--- | " + " | ".join([":---:"] * len(source_titles)) + " |"
    lines.append(header)
    lines.append(separator)

    # Map matrix cells
    cell_map: Dict[str, Dict[str, str]] = {}
    for cell in data.matrix:
        if cell.aspect_id not in cell_map:
            cell_map[cell.aspect_id] = {}
        cell_map[cell.aspect_id][cell.source_id] = cell.status

    for bp in data.blueprint:
        row = [f"**{bp.aspect}**"]
        for s in data.sources:
            status = cell_map.get(bp.id, {}).get(s.id, "Missing")
            if status == "Covered":
                badge = "[Covered]"
            elif status == "Conflicting":
                badge = "**[CONFLICT]**"
            elif status == "Outdated":
                badge = "*[Outdated]*"
            else:
                badge = "- Missing -"
            row.append(badge)
        lines.append("| " + " | ".join(row) + " |")
    lines.append("")

    # Conflicts & Policy Contradictions
    lines.append("## 5. Identified Conflicts & Contradictions")
    if not data.conflicts:
        lines.append("> No direct contradictions detected among the analyzed sources.\n")
    else:
        lines.append(f"Detected **{len(data.conflicts)}** critical discrepancy/discrepancies between sources:\n")
        for i, c in enumerate(data.conflicts, 1):
            lines.append(f"### Discrepancy #{i}: {c.aspect_name} (`{c.severity}`)")
            lines.append(f"**Contrast Summary:** {c.contrast_summary}\n")
            lines.append(f"- **Source A ({c.source_a_title}):**")
            lines.append(f"  > \"{c.quote_a}\"")
            lines.append(f"- **Source B ({c.source_b_title}):**")
            lines.append(f"  > \"{c.quote_b}\"\n")

    # Temporal Drift & Freshness
    lines.append("## 6. Temporal Drift & Date Signals")
    if not data.temporal_drifts:
        lines.append("> All reviewed sources contain current or active date references.\n")
    else:
        for d in data.temporal_drifts:
            outdated_tag = "**OUTDATED**" if d.is_outdated else "CURRENT"
            lines.append(f"- **{d.source_title}** [{outdated_tag}]: {d.reason}")
            lines.append(f"  *Caution:* {d.caution_message}\n")

    # Source Independence & Echo Sources
    lines.append("## 7. Source Independence & Echo Analysis")
    echo_edges = [e for e in data.independence_edges if e.relation_type in ("echo_source", "derived_copy")]
    if not echo_edges:
        lines.append("> All reviewed sources show independent phrasing with no derivative echo patterns detected.\n")
    else:
        lines.append(f"Found **{len(echo_edges)}** derivative or echo relationship(s):\n")
        for e in echo_edges:
            lines.append(f"- **{e.source_a_title}** ↔ **{e.source_b_title}** (`{e.relation_type}`)")
            lines.append(f"  - Similarity Score: {e.similarity_score * 100:.0f}%")
            lines.append(f"  - Risk: {e.risk_summary}")
            if e.shared_phrases:
                lines.append(f"  - Shared Phrasing: *\"{e.shared_phrases[0]}\"*")
            lines.append("")

    # Three-Lane Trust Dashboard
    lines.append("## 8. Three-Lane Trust Verification")
    lines.append("Findings categorized by epistemic grounding:\n")
    lines.append(f"### Lane 1: Quote-Grounded Facts ({len(data.three_lane_trust.quote_grounded)} Verbatim Findings)")
    for q in data.three_lane_trust.quote_grounded[:6]:
        lines.append(f"- **{q.get('claim_text', 'Claim')}** (Confidence: {q.get('confidence', 0.9)*100:.0f}%)")
        lines.append(f"  > Verbatim Quote: \"{q.get('exact_quote', '')}\"")
    lines.append("")

    lines.append(f"### Lane 2: AI-Suggested Pre-Mortem Rules ({len(data.three_lane_trust.ai_suggested)} Inferred Rules)")
    for rule in data.three_lane_trust.ai_suggested[:4]:
        lines.append(f"- **{rule.get('aspect', '')}** (`{rule.get('criticality', 'HIGH')}`): {rule.get('suggested_risk_rule', '')}")
    lines.append("")

    lines.append(f"### Lane 3: Information Blindspots / Not Found ({len(data.three_lane_trust.not_found)} Unaddressed Items)")
    if not data.three_lane_trust.not_found:
        lines.append("> No complete information blindspots detected. All blueprint requirements have at least partial coverage.\n")
    else:
        for nf in data.three_lane_trust.not_found:
            lines.append(f"- **{nf.get('aspect', '')}**: {nf.get('gap_description', '')}")
            lines.append(f"  *Failure Risk:* {nf.get('failure_risk', '')}")
        lines.append("")

    # Prioritized Verification Checklist
    lines.append("## 9. Prioritized Verification Checklist & Action Kit")
    lines.append("Action items ranked by uncertainty × real-world impact to close remaining blindspots before committing to a decision:\n")
    
    for item in data.checklist:
        check_box = "[x]" if item.verified_by_user else "[ ]"
        lines.append(f"### {check_box} #{item.priority_rank}: {item.title}")
        lines.append(f"- **Priority Score:** {item.priority_score} (Impact: {item.impact_score}/10, Uncertainty: {item.uncertainty_score}/10)")
        lines.append(f"- **Recommended Action:** {item.recommended_action}")
        if item.official_links:
            links_str = ", ".join([f"[{link}]({link})" for link in item.official_links])
            lines.append(f"- **Official Sources to Verify:** {links_str}")
        if item.draft_email_query:
            lines.append("- **Draft Query / Inquiry Template:**")
            lines.append("  ```text")
            lines.append(f"  {item.draft_email_query.strip()}")
            lines.append("  ```")
        lines.append("")

    # Footer Disclaimer
    lines.append("---")
    lines.append("*Report generated by ApexAudit decision-readiness engine.*  ")
    lines.append("*Disclaimer: This verification report surfaces contradictions, temporal drift, and echo sources based on the text reviewed. Always confirm binding policy dates and financial requirements with the designated official authority.*")

    return "\n".join(lines)
