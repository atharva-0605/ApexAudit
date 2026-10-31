import json
import os
from typing import Dict, Any
from app.models.schemas import SourceInput
from app.services.scraper_service import scrape_url

DEMO_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "demo_csss.json")

def load_demo_csss() -> Dict[str, Any]:
    """Loads pre-cached demo CSSS scholarship dataset."""
    if os.path.exists(DEMO_DATA_PATH):
        with open(DEMO_DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

async def fetch_url_content(url: str) -> SourceInput:
    """
    Fetches raw HTML from a URL and extracts clean readable text.
    Delegates to the resilient scraper_service.
    """
    return await scrape_url(url)
