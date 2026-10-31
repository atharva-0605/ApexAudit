from fastapi import APIRouter, Response, Query
from datetime import datetime
from app.models.schemas import AnalysisResponse
from app.services.export_service import generate_markdown_report

router = APIRouter(prefix="/export", tags=["Export"])

@router.post("/markdown")
def export_markdown_report(
    req: AnalysisResponse,
    as_attachment: bool = Query(default=True, description="Whether to send as downloadable attachment")
):
    markdown_content = generate_markdown_report(req)
    date_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"ApexAudit_Report_{date_str}.md"
    
    headers = {}
    if as_attachment:
        headers["Content-Disposition"] = f'attachment; filename="{filename}"'
    
    return Response(
        content=markdown_content,
        media_type="text/markdown; charset=utf-8",
        headers=headers
    )

@router.post("/markdown/text")
def export_markdown_raw(req: AnalysisResponse):
    markdown_content = generate_markdown_report(req)
    date_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    return {
        "filename": f"ApexAudit_Report_{date_str}.md",
        "content": markdown_content
    }
