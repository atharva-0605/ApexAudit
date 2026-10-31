"""
Test Export Verification Report Suite
Validates backend /api/export endpoints and Markdown report structure.
"""

import urllib.request
import urllib.error
import json

API_BASE = "http://127.0.0.1:8000"

def run_export_tests():
    print("=" * 60)
    print("ApexAudit Export Verification Suite")
    print("=" * 60)

    # 1. Fetch demo pack and perform analysis
    print("\n[1/3] Fetching Demo and Running Analysis...")
    demo_req = urllib.request.Request(f"{API_BASE}/api/sources/demo/csss-scholarship-renewal")
    with urllib.request.urlopen(demo_req) as resp:
        demo = json.loads(resp.read().decode())
    
    analyze_payload = json.dumps({
        "goal": demo["goal"],
        "blueprint": demo["blueprint"],
        "sources": demo["sources"],
        "verified_checklist_ids": []
    }).encode("utf-8")

    analyze_req = urllib.request.Request(
        f"{API_BASE}/api/analyze",
        data=analyze_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(analyze_req) as resp:
        analysis = json.loads(resp.read().decode())
    
    print(f"  [PASS] Analysis generated with {len(analysis['matrix'])} matrix cells and {len(analysis['conflicts'])} conflicts.")

    # 2. Test /api/export/markdown attachment
    print("\n[2/3] Testing POST /api/export/markdown (File Attachment)...")
    export_payload = json.dumps(analysis).encode("utf-8")
    export_req = urllib.request.Request(
        f"{API_BASE}/api/export/markdown",
        data=export_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(export_req) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        content_disp = resp.headers.get("Content-Disposition", "")
        assert "attachment" in content_disp and ".md" in content_disp, f"Missing attachment header: {content_disp}"
        md_text = resp.read().decode("utf-8")
        
        # Verify required report sections
        assert "# ApexAudit - Decision Readiness Report" in md_text, "Title missing"
        assert "## 1. Executive Summary & Goal" in md_text, "Executive summary missing"
        assert "### Score Breakdown" in md_text, "Score breakdown missing"
        assert "## 2. Ingested Sources Reviewed" in md_text, "Sources reviewed missing"
        assert "## 3. Pre-Mortem Blueprint & Failure Scenarios" in md_text, "Blueprint missing"
        assert "## 4. Evidence Matrix Summary" in md_text, "Matrix summary missing"
        assert "## 5. Identified Conflicts & Contradictions" in md_text, "Conflicts missing"
        assert "## 6. Temporal Drift & Date Signals" in md_text, "Temporal drift missing"
        assert "## 7. Source Independence & Echo Analysis" in md_text, "Echo analysis missing"
        assert "## 8. Three-Lane Trust Verification" in md_text, "3-lane trust missing"
        assert "## 9. Prioritized Verification Checklist & Action Kit" in md_text, "Checklist missing"
        assert "Official Sources to Verify:" in md_text or "Draft Query" in md_text, "Verification kit details missing"
        
        print(f"  [PASS] Downloadable Markdown Report received successfully ({len(md_text)} bytes).")
        print(f"  [PASS] Content-Disposition: {content_disp}")

    # 3. Test /api/export/markdown/text (JSON format)
    print("\n[3/3] Testing POST /api/export/markdown/text (JSON format)...")
    json_export_req = urllib.request.Request(
        f"{API_BASE}/api/export/markdown/text",
        data=export_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(json_export_req) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        json_res = json.loads(resp.read().decode("utf-8"))
        assert "filename" in json_res and json_res["filename"].endswith(".md"), "Filename missing in JSON response"
        assert "content" in json_res and len(json_res["content"]) > 500, "Content empty or too short"
        print(f"  [PASS] JSON Export Endpoint verified: filename='{json_res['filename']}'")

    print("\n" + "=" * 60)
    print("ALL EXPORT REPORT VERIFICATION CHECKS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    run_export_tests()
