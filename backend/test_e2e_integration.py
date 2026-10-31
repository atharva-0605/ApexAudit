"""
End-to-End Integration Verification Suite for ApexAudit
Validates communication between Next.js frontend contracts and FastAPI backend.
"""

import sys
import json
import urllib.request
import urllib.error

API_BASE = "http://127.0.0.1:8000"
FRONTEND_ORIGIN = "http://localhost:3000"

def make_request(path: str, method: str = "GET", data: dict = None, headers: dict = None):
    url = f"{API_BASE}{path}"
    req_headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Origin": FRONTEND_ORIGIN
    }
    if headers:
        req_headers.update(headers)
    
    encoded_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=encoded_data, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, resp.headers, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        return e.code, e.headers, json.loads(body) if body else {}

def run_e2e_tests():
    print("=" * 60)
    print("ApexAudit E2E Integration Test Suite")
    print("=" * 60)

    # 1. Health check
    print("\n[1/6] Verifying Backend Health...")
    status, _, body = make_request("/health")
    assert status == 200, f"Health check failed: status {status}"
    assert body.get("status") == "healthy", f"Unexpected health response: {body}"
    print(f"  [PASS] Backend Healthy: {body}")

    # 2. CORS Preflight & Credentials
    print("\n[2/6] Verifying CORS Preflight & Credentials...")
    opt_req = urllib.request.Request(
        f"{API_BASE}/api/analyze",
        headers={
            "Origin": FRONTEND_ORIGIN,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type"
        },
        method="OPTIONS"
    )
    with urllib.request.urlopen(opt_req, timeout=5) as resp:
        assert resp.status == 200, f"CORS OPTIONS failed: {resp.status}"
        cors_origin = resp.headers.get("access-control-allow-origin")
        cors_creds = resp.headers.get("access-control-allow-credentials")
        assert cors_origin == FRONTEND_ORIGIN, f"Expected CORS origin {FRONTEND_ORIGIN}, got {cors_origin}"
        assert cors_creds == "true", f"Expected credentials true, got {cors_creds}"
        print(f"  [PASS] CORS Preflight: origin={cors_origin}, credentials={cors_creds}")

    # 3. Demo Pack Fetch
    print("\n[3/6] Fetching Demo Pack (CSSS Renewal)...")
    status, _, demo = make_request("/api/sources/demo/csss-scholarship-renewal")
    assert status == 200, f"Fetch demo pack failed: {status}"
    assert "blueprint" in demo and len(demo["blueprint"]) >= 5, "Blueprint items missing"
    assert "sources" in demo and len(demo["sources"]) == 3, "Demo sources missing"
    print(f"  [PASS] Loaded Demo: {demo['name']}")
    print(f"         Sources: {len(demo['sources'])}, Blueprint Items: {len(demo['blueprint'])}")

    # 4. Blueprint Generation
    print("\n[4/6] Testing Blueprint Generation Endpoint...")
    status, _, bp_res = make_request("/api/blueprint/generate", method="POST", data={
        "goal": "Apply for CSSS Scholarship without missing deadlines",
        "context": "First year undergraduate student"
    })
    assert status == 200, f"Blueprint generation failed: {status}"
    assert len(bp_res.get("items", [])) > 0, "Blueprint items should not be empty"
    print(f"  [PASS] Derived {len(bp_res['items'])} failure scenarios / blueprint items.")

    # 5. Core Analysis Pipeline
    print("\n[5/6] Testing End-to-End Analysis Pipeline (/api/analyze)...")
    status, _, analysis = make_request("/api/analyze", method="POST", data={
        "goal": demo["goal"],
        "blueprint": demo["blueprint"],
        "sources": demo["sources"],
        "verified_checklist_ids": []
    })
    assert status == 200, f"Analysis failed: {status}"

    # Check Matrix
    matrix = analysis.get("matrix", [])
    assert len(matrix) > 0, "Evidence matrix empty"
    print(f"  [PASS] Evidence Matrix: {len(matrix)} cells populated.")

    # Check Conflicts
    conflicts = analysis.get("conflicts", [])
    assert len(conflicts) > 0, "Conflicts should be detected in CSSS demo"
    print(f"  [PASS] Conflict Detector: Found {len(conflicts)} policy discrepancies.")
    for c in conflicts[:2]:
        print(f"         - {c['aspect_name']}: {c['contrast_summary']}")

    # Check Echo Sources
    edges = analysis.get("independence_edges", [])
    echoes = [e for e in edges if e["relation_type"] == "echo_source"]
    assert len(echoes) > 0, "Echo source should be detected between blog and forum"
    print(f"  [PASS] Echo Detector: Found {len(echoes)} echo relationships.")

    # Check 3-Lane Trust Dashboard
    trust = analysis.get("three_lane_trust", {})
    quote_grounded = trust.get("quote_grounded", [])
    assert len(quote_grounded) > 0, "Quote grounded items empty"
    print(f"  [PASS] 3-Lane Trust: {len(quote_grounded)} quote-grounded findings.")

    # Check Readiness Score
    score_obj = analysis.get("readiness_score", {})
    initial_score = score_obj.get("score")
    assert initial_score is not None, "Readiness score missing"
    print(f"  [PASS] Initial Decision Readiness Score: {initial_score}/100 ({score_obj.get('status')})")

    # 6. Interactive Verification & Dynamic Score Ticker
    print("\n[6/6] Testing Interactive Verification & Score Update...")
    checklist = analysis.get("checklist", [])
    assert len(checklist) > 0, "Checklist items empty"
    first_item = checklist[0]

    # Call verify/mark
    mark_status, _, mark_res = make_request("/api/verify/mark", method="POST", data={
        "checklist_item_id": first_item["id"],
        "verified": True,
        "notes": "Verified against official gazette notification."
    })
    assert mark_status == 200, f"Mark verify endpoint failed: {mark_status}"
    print(f"  [PASS] Verification Endpoint: {mark_res.get('message')}")

    # Re-analyze with verified_checklist_ids
    status_updated, _, updated_analysis = make_request("/api/analyze", method="POST", data={
        "goal": demo["goal"],
        "blueprint": demo["blueprint"],
        "sources": demo["sources"],
        "verified_checklist_ids": [first_item["id"]]
    })
    updated_score = updated_analysis["readiness_score"]["score"]
    bonus = updated_analysis["readiness_score"]["breakdown"]["user_verified_bonus"]
    print(f"  [PASS] Updated Readiness Score: {updated_score}/100 (Bonus: +{bonus} pts)")
    assert updated_score > initial_score, f"Expected score to increase: {updated_score} vs {initial_score}"

    print("\n" + "=" * 60)
    print("ALL 6 END-TO-END INTEGRATION CHECKS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_e2e_tests()
