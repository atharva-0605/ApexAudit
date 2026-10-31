from fastapi import APIRouter
from app.models.schemas import AnalysisRequest, AnalysisResponse
from app.services.verifier_service import extract_grounded_claims
from app.services.conflict_service import detect_conflicts, detect_temporal_drifts, build_evidence_matrix
from app.services.independence_service import build_source_independence_graph
from app.services.readiness_service import calculate_readiness_and_kit

router = APIRouter(prefix="/analyze", tags=["Analyze"])

@router.post("", response_model=AnalysisResponse)
def analyze_goal_and_sources(req: AnalysisRequest):
    # 1. Strict quote verification & grounded claim extraction
    claims = extract_grounded_claims(req.sources, req.blueprint)

    # 2. Conflict detection across sources
    conflicts = detect_conflicts(claims, req.sources, req.blueprint)

    # 3. Temporal drift detection (date signals)
    temporal_drifts = detect_temporal_drifts(req.sources)

    # 4. Source independence graph (echo detection)
    independence_edges = build_source_independence_graph(req.sources)

    # 5. Build evidence matrix (Aspects x Sources)
    matrix = build_evidence_matrix(req.blueprint, req.sources, claims, conflicts, temporal_drifts)

    # 6. Readiness score, checklist, and 3-lane trust dashboard
    readiness_score, checklist, three_lane = calculate_readiness_and_kit(
        goal=req.goal,
        blueprint=req.blueprint,
        sources=req.sources,
        claims=claims,
        conflicts=conflicts,
        temporal_drifts=temporal_drifts,
        independence_edges=independence_edges,
        verified_checklist_ids=req.verified_checklist_ids or []
    )

    return AnalysisResponse(
        goal=req.goal,
        blueprint=req.blueprint,
        sources=req.sources,
        matrix=matrix,
        conflicts=conflicts,
        temporal_drifts=temporal_drifts,
        independence_edges=independence_edges,
        checklist=checklist,
        readiness_score=readiness_score,
        three_lane_trust=three_lane
    )
