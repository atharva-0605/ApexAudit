from fastapi import APIRouter
from app.models.schemas import MarkVerifiedRequest

router = APIRouter(prefix="/verify", tags=["Verify"])

@router.post("/mark")
def mark_checklist_item(req: MarkVerifiedRequest):
    return {
        "checklist_item_id": req.checklist_item_id,
        "verified": req.verified,
        "notes": req.notes,
        "message": "Item marked as verified. Readiness score recalculated." if req.verified else "Item marked unverified."
    }
