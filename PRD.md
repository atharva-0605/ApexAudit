# Product Requirements Document (PRD.md): ApexAudit

## 1. Overview & Vision
**ApexAudit** is an intelligent decision-readiness web platform that reviews multiple information sources on a specific topic or goal and evaluates how ready the information is for a real-world decision. It surfaces missing information, conflicting claims, outdated rules, and echo sources, providing a prioritized, quote-grounded verification checklist and a live Decision Readiness Score.

## 2. Problem Statement & Target Users
* **Target Users**: Students (scholarships, admissions), job seekers, citizens (government schemes), small business owners (licenses, subsidies), and researchers.
* **Core Pain Point**: Search engines find information and summarizers condense it, but neither answers the critical question: *"What do you still not know or what is unverified?"* Acting on incomplete or stale data leads to missed deadlines, lapsed renewals, or disqualifications.

## 3. Core Functional Requirements
1. **Goal & Source Ingestor**:
   * Input field for goal, question, or decision type (e.g., CSSS scholarship renewal/application).
   * Multi-source ingestion supporting URL fetching, text extraction, pasted-text fallback, and demo caching.
2. **Pre-Mortem Blueprint Generator**:
   * AI-generated failure scenarios worked backward into required knowledge items, each assigned a criticality weight.
   * User-editable blueprint before analysis runs.
3. **Claim Extraction & Quote Verification**:
   * Atomic claims tagged by aspect, value, and source location.
   * **Strict Quote Verifier**: Every finding must carry an exact verbatim quote matching the source text; unmatched claims are discarded.
4. **Coverage & Conflict Analysis**:
   * Evidence matrix (Aspects $\times$ Sources) marking cells as Covered, Conflicting, Outdated, or Missing.
   * Conflict detector showing contrasting values side-by-side with references.
   * Temporal drift detection (date signals, archive checks) and source independence graph (detecting echo sources / single origins).
5. **Readiness Score & Verification Kit**:
   * Live weighted share of blueprint items covered by independent, current, non-conflicting sources minus penalties.
   * Prioritized verification checklist ranked by impact $\times$ uncertainty.
   * Three-lane trust dashboard (Quote-grounded, AI-suggested, Not found).
   * Verification kit including official links to check, draft query emails, and a mark-as-verified action that updates the live score.

## 4. Non-Functional Requirements
* **Transparency & Cautious Wording**: Use cautious terminology ("Potential gap", "Possible conflict", "Not found in sources reviewed") rather than false certainty.
* **Modularity**: Clean separation of codebase into `frontend/` and `backend/` directories.
* **Reliability**: Robust fallback mechanisms for blocked URLs (pasted text) and pre-cached demo datasets (e.g., the CSSS scholarship pack) to guarantee flawless demo execution.

## 5. MVP Scope & Out of Scope
* **In Scope (MVP)**: Full end-to-end flow from goal input $\rightarrow$ blueprint review $\rightarrow$ source addition $\rightarrow$ matrix/findings dashboard $\rightarrow$ interactive checklist & live score update.
* **Out of Scope**: User authentication databases, broad web crawling, multi-language support, chat interfaces.
