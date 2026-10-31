import React from "react";
import { AnalysisResponse } from "../lib/types";
import { Shield, AlertTriangle, CheckCircle2, Clock, Link2, Mail, FileText } from "lucide-react";

interface PrintableReportProps {
  analysis: AnalysisResponse;
  generatedDate?: string;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  analysis,
  generatedDate
}) => {
  const dateStr =
    generatedDate ||
    new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  const { readiness_score: score, blueprint, sources, matrix, conflicts, temporal_drifts, independence_edges, checklist, three_lane_trust } = analysis;
  const b = score.breakdown;

  // Build matrix lookup
  const cellMap: Record<string, Record<string, string>> = {};
  for (const cell of matrix) {
    if (!cellMap[cell.aspect_id]) cellMap[cell.aspect_id] = {};
    cellMap[cell.aspect_id][cell.source_id] = cell.status;
  }

  return (
    <div className="printable-document p-8 max-w-4xl mx-auto bg-white text-slate-900 font-sans print:p-0 print:max-w-none">
      
      {/* 1. Header Banner */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-extrabold text-xl tracking-tight text-slate-950 uppercase">
              ApexAudit
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
              DECISION ENGINE
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-800">
            Decision Readiness & Quote Verification Report
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generated: {dateStr} • Engine Version 2.0
          </p>
        </div>

        {/* Big Score Card */}
        <div className="text-right border border-slate-300 rounded-lg p-3 bg-slate-50 min-w-[170px]">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Readiness Score
          </div>
          <div className="text-3xl font-black text-slate-950 flex items-baseline justify-end gap-1">
            <span>{score.score}</span>
            <span className="text-xs font-semibold text-slate-500">/ 100</span>
          </div>
          <div className={`text-[11px] font-bold mt-1 px-2 py-0.5 rounded inline-block ${
            score.score >= 80
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : score.score >= 50
              ? "bg-amber-100 text-amber-800 border border-amber-300"
              : "bg-rose-100 text-rose-800 border border-rose-300"
          }`}>
            {score.status}
          </div>
        </div>
      </div>

      {/* 2. Goal & Executive Assessment */}
      <section className="mb-6 avoid-break">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          Target Goal & Decision Scope
        </h2>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-800 font-medium">
          {analysis.goal}
        </div>
        <p className="text-xs text-slate-600 mt-2 italic bg-cyan-50/50 border-l-2 border-cyan-500 p-2 rounded-r">
          <strong>Readiness Summary:</strong> {score.summary}
        </p>
      </section>

      {/* 3. Readiness Score Breakdown Table */}
      <section className="mb-6 avoid-break">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Score Calculation & Penalty Audit
        </h2>
        <table className="w-full text-xs border border-slate-200">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="text-left py-1.5 px-3">Metric</th>
              <th className="text-center py-1.5 px-3 w-28">Value / Points</th>
              <th className="text-left py-1.5 px-3">Evaluation Rule</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="py-1.5 px-3 font-semibold">Base Coverage Score</td>
              <td className="py-1.5 px-3 text-center font-bold text-slate-900">{Math.round(b.base_coverage_score)}%</td>
              <td className="py-1.5 px-3 text-slate-600">Weighted share of critical blueprint items covered by sources</td>
            </tr>
            <tr>
              <td className="py-1.5 px-3 font-semibold text-rose-700">Conflict Penalty</td>
              <td className="py-1.5 px-3 text-center font-bold text-rose-700">-{Math.round(b.conflict_penalty)} pts</td>
              <td className="py-1.5 px-3 text-slate-600">Deducted for direct numerical or rule contradictions between sources</td>
            </tr>
            <tr>
              <td className="py-1.5 px-3 font-semibold text-amber-700">Freshness Penalty</td>
              <td className="py-1.5 px-3 text-center font-bold text-amber-700">-{Math.round(b.freshness_penalty)} pts</td>
              <td className="py-1.5 px-3 text-slate-600">Deducted for temporal drift / reliance on outdated years</td>
            </tr>
            <tr>
              <td className="py-1.5 px-3 font-semibold text-purple-700">Echo Penalty</td>
              <td className="py-1.5 px-3 text-center font-bold text-purple-700">-{Math.round(b.echo_penalty)} pts</td>
              <td className="py-1.5 px-3 text-slate-600">Deducted for derivative copies sharing phrasing without independent verification</td>
            </tr>
            <tr>
              <td className="py-1.5 px-3 font-semibold text-emerald-700">User Verified Bonus</td>
              <td className="py-1.5 px-3 text-center font-bold text-emerald-700">+{Math.round(b.user_verified_bonus)} pts</td>
              <td className="py-1.5 px-3 text-slate-600">Added for items confirmed directly by user check</td>
            </tr>
            <tr className="bg-slate-50 font-bold">
              <td className="py-1.5 px-3 text-slate-900">Final Decision Readiness</td>
              <td className="py-1.5 px-3 text-center text-slate-950 font-black">{Math.round(b.final_score)} / 100</td>
              <td className="py-1.5 px-3 text-slate-900">{score.status}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 4. Pre-Mortem Blueprint Requirements */}
      <section className="mb-6 avoid-break">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Pre-Mortem Failure Blueprint ({blueprint.length} Requirements)
        </h2>
        <table className="w-full text-xs border border-slate-200">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="text-left py-1.5 px-3 w-48">Requirement / Aspect</th>
              <th className="text-center py-1.5 px-2 w-20">Criticality</th>
              <th className="text-left py-1.5 px-3">Derived Failure Scenario (If Inaccurate)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {blueprint.map((bp) => (
              <tr key={bp.id}>
                <td className="py-1.5 px-3 font-semibold">{bp.aspect}</td>
                <td className="py-1.5 px-2 text-center">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    bp.criticality === "HIGH"
                      ? "bg-rose-100 text-rose-800"
                      : bp.criticality === "MEDIUM"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-700"
                  }`}>
                    {bp.criticality}
                  </span>
                </td>
                <td className="py-1.5 px-3 text-slate-700">{bp.failure_scenario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 5. Ingested Sources */}
      <section className="mb-6 avoid-break">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Ingested Sources Reviewed ({sources.length} Documents)
        </h2>
        <table className="w-full text-xs border border-slate-200">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="text-left py-1.5 px-3">Source Title</th>
              <th className="text-center py-1.5 px-2 w-24">Type</th>
              <th className="text-center py-1.5 px-2 w-20">Authority</th>
              <th className="text-center py-1.5 px-2 w-24">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sources.map((s) => (
              <tr key={s.id}>
                <td className="py-1.5 px-3 font-semibold text-slate-800">
                  {s.title}
                  {s.url && <div className="text-[10px] text-slate-400 font-normal truncate max-w-sm">{s.url}</div>}
                </td>
                <td className="py-1.5 px-2 text-center uppercase text-[10px] font-bold text-slate-600">
                  {s.source_type}
                </td>
                <td className="py-1.5 px-2 text-center font-bold text-slate-800">
                  {Math.round(s.authority_score * 100)}%
                </td>
                <td className="py-1.5 px-2 text-center text-slate-600 text-[11px]">
                  {s.published_date || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 6. Evidence Matrix Summary */}
      <section className="mb-6 avoid-break">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Evidence Matrix Summary
        </h2>
        <table className="w-full text-xs border border-slate-200">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="text-left py-1.5 px-3">Requirement</th>
              {sources.map((s) => (
                <th key={s.id} className="text-center py-1.5 px-2 text-[10px] truncate max-w-[120px]">
                  {s.title.slice(0, 18)}...
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {blueprint.map((bp) => (
              <tr key={bp.id}>
                <td className="py-1.5 px-3 font-semibold text-slate-800">{bp.aspect}</td>
                {sources.map((s) => {
                  const status = cellMap[bp.id]?.[s.id] || "Missing";
                  return (
                    <td key={s.id} className="py-1.5 px-2 text-center text-[10px]">
                      {status === "Covered" && (
                        <span className="font-bold text-emerald-700">✓ Covered</span>
                      )}
                      {status === "Conflicting" && (
                        <span className="font-bold text-rose-700">⚠ Conflict</span>
                      )}
                      {status === "Outdated" && (
                        <span className="font-bold text-amber-700">⏱ Outdated</span>
                      )}
                      {status === "Missing" && (
                        <span className="text-slate-400">- Missing -</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Page Break for Printable Document */}
      <div className="print-page-break"></div>

      {/* 7. Conflicts & Contradictions (Critical Section) */}
      <section className="mb-6 avoid-break">
        <h2 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          Contradictions & Policy Conflicts ({conflicts.length} Detected)
        </h2>
        {conflicts.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No conflicting claims identified across sources reviewed.</p>
        ) : (
          <div className="space-y-3">
            {conflicts.map((c, i) => (
              <div key={c.id || i} className="border border-rose-200 rounded-lg p-3 bg-rose-50/40 avoid-break text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">
                    Conflict #{i + 1}: {c.aspect_name}
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded">
                    {c.severity}
                  </span>
                </div>
                <p className="text-slate-700 font-medium mb-2">{c.contrast_summary}</p>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white border border-slate-200 rounded p-2">
                    <div className="font-bold text-slate-800 text-[10px] mb-1">{c.source_a_title}</div>
                    <blockquote className="italic text-slate-600 border-l-2 border-slate-400 pl-2">
                      &quot;{c.quote_a}&quot;
                    </blockquote>
                  </div>
                  <div className="bg-white border border-slate-200 rounded p-2">
                    <div className="font-bold text-slate-800 text-[10px] mb-1">{c.source_b_title}</div>
                    <blockquote className="italic text-slate-600 border-l-2 border-slate-400 pl-2">
                      &quot;{c.quote_b}&quot;
                    </blockquote>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 8. Temporal Drift & Echo Analysis */}
      <section className="mb-6 avoid-break">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Temporal Freshness & Source Independence
        </h2>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Freshness */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Temporal Drift Signals
            </h3>
            {temporal_drifts.length === 0 ? (
              <p className="text-[11px] text-slate-500">All sources contain active/current dates.</p>
            ) : (
              <ul className="space-y-1.5 text-[11px]">
                {temporal_drifts.map((d) => (
                  <li key={d.id} className="text-slate-700">
                    <strong className={d.is_outdated ? "text-amber-800" : "text-slate-800"}>
                      {d.source_title}:
                    </strong>{" "}
                    {d.reason}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Echo Graph */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5 text-[11px]">
              <Link2 className="w-3.5 h-3.5 text-purple-600" />
              Source Independence (Echo Detection)
            </h3>
            {independence_edges.filter((e) => e.relation_type === "echo_source").length === 0 ? (
              <p className="text-[11px] text-slate-500">Independent origins verified; no echo syndication.</p>
            ) : (
              <ul className="space-y-1.5 text-[11px]">
                {independence_edges
                  .filter((e) => e.relation_type === "echo_source")
                  .map((e, idx) => (
                    <li key={idx} className="text-slate-700">
                      <strong>{e.source_a_title}</strong> ↔ <strong>{e.source_b_title}</strong>
                      <div className="text-[10px] text-slate-500">
                        {e.risk_summary} ({Math.round(e.similarity_score * 100)}% phrasing match)
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* 9. Prioritized Verification Checklist & Action Kit */}
      <section className="mb-6 avoid-break">
        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Prioritized Verification Checklist & Action Kit ({checklist.length} Items)
        </h2>
        <div className="space-y-2.5">
          {checklist.map((item) => (
            <div
              key={item.id}
              className={`border rounded-lg p-3 text-xs avoid-break ${
                item.verified_by_user
                  ? "bg-emerald-50/60 border-emerald-300"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold ${
                    item.verified_by_user ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-400 bg-white"
                  }`}>
                    {item.verified_by_user ? "✓" : ""}
                  </span>
                  <span className="font-bold text-slate-900 text-xs">
                    #{item.priority_rank}: {item.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300">
                  Priority {item.priority_score} (Impact: {item.impact_score}/10, Uncertainty: {item.uncertainty_score}/10)
                </span>
              </div>

              <p className="text-slate-700 font-medium pl-6 text-xs mb-1.5">
                <strong>Recommended Action:</strong> {item.recommended_action}
              </p>

              {item.official_links && item.official_links.length > 0 && (
                <div className="pl-6 text-[11px] text-slate-500 mb-1 flex items-center gap-1.5">
                  <Link2 className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>Official Reference: {item.official_links.join(", ")}</span>
                </div>
              )}

              {item.draft_email_query && (
                <div className="ml-6 mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 font-mono">
                  <div className="text-[10px] text-slate-500 font-sans font-bold mb-0.5 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    Draft Clarification Inquiry:
                  </div>
                  {item.draft_email_query}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. Report Sign-Off & Disclaimer */}
      <footer className="border-t border-slate-300 pt-4 mt-8 text-center text-[10px] text-slate-500 avoid-break">
        <p className="font-semibold text-slate-700">
          ApexAudit Decision-Readiness Platform
        </p>
        <p className="mt-0.5">
          Disclaimer: This verification report identifies potential discrepancies and temporal drift from reviewed text. Always verify critical policy and financial requirements with the designated official authority before making final decisions.
        </p>
      </footer>

    </div>
  );
};
