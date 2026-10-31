import os
from typing import List, Optional
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env from backend directory and root directory
_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_root_dir = os.path.abspath(os.path.join(_backend_dir, ".."))

load_dotenv(dotenv_path=os.path.join(_backend_dir, ".env"))
load_dotenv(dotenv_path=os.path.join(_root_dir, ".env"))
load_dotenv() # standard fallback

def _clean_env(val: Optional[str]) -> Optional[str]:
    if not val:
        return None
    cleaned = val.strip().strip("'\"")
    return cleaned if cleaned else None

def _get_cors_origins() -> List[str]:
    defaults = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
    custom = os.getenv("ALLOWED_ORIGINS") or os.getenv("CORS_ORIGINS")
    if custom:
        parsed = [o.strip() for o in custom.split(",") if o.strip()]
        for origin in parsed:
            if origin not in defaults:
                defaults.append(origin)
    return defaults

class Settings(BaseModel):
    PROJECT_NAME: str = "ApexAudit"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    CORS_ORIGINS: List[str] = _get_cors_origins()
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    # Google Gemini Configuration
    GEMINI_API_KEY: Optional[str] = _clean_env(os.getenv("GEMINI_API_KEY"))
    GEMINI_MODEL: str = _clean_env(os.getenv("GEMINI_MODEL")) or "gemini-3.5-flash"
    GEMINI_TIMEOUT_SECONDS: float = float(os.getenv("GEMINI_TIMEOUT_SECONDS", "5.0"))

settings = Settings()
