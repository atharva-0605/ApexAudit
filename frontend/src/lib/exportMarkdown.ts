import { AnalysisResponse } from "./types";

/**
 * Formats a full, quote-grounded Verification Pack report into standard GitHub Flavored Markdown.
 */
export function generateMarkdownReport(data: AnalysisResponse): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const score = data.readiness_score;
  const b = score.breakdown;

  const lines: string[] = [];

  // Title & Metadata Header
  lines.push("# ApexAudit - Decision Readiness Report");
  lines.push(`**Generated:** ${dateStr}  `);
  lines.push(`**Readiness Status:** \`${score.status}\`  `);
  lines.push(`**Overall Decision Readiness Score:** **${score.score} / 100**\n`);
  lines.push("---\n");

  // Executive Summary & Goal
  lines.push("## 1. Executive Summary & Goal");
  lines.push("**Decision Goal / Question:**");
  lines.push(`> ${data.goal}\n`);
  lines.push("**Engine Assessment:**");
  lines.push(`> ${score.summary}\n`);

  // Score Breakdown Table
  lines.push("### Readiness Score Breakdown");
  lines.push("| Component | Value | Description |");
  lines.push("| :--- | :---: | :--- |");
  lines.push(`| Base Coverage Score | ${Math.round(b.base_coverage_score)}% | Weighted coverage of pre-mortem blueprint requirements |`);
  lines.push(`| Conflict Penalty | -${Math.round(b.conflict_penalty)} pts | Deducted for contradictions between sources |`);
  lines.push(`| Freshness Penalty | -${Math.round(b.freshness_penalty)} pts | Deducted for temporal drift / outdated source dates |`);
  lines.push(`| Echo Source Penalty | -${Math.round(b.echo_penalty)} pts | Deducted for duplicate / syndication origin risk |`);
  lines.push(`| User Verified Bonus | +${Math.round(b.user_verified_bonus)} pts | Added for manually confirmed checklist items |`);
  lines.push(`| **Final Readiness Score** | **${Math.round(b.final_score)} / 100** | **${score.status}** |\n`);

  // Sources Ingested
  lines.push("## 2. Ingested Sources Reviewed");
  lines.push(`Total Sources Ingested: **${data.sources.length}**\n`);
  lines.push("| Source Title | Type | Authority | Published / Detected Date | Location / URL |");
  lines.push("| :--- | :---: | :---: | :---: | :--- |");
  for (const s of data.sources) {
    const link = s.url ? `[${s.url}](${s.url})` : "Pasted Text";
    const pub = s.published_date || "Not specified";
    lines.push(`| ${s.title} | \`${s.source_type}\` | ${Math.round(s.authority_score * 100)}% | ${pub} | ${link} |`);
  }
  lines.push("");

  // Pre-Mortem Blueprint
  lines.push("## 3. Pre-Mortem Blueprint & Failure Scenarios");
  lines.push("The pre-mortem blueprint works backward from catastrophic or disqualifying failure scenarios to derive non-negotiable verification requirements:\n");
  lines.push("| Aspect / Requirement | Criticality | Weight | Failure Scenario If Inaccurate or Missed |");
  lines.push("| :--- | :---: | :---: | :--- |");
  for (const bp of data.blueprint) {
    lines.push(`| **${bp.aspect}** | \`${bp.criticality}\` | ${bp.weight} | ${bp.failure_scenario} |`);
  }
  lines.push("");

  // Evidence Matrix Summary
  lines.push("## 4. Evidence Matrix Summary");
  lines.push("Cross-source coverage matrix (`Aspects` × `Sources`):\n");

  const sourceTitles = data.sources.map(s => s.title.length > 25 ? s.title.slice(0, 25) + "..." : s.title);
  lines.push("| Blueprint Requirement | " + sourceTitles.join(" | ") + " |");
  lines.push("| :--- | " + sourceTitles.map(() => ":---:").join(" | ") + " |");

  const cellMap: Record<string, Record<string, string>> = {};
  for (const cell of data.matrix) {
    if (!cellMap[cell.aspect_id]) cellMap[cell.aspect_id] = {};
    cellMap[cell.aspect_id][cell.source_id] = cell.status;
  }

  for (const bp of data.blueprint) {
    const row = [`**${bp.aspect}**`];
    for (const s of data.sources) {
      const status = cellMap[bp.id]?.[s.id] || "Missing";
      let badge = "- Missing -";
      if (status === "Covered") badge = "[Covered]";
      else if (status === "Conflicting") badge = "**[CONFLICT]**";
      else if (status === "Outdated") badge = "*[Outdated]*";
      row.push(badge);
    }
    lines.push("| " + row.join(" | ") + " |");
  }
  lines.push("");

  // Identified Conflicts
  lines.push("## 5. Identified Conflicts & Contradictions");
  if (!data.conflicts || data.conflicts.length === 0) {
    lines.push("> No conflicting claims detected across the sources analyzed.\n");
  } else {
    lines.push(`Detected **${data.conflicts.length}** critical discrepancy/discrepancies between sources:\n`);
    data.conflicts.forEach((c, idx) => {
      lines.push(`### Discrepancy #${idx + 1}: ${c.aspect_name} (\`${c.severity}\`)`);
      lines.push(`**Contrast Summary:** ${c.contrast_summary}\n`);
      lines.push(`- **Source A (${c.source_a_title}):**`);
      lines.push(`  > "${c.quote_a}"`);
      lines.push(`- **Source B (${c.source_b_title}):**`);
      lines.push(`  > "${c.quote_b}"\n`);
    });
  }

  // Temporal Drift
  lines.push("## 6. Temporal Drift & Freshness Signals");
  if (!data.temporal_drifts || data.temporal_drifts.length === 0) {
    lines.push("> All reviewed sources contain current or active date references.\n");
  } else {
    for (const d of data.temporal_drifts) {
      const outdatedTag = d.is_outdated ? "**OUTDATED**" : "CURRENT";
      lines.push(`- **${d.source_title}** [${outdatedTag}]: ${d.reason}`);
      lines.push(`  *Caution:* ${d.caution_message}\n`);
    }
  }

  // Source Independence & Echo Analysis
  lines.push("## 7. Source Independence & Echo Analysis");
  const echoEdges = (data.independence_edges || []).filter(e => e.relation_type === "echo_source" || e.relation_type === "derived_copy");
  if (echoEdges.length === 0) {
    lines.push("> All reviewed sources demonstrate independent origination with no echo copying detected.\n");
  } else {
    lines.push(`Found **${echoEdges.length}** derivative or echo relationship(s):\n`);
    for (const e of echoEdges) {
      lines.push(`- **${e.source_a_title}** ↔ **${e.source_b_title}** (\`${e.relation_type}\`)`);
      lines.push(`  - Phrasing Similarity: ${Math.round(e.similarity_score * 100)}%`);
      lines.push(`  - Risk: ${e.risk_summary}`);
      if (e.shared_phrases && e.shared_phrases.length > 0) {
        lines.push(`  - Matched Phrasing: *"${e.shared_phrases[0]}"*`);
      }
      lines.push("");
    }
  }

  // Three-Lane Trust Dashboard
  lines.push("## 8. Three-Lane Trust Verification");
  const trust = data.three_lane_trust;
  if (trust) {
    lines.push(`### Lane 1: Quote-Grounded Claims (${trust.quote_grounded?.length || 0} Verbatim Findings)`);
    for (const q of (trust.quote_grounded || []).slice(0, 6)) {
      lines.push(`- **${q.claim_text}** (Confidence: ${Math.round((q.confidence || 0.9) * 100)}%)`);
      lines.push(`  > Verbatim Quote: "${q.exact_quote}"`);
    }
    lines.push("");

    lines.push(`### Lane 2: AI-Suggested Pre-Mortem Rules (${trust.ai_suggested?.length || 0} Inferred Rules)`);
    for (const rule of (trust.ai_suggested || []).slice(0, 4)) {
      lines.push(`- **${rule.aspect}** (\`${rule.criticality}\`): ${rule.suggested_risk_rule}`);
    }
    lines.push("");

    lines.push(`### Lane 3: Information Blindspots / Gaps (${trust.not_found?.length || 0} Unaddressed Items)`);
    if (!trust.not_found || trust.not_found.length === 0) {
      lines.push("> No complete blindspots detected. All blueprint requirements have partial or full coverage.\n");
    } else {
      for (const nf of trust.not_found) {
        lines.push(`- **${nf.aspect}**: ${nf.gap_description}`);
        lines.push(`  *Failure Risk:* ${nf.failure_risk}`);
      }
      lines.push("");
    }
  }

  // Prioritized Verification Checklist
  lines.push("## 9. Prioritized Verification Checklist & Action Kit");
  lines.push("Checklist ranked by impact × uncertainty score to eliminate risks prior to final commitment:\n");

  for (const item of data.checklist) {
    const box = item.verified_by_user ? "[x]" : "[ ]";
    lines.push(`### ${box} #${item.priority_rank}: ${item.title}`);
    lines.push(`- **Priority Score:** ${item.priority_score} (Impact: ${item.impact_score}/10, Uncertainty: ${item.uncertainty_score}/10)`);
    lines.push(`- **Recommended Action:** ${item.recommended_action}`);
    if (item.official_links && item.official_links.length > 0) {
      const links = item.official_links.map(l => `[${l}](${l})`).join(", ");
      lines.push(`- **Official Links to Check:** ${links}`);
    }
    if (item.draft_email_query) {
      lines.push("- **Draft Inquiry Template:**");
      lines.push("  ```text");
      lines.push(`  ${item.draft_email_query.trim()}`);
      lines.push("  ```");
    }
    lines.push("");
  }

  // Footer Disclaimer
  lines.push("---\n");
  lines.push("*Report generated by ApexAudit Decision-Readiness Platform.*  \n");
  lines.push("*Disclaimer: This verification report identifies potential discrepancies and temporal drift from reviewed text. Always verify critical policy and financial requirements with the designated official authority before making final decisions.*");

  return lines.join("\n");
}

/**
 * Initiates an instant browser file download of a string blob.
 */
export function downloadFile(content: string, filename: string, mimeType: string = "text/markdown;charset=utf-8"): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
