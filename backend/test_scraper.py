"""
ApexAudit - Automated Scraper Verification Suite
Tests outbound scraping reliability, User-Agent compliance, SSL resilience,
and authority heuristics.
"""

import sys
import os
import asyncio

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(__file__))

from app.services.scraper_service import (
    scrape_url,
    compute_authority_and_type,
    extract_published_date,
    clean_article_text,
    is_safe_public_url
)

def test_authority_scoring():
    print("[1/4] Testing Domain Authority & Type Heuristics...")
    cases = [
        ("https://scholarships.gov.in/portal", "official", 0.95),
        ("https://www.education.gov.in/guidelines", "official", 0.95),
        ("https://en.wikipedia.org/wiki/Scholarship", "aggregator", 0.85),
        ("https://www.reuters.com/education/news", "aggregator", 0.80),
        ("https://docs.python.org/3/", "aggregator", 0.65),
        ("https://reddit.com/r/scholarships", "forum", 0.40)
    ]
    for url, exp_type, exp_score in cases:
        src_type, score = compute_authority_and_type(url)
        assert src_type == exp_type, f"Expected {exp_type} for {url}, got {src_type}"
        assert abs(score - exp_score) < 0.01, f"Expected {exp_score} for {url}, got {score}"
        print(f"  [PASS] {url} -> type={src_type}, authority={score}")

async def test_wikipedia_scraping():
    print("\n[2/4] Testing Wikipedia Scraping (Wikimedia Robot Policy & Clean Text)...")
    wiki_url = "https://en.wikipedia.org/wiki/Scholarship"
    result = await scrape_url(wiki_url)
    assert not result.title.startswith("Failed fetch"), f"Scraper failed with: {result.raw_text}"
    assert result.source_type == "aggregator", f"Expected aggregator, got {result.source_type}"
    assert result.authority_score >= 0.8, f"Expected >= 0.8, got {result.authority_score}"
    assert len(result.raw_text) > 1000, f"Expected substantial text, got {len(result.raw_text)} chars"
    print(f"  [PASS] Title: '{result.title}'")
    print(f"  [PASS] Extracted Date: '{result.published_date}'")
    print(f"  [PASS] Clean Text: {len(result.raw_text)} chars extracted without bot rejection.")

async def test_docs_scraping():
    print("\n[3/4] Testing Public Documentation Scraping...")
    doc_url = "https://docs.python.org/3/"
    result = await scrape_url(doc_url)
    assert not result.title.startswith("Failed fetch"), f"Scraper failed with: {result.raw_text}"
    assert len(result.raw_text) > 500, f"Expected text, got {len(result.raw_text)} chars"
    print(f"  [PASS] Title: '{result.title}'")
    print(f"  [PASS] Text length: {len(result.raw_text)} chars")

async def test_fallback_resilience():
    print("\n[4/5] Testing Unreachable Domain Fallback Handling...")
    invalid_url = "https://nonexistent-domain-verification-test-99999.invalid/doc"
    result = await scrape_url(invalid_url)
    assert result.title.startswith("Failed fetch"), "Expected fallback title on unreachable domain"
    assert result.source_type == "user_pasted", "Expected user_pasted fallback type"
    assert "Could not automatically fetch" in result.raw_text
    print("  [PASS] Graceful fallback generated without crashing.")

async def test_ssrf_prevention():
    print("\n[5/5] Testing SSRF & Restricted Host Prevention...")
    restricted_targets = [
        "http://localhost:8000/api/analyze",
        "http://127.0.0.1:3000",
        "http://169.254.169.254/latest/meta-data/",
        "file:///etc/passwd"
    ]
    for target in restricted_targets:
        safe, msg = is_safe_public_url(target)
        assert not safe, f"Expected {target} to be blocked by SSRF check"
        res = await scrape_url(target)
        assert res.title.startswith("Restricted URL") or res.title.startswith("Failed fetch"), f"Expected restricted title for {target}"
        print(f"  [PASS] Blocked SSRF attempt to {target}: {msg}")

async def main():
    print("============================================================")
    print("ApexAudit Scraper Service Verification Suite")
    print("============================================================")
    test_authority_scoring()
    await test_wikipedia_scraping()
    await test_docs_scraping()
    await test_fallback_resilience()
    await test_ssrf_prevention()
    print("\n============================================================")
    print("ALL 5 SCRAPER RESILIENCE & SECURITY CHECKS PASSED!")
    print("============================================================")

if __name__ == "__main__":
    asyncio.run(main())
