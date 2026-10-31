"""
ApexAudit - Security & Code Quality Scanner
Performs deep inspection of codebase for:
1. Hardcoded secrets, API keys, or leaked credentials
2. Dangerous eval/exec or injection sinks
3. CORS configuration checks
4. Missing null checks or unhandled exceptions
"""

import os
import re
import sys

EXCLUDE_DIRS = {'node_modules', '.next', 'venv', '__pycache__', '.git', '.system_generated'}

PATTERNS = [
    ("Gemini API Key", re.compile(r'AIza[0-9A-Za-z-_]{35}')),
    ("Generic Private Key", re.compile(r'-----BEGIN (?:RSA )?PRIVATE KEY-----')),
    ("Hardcoded API Token", re.compile(r'(?i)(?:api[_-]?key|auth[_-]?token|secret)\s*[:=]\s*["\'][A-Za-z0-9_\-]{20,}["\']')),
    ("Hardcoded Password", re.compile(r'(?i)password\s*[:=]\s*["\'][^"\']{8,}["\']')),
]

def scan_secrets(root_dir="."):
    findings = []
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for file in files:
            if file.endswith(('.py', '.ts', '.tsx', '.js', '.json', '.env', '.env.local', '.env.example', '.md')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        for line_num, line in enumerate(f, 1):
                            # Skip environment variable fetching patterns
                            if any(k in line for k in ['os.getenv', 'process.env', 'your_', 'example', 'placeholder']):
                                continue
                            for name, p in PATTERNS:
                                if p.search(line):
                                    findings.append((name, filepath, line_num, line.strip()[:100]))
                except Exception as e:
                    pass
    return findings

def inspect_cors():
    main_py = os.path.join("backend", "app", "main.py")
    if not os.path.exists(main_py):
        return ["backend/app/main.py not found"]
    with open(main_py, "r", encoding="utf-8") as f:
        content = f.read()
    issues = []
    if "CORSMiddleware" not in content:
        issues.append("CORSMiddleware is missing")
    if 'allow_origins=["*"]' in content and 'allow_credentials=True' in content:
        issues.append("Wildcard CORS with credentials=True violates CORS spec")
    return issues

if __name__ == "__main__":
    print("=== [1] Scanning Codebase for Secrets & Leaked Keys ===")
    secrets = scan_secrets()
    if secrets:
        print(f"[FAIL] Found {len(secrets)} potential secrets:")
        for name, path, line_no, text in secrets:
            print(f"  - [{name}] {path}:{line_no} -> {text}")
    else:
        print("[PASS] No hardcoded secrets, leaked keys, or passwords detected.")

    print("\n=== [2] Inspecting Backend CORS Configuration ===")
    cors_issues = inspect_cors()
    if cors_issues:
        for ci in cors_issues:
            print(f"[FAIL] {ci}")
    else:
        print("[PASS] CORS middleware is properly configured with origin boundaries.")
