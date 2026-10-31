export interface BlueprintItem {
  id: string;
  aspect: string;
  failure_scenario: string;
  criticality: "HIGH" | "MEDIUM" | "LOW";
  description: string;
  weight: number;
}

export interface SourceInput {
  id: string;
  title: string;
  url?: string;
  raw_text: string;
  source_type: "official" | "aggregator" | "forum" | "news" | "user_pasted";
  published_date?: string;
  authority_score: number;
}

export interface Claim {
  id: string;
  source_id: string;
  aspect_id: string;
  claim_text: string;
  exact_quote: string;
  verified_verbatim: boolean;
  char_start?: number;
  char_end?: number;
  extracted_value?: string;
  confidence: number;
}

export interface ConflictFinding {
  id: string;
  aspect_id: string;
  aspect_name: string;
  source_a_id: string;
  source_a_title: string;
  claim_a: string;
  quote_a: string;
  source_b_id: string;
  source_b_title: string;
  claim_b: string;
  quote_b: string;
  contrast_summary: string;
  severity: "CRITICAL" | "WARNING" | "NOTE";
}

export interface TemporalDriftFinding {
  id: string;
  source_id: string;
  source_title: string;
  detected_date?: string;
  is_outdated: boolean;
  reason: string;
  caution_message: string;
}

export interface IndependenceEdge {
  source_a_id: string;
  source_a_title: string;
  source_b_id: string;
  source_b_title: string;
  relation_type: "independent" | "echo_source" | "derived_copy" | "syndication";
  similarity_score: number;
  shared_phrases: string[];
  risk_summary: string;
}

export interface EvidenceMatrixCell {
  aspect_id: string;
  source_id: string;
  status: "Covered" | "Conflicting" | "Outdated" | "Missing";
  claims: Claim[];
  note?: string;
}

export interface VerificationChecklistItem {
  id: string;
  aspect_id: string;
  title: string;
  impact_score: number;
  uncertainty_score: number;
  priority_rank: number;
  priority_score: number;
  verified_by_user: boolean;
  verification_notes?: string;
  official_links: string[];
  draft_email_query: string;
  recommended_action: string;
}

export interface ReadinessBreakdown {
  base_coverage_score: number;
  freshness_penalty: number;
  conflict_penalty: number;
  echo_penalty: number;
  user_verified_bonus: number;
  final_score: number;
}

export interface ReadinessScore {
  score: number;
  status: "Decision Ready" | "Needs Verification" | "High Risk / Blindspots Present";
  breakdown: ReadinessBreakdown;
  summary: string;
}

export interface ThreeLaneTrust {
  quote_grounded: {
    id: string;
    aspect_id: string;
    claim_text: string;
    exact_quote: string;
    source_id: string;
    confidence: number;
    badge: string;
  }[];
  ai_suggested: {
    aspect_id: string;
    aspect: string;
    suggested_risk_rule: string;
    criticality: "HIGH" | "MEDIUM" | "LOW";
    badge: string;
  }[];
  not_found: {
    aspect_id: string;
    aspect: string;
    gap_description: string;
    failure_risk: string;
    badge: string;
  }[];
}

export interface AnalysisResponse {
  goal: string;
  blueprint: BlueprintItem[];
  sources: SourceInput[];
  matrix: EvidenceMatrixCell[];
  conflicts: ConflictFinding[];
  temporal_drifts: TemporalDriftFinding[];
  independence_edges: IndependenceEdge[];
  checklist: VerificationChecklistItem[];
  readiness_score: ReadinessScore;
  three_lane_trust: ThreeLaneTrust;
}

export interface DemoPack {
  id: string;
  name: string;
  goal: string;
  blueprint: BlueprintItem[];
  sources: SourceInput[];
}
