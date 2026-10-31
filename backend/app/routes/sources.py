from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.models.schemas import SourceInput, FetchSourceRequest
from app.services.source_service import fetch_url_content, load_demo_csss

router = APIRouter(prefix="/sources", tags=["Sources"])

@router.get("/demos")
def get_demos():
    return [
        {
            "id": "csss-scholarship-renewal",
            "name": "Central Sector Scheme of Scholarship (CSSS) - Renewal & Eligibility Pack",
            "description": "Official Ministry guidelines vs. aggregator blog vs. forum echo showing income conflicts, outdated deadlines, and DBT bank account pitfalls.",
            "sources_count": 3
        }
    ]

@router.get("/demo/{demo_id}")
def get_demo_pack(demo_id: str):
    if demo_id == "csss-scholarship-renewal":
        demo_data = load_demo_csss()
        return demo_data
    raise HTTPException(status_code=404, detail="Demo dataset not found")

@router.post("/fetch", response_model=SourceInput)
async def fetch_source_from_url(req: FetchSourceRequest):
    if not req.url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")
    source = await fetch_url_content(req.url)
    return source
