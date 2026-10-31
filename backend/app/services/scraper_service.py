"""
ApexAudit - Scraper Service
Resilient web scraper engineered for academic, regulatory, and public web documents.
Provides modern browser User-Agent profiles, SSL certificate fallback, Wikimedia bot compliance,
and robust metadata / authority scoring.
"""

import ipaddress
import logging
import re
import socket
import ssl
import urllib.parse
import urllib.request
from typing import Optional, Tuple, Dict, Any
import httpx
from bs4 import BeautifulSoup
from app.models.schemas import SourceInput

logger = logging.getLogger("apexaudit.scraper")

def is_safe_public_url(url: str) -> Tuple[bool, str]:
    """
    Validates that a URL uses http/https and does not resolve to loopback,
    link-local, cloud metadata, or private IP networks (SSRF prevention).
    """
    try:
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False, f"Unsupported URL scheme '{parsed.scheme}'. Only http and https are permitted."

        hostname = parsed.hostname
        if not hostname:
            return False, "Invalid URL: missing hostname."

        lower_host = hostname.lower()
        if lower_host in ("localhost", "127.0.0.1", "::1", "0.0.0.0", "metadata.google.internal", "instance-data"):
            return False, f"Access to local or cloud metadata host '{hostname}' is restricted."

        try:
            ip_str = socket.gethostbyname(hostname)
            ip = ipaddress.ip_address(ip_str)
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
                return False, f"Access to private IP address '{ip_str}' is restricted."
            if ip_str == "169.254.169.254":
                return False, "Access to cloud instance metadata is restricted."
        except socket.gaierror:
            # Let network fetch handle unresolvable domains
            pass

        return True, ""
    except Exception as e:
        return False, f"URL validation error: {str(e)}"

# Modern Chrome Browser Headers
DEFAULT_BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "DNT": "1",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Ch-Ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
}

# Wikimedia-compliant bot headers (required by Wikipedia robot policy to prevent 403 Forbidden)
WIKIMEDIA_HEADERS = {
    "User-Agent": "ApexAuditResearchBot/2.0 (https://apexaudit.dev; research@apexaudit.dev)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

# Firefox fallback headers for anti-bot WAFs that block standard Chrome fingerprints
FIREFOX_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.8",
}


def compute_authority_and_type(url: str) -> Tuple[str, float]:
    """
    Computes source type and base authority score based on domain heuristics.
    Returns (source_type, authority_score).
    """
    try:
        domain = urllib.parse.urlparse(url).netloc.lower()
    except Exception:
        domain = url.lower()

    # Government and official academic institutions
    official_suffixes = (
        ".gov", ".gov.in", ".nic.in", ".gov.uk", ".gov.au", ".gov.ca",
        ".mil", ".edu", ".ac.uk", ".ac.in", ".edu.in"
    )
    official_keywords = (
        "gov.", ".gov.", ".nic.", "who.int", "europa.eu", "un.org",
        "worldbank.org", "unesco.org", "ugc.ac.in", "aicte-india.org",
        "scholarships.gov.in", "education.gov.in"
    )
    if any(domain.endswith(s) for s in official_suffixes) or any(k in domain for k in official_keywords):
        return "official", 0.95

    # Trusted encyclopedias & reference libraries
    if "wikipedia.org" in domain or "wikimedia.org" in domain or "wiktionary.org" in domain:
        return "aggregator", 0.85

    # High-reputation news & reference publishers
    top_publishers = (
        "reuters.com", "bbc.com", "bbc.co.uk", "nytimes.com", "thehindu.com",
        "indianexpress.com", "bloomberg.com", "nature.com", "sciencedirect.com"
    )
    if any(p in domain for p in top_publishers):
        return "aggregator", 0.80

    # User forums & community discussion boards
    forum_keywords = ("reddit.com", "quora.com", "twitter.com", "x.com", "medium.com", "substack.com", "forum")
    if any(k in domain for k in forum_keywords):
        return "forum", 0.40

    # Default aggregator / open web portal
    return "aggregator", 0.65


def extract_published_date(soup: BeautifulSoup, raw_html: str) -> Optional[str]:
    """
    Extracts published or last modified date from HTML meta tags or structured elements.
    """
    # 1. Meta property and name inspections
    date_meta_keys = [
        {"property": "article:published_time"},
        {"property": "article:modified_time"},
        {"name": "publication_date"},
        {"name": "date"},
        {"name": "DC.date.issued"},
        {"name": "sailthru.date"},
        {"property": "og:updated_time"},
    ]
    for attrs in date_meta_keys:
        tag = soup.find("meta", attrs=attrs)
        if tag and tag.get("content"):
            val = str(tag["content"]).strip()
            # If ISO formatted date, slice YYYY-MM-DD
            iso_match = re.search(r"(\d{4}-\d{2}-\d{2})", val)
            if iso_match:
                return iso_match.group(1)
            return val[:24]

    # 2. Wikipedia specific last modified footer
    wiki_footer = soup.find(id="footer-info-lastmod")
    if wiki_footer:
        m = re.search(r"(\d{1,2}\s+[A-Za-z]+\s+\d{4})", wiki_footer.text)
        if m:
            return m.group(1)

    # 3. HTML5 <time> tag
    time_tag = soup.find("time")
    if time_tag:
        dt = time_tag.get("datetime") or time_tag.text
        if dt:
            iso_match = re.search(r"(\d{4}-\d{2}-\d{2})", str(dt).strip())
            if iso_match:
                return iso_match.group(1)
            return str(dt).strip()[:24]

    # 4. Regex scan in text
    date_regex = re.search(r"\b(20[12]\d-[01]\d-[0-3]\d)\b", raw_html[:15000])
    if date_regex:
        return date_regex.group(1)

    return None


def clean_article_text(soup: BeautifulSoup, is_wikipedia: bool = False) -> str:
    """
    Strips noise (scripts, styles, navigation, footer, ads) and extracts readable article text.
    """
    # Target content container if available
    target_node = None
    if is_wikipedia:
        target_node = soup.find(id="mw-content-text")
    else:
        for selector in ["article", "main", "#content", ".post-content", ".article-body", ".entry-content"]:
            found = soup.select_one(selector)
            if found:
                target_node = found
                break

    if not target_node:
        target_node = soup.body or soup

    # Make a copy or modify in place to decompose unwanted tags
    unwanted_tags = [
        "script", "style", "nav", "footer", "header", "noscript",
        "svg", "iframe", "form", "button", "aside"
    ]
    for el in target_node.find_all(unwanted_tags):
        el.decompose()

    # Decompose Wikipedia specific clutter
    if is_wikipedia:
        for cl in [".mw-editsection", ".navbox", ".reflist", ".reference", ".catlinks", "#toc", ".ambox"]:
            for el in target_node.select(cl):
                el.decompose()

    # Extract clean paragraph and line chunks
    lines = (line.strip() for line in target_node.get_text().splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    cleaned_text = "\n".join(chunk for chunk in chunks if chunk)

    # Safe length cap (25,000 chars)
    return cleaned_text[:25000]


async def fetch_html_with_fallbacks(url: str) -> str:
    """
    Fetches raw HTML with a multi-tier resilience pipeline:
    - Tier 1: Modern Chrome headers with strict SSL verification
    - Tier 2: SSL fallback (verify=False) for misconfigured state/govt certs
    - Tier 3: Wikimedia bot headers if domain is Wikipedia or 403 returned
    - Tier 4: urllib with SSL unverified context
    """
    domain = urllib.parse.urlparse(url).netloc.lower()
    is_wikimedia = "wikipedia.org" in domain or "wikimedia.org" in domain or "wiktionary.org" in domain

    # Choose primary headers
    headers = WIKIMEDIA_HEADERS if is_wikimedia else DEFAULT_BROWSER_HEADERS

    # Tier 1 & 2: HTTPX Async Client
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, verify=True) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 403 and not is_wikimedia:
                # Try Wikimedia compliant headers on 403
                logger.info(f"Received 403 from {url}, retrying with research bot headers")
                resp = await client.get(url, headers=WIKIMEDIA_HEADERS)

            resp.raise_for_status()
            return resp.text
    except (httpx.ConnectError, ssl.SSLCertVerificationError, httpx.RequestError) as ssl_err:
        logger.warning(f"Strict SSL/connection failed for {url} ({ssl_err}). Retrying with verify=False...")
        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, verify=False) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code == 403:
                    resp = await client.get(url, headers=WIKIMEDIA_HEADERS)
                resp.raise_for_status()
                return resp.text
        except Exception as retry_err:
            logger.warning(f"HTTPX verify=False failed for {url} ({retry_err}). Falling back to urllib...")
    except Exception as e:
        logger.warning(f"HTTPX primary fetch failed for {url} ({e}). Retrying with urllib fallback...")

    # Tier 4: Urllib with unverified context fallback
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        req = urllib.request.Request(
            url,
            headers=WIKIMEDIA_HEADERS if is_wikimedia else FIREFOX_HEADERS
        )
        with urllib.request.urlopen(req, context=ctx, timeout=15) as response:
            encoding = response.headers.get_content_charset() or "utf-8"
            return response.read().decode(encoding, errors="replace")
    except Exception as urllib_err:
        raise RuntimeError(f"All network fetch tiers exhausted for {url}: {urllib_err}") from urllib_err


async def scrape_url(url: str) -> SourceInput:
    """
    Main entry point for scraping public URLs into a normalized SourceInput.
    Includes SSRF validation, multi-tier fallback, and clean article extraction.
    """
    url = url.strip()
    
    # 1. Scheme safety check before any prefixing
    parsed_raw = urllib.parse.urlparse(url)
    if parsed_raw.scheme and parsed_raw.scheme.lower() not in ("http", "https"):
        logger.warning(f"Blocked SSRF/restricted URL attempt: {url} (Unsupported scheme '{parsed_raw.scheme}')")
        return SourceInput(
            id=f"src-restricted-{abs(hash(url)) % 100000}",
            title=f"Restricted URL: {url}",
            url=url,
            raw_text=f"Security Restriction: Unsupported URL scheme '{parsed_raw.scheme}'. Only http and https are permitted.",
            source_type="user_pasted",
            published_date=None,
            authority_score=0.1
        )

    # 2. Add https prefix if user omitted scheme for a normal web domain (e.g., 'wikipedia.org/wiki/...')
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    # 3. SSRF & Restricted Host Prevention Check
    is_safe, reason = is_safe_public_url(url)
    if not is_safe:
        logger.warning(f"Blocked SSRF/restricted URL attempt: {url} ({reason})")
        return SourceInput(
            id=f"src-restricted-{abs(hash(url)) % 100000}",
            title=f"Restricted URL: {url}",
            url=url,
            raw_text=f"Security Restriction: {reason} Only public internet resources can be ingested.",
            source_type="user_pasted",
            published_date=None,
            authority_score=0.1
        )

    domain = urllib.parse.urlparse(url).netloc.lower()
    is_wikipedia = "wikipedia.org" in domain or "wikimedia.org" in domain

    try:
        html = await fetch_html_with_fallbacks(url)
        soup = BeautifulSoup(html, "html.parser")

        # Extract title
        title = None
        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            title = str(og_title["content"]).strip()
        elif soup.title and soup.title.string:
            title = soup.title.string.strip()
        elif soup.h1:
            title = soup.h1.get_text().strip()

        if not title:
            title = f"Document from {domain}"

        # Clean title suffix (e.g. " - Wikipedia", " | Official Site")
        clean_title = re.sub(r"\s*[-|–]\s*(Wikipedia|Home|Official Portal|Gov\.in).*$", "", title, flags=re.IGNORECASE)
        clean_title = clean_title.strip() or title

        # Extract clean body text
        raw_text = clean_article_text(soup, is_wikipedia=is_wikipedia)
        if len(raw_text) < 100:
            # Fall back to general soup text if article container was too brief
            raw_text = "\n".join(
                line.strip() for line in soup.get_text().splitlines() if line.strip()
            )[:25000]

        # Extract publication / modified date
        published_date = extract_published_date(soup, html)

        # Compute authority and source type
        source_type, authority_score = compute_authority_and_type(url)

        return SourceInput(
            id=f"src-{abs(hash(url)) % 100000}",
            title=clean_title[:120],
            url=url,
            raw_text=raw_text,
            source_type=source_type,
            published_date=published_date,
            authority_score=authority_score
        )

    except Exception as e:
        logger.error(f"Failed to scrape URL {url}: {e}")
        # Return fallback placeholder so user is cleanly guided to pasted-text fallback
        return SourceInput(
            id=f"src-fallback-{abs(hash(url)) % 100000}",
            title=f"Failed fetch: {url}",
            url=url,
            raw_text=f"Note: Could not automatically fetch this URL ({str(e)}). Please use the Pasted Text Fallback option to provide the document text directly.",
            source_type="user_pasted",
            published_date=None,
            authority_score=0.3
        )
