from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

class CriticalityEnum(str):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class CellStatusEnum(str):
    COVERED = "Covered"
    CONFLICTING = "Conflicting"
    OUTDATED = "Outdated"
    MISSING = "Missing"

class BlueprintItem(BaseModel):
    id: str
    aspect: str
    failure_scenario: str
    criticality: Literal["HIGH", "MEDIUM", "LOW"] = "HIGH"
    description: str
    weight: float = 1.0 # 1.0 for HIGH, 0.6 for MEDIUM, 0.3 for LOW

class BlueprintRequest(BaseModel):
    goal: str
    context: Optional[str] = None

class BlueprintResponse(BaseModel):
    goal: str
    items: List[BlueprintItem]

class SourceInput(BaseModel):
    id: str
    title: str
    url: Optional[str] = None
    raw_text: str
    source_type: Literal["official", "aggregator", "forum", "news", "user_pasted"] = "aggregator"
    published_date: Optional[str] = None
    authority_score: float = 0.5 # 0.0 to 1.0

class Claim(BaseModel):
    id: str
    source_id: str
    aspect_id: str
    claim_text: str
    exact_quote: str
    verified_verbatim: bool = True
    char_start: Optional[int] = None
    char_end: Optional[int] = None
    extracted_value: Optional[str] = None
    confidence: float = 0.9

class ConflictFinding(BaseModel):
    id: str
    aspect_id: str
    aspect_name: str
    source_a_id: str
    source_a_title: str
    claim_a: str
    quote_a: str
    source_b_id: str
    source_b_title: str
    claim_b: str
    quote_b: str
    contrast_summary: str
    severity: Literal["CRITICAL", "WARNING", "NOTE"] = "CRITICAL"

class TemporalDriftFinding(BaseModel):
    id: str
    source_id: str
    source_title: str
    detected_date: Optional[str] = None
    is_outdated: bool
    reason: str
    caution_message: str

class IndependenceEdge(BaseModel):
    source_a_id: str
    source_a_title: str
    source_b_id: str
    source_b_title: str
    relation_type: Literal["independent", "echo_source", "derived_copy", "syndication"]
    similarity_score: float
    shared_phrases: List[str] = []
    risk_summary: str

class VerificationChecklistItem(BaseModel):
    id: str
    aspect_id: str
    title: str
    impact_score: int # 1 to 10
    uncertainty_score: int # 1 to 10
    priority_rank: int
    priority_score: int # impact * uncertainty
    verified_by_user: bool = False
    verification_notes: Optional[str] = None
    official_links: List[str] = []
    draft_email_query: str
    recommended_action: str

class ReadinessBreakdown(BaseModel):
    base_coverage_score: float # 0 - 100
    freshness_penalty: float
    conflict_penalty: float
    echo_penalty: float
    user_verified_bonus: float
    final_score: float

class ReadinessScore(BaseModel):
    score: int # 0 to 100
    status: Literal["Decision Ready", "Needs Verification", "High Risk / Blindspots Present"]
    breakdown: ReadinessBreakdown
    summary: str

class ThreeLaneTrust(BaseModel):
    quote_grounded: List[Dict[str, Any]]
    ai_suggested: List[Dict[str, Any]]
    not_found: List[Dict[str, Any]]

class EvidenceMatrixCell(BaseModel):
    aspect_id: str
    source_id: str
    status: Literal["Covered", "Conflicting", "Outdated", "Missing"]
    claims: List[Claim] = []
    note: Optional[str] = None

class AnalysisRequest(BaseModel):
    goal: str
    blueprint: List[BlueprintItem]
    sources: List[SourceInput]
    verified_checklist_ids: Optional[List[str]] = []

class AnalysisResponse(BaseModel):
    goal: str
    blueprint: List[BlueprintItem]
    sources: List[SourceInput]
    matrix: List[EvidenceMatrixCell]
    conflicts: List[ConflictFinding]
    temporal_drifts: List[TemporalDriftFinding]
    independence_edges: List[IndependenceEdge]
    checklist: List[VerificationChecklistItem]
    readiness_score: ReadinessScore
    three_lane_trust: ThreeLaneTrust

class FetchSourceRequest(BaseModel):
    url: str

class MarkVerifiedRequest(BaseModel):
    checklist_item_id: str
    verified: bool
    notes: Optional[str] = None
