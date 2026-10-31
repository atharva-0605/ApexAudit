from fastapi import APIRouter
from app.models.schemas import BlueprintRequest, BlueprintResponse
from app.services.blueprint_service import generate_blueprint_for_goal

router = APIRouter(prefix="/blueprint", tags=["Blueprint"])

@router.post("/generate", response_model=BlueprintResponse)
def generate_blueprint(req: BlueprintRequest):
    items = generate_blueprint_for_goal(req.goal, req.context or "")
    return BlueprintResponse(goal=req.goal, items=items)
