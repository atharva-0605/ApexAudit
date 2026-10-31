import re
import logging
from typing import List, Dict, Any, Optional
from app.models.schemas import BlueprintItem

logger = logging.getLogger(__name__)

DEFAULT_BLUEPRINTS: Dict[str, List[BlueprintItem]] = {
    "scholarship": [
        BlueprintItem(
            id="bp-income",
            aspect="Family Annual Income Ceiling",
            failure_scenario="Application rejected or disqualified due to exceeding parental income cap or submitting wrong fiscal year income certificate.",
            criticality="HIGH",
            description="Parental or family annual income threshold, income certificate authority, and acceptable fiscal year.",
            weight=1.0
        ),
        BlueprintItem(
            id="bp-academic-marks",
            aspect="Academic Performance & Backlog Criteria",
            failure_scenario="Scholarship cancelled or withheld because semester grade point / percentage was below cutoff or active backlogs exist.",
            criticality="HIGH",
            description="Minimum aggregate marks/grade requirements and rules regarding backlogs or repeat examinations.",
            weight=1.0
        ),
        BlueprintItem(
            id="bp-concurrent-scholarship",
            aspect="Dual / Concurrent Aid Prohibition",
            failure_scenario="Disqualification and penalty recovery due to receiving state fee waiver or another scholarship simultaneously.",
            criticality="HIGH",
            description="Exclusivity clauses forbidding multiple concurrent central or state financial awards.",
            weight=1.0
        ),
        BlueprintItem(
            id="bp-bank-npci",
            aspect="Direct Benefit Transfer (DBT) & NPCI Seeding",
            failure_scenario="Funds bounce permanently at PFMS gateway because bank account is not mapped with Aadhaar NPCI mapper in applicant's sole name.",
            criticality="HIGH",
            description="Mandatory active Aadhaar seeding on NPCI mapper and individual account ownership criteria.",
            weight=1.0
        ),
        BlueprintItem(
            id="bp-submission-deadline",
            aspect="Filing Cutoff Date & Verification Window",
            failure_scenario="Portal lockout after deadline; missed institutional verification cutoff resulting in immediate cancellation.",
            criticality="HIGH",
            description="Closing dates for student submission and institute nodal officer verification.",
            weight=1.0
        ),
        BlueprintItem(
            id="bp-attendance",
            aspect="Mandatory Institution Attendance",
            failure_scenario="Institution officer refuses renewal endorsement due to attendance below mandatory threshold.",
            criticality="MEDIUM",
            description="Minimum institutional attendance record required (e.g. 75%).",
            weight=0.6
        ),
        BlueprintItem(
            id="bp-course-switch",
            aspect="Transfer & Stream Change Restrictions",
            failure_scenario="Scholarship revoked upon transferring colleges or switching majors without prior authorization.",
            criticality="LOW",
            description="Policies governing change of institution, faculty, or academic branch.",
            weight=0.3
        )
    ],
    "business_license": [
        BlueprintItem(
            id="bp-zoning",
            aspect="Municipal Zoning & Land-Use Clearance",
            failure_scenario="Operation shut down by municipal authorities or penalized for non-conforming commercial use in residential zone.",
            criticality="HIGH",
            description="Zoning jurisdiction, land-use permits, and building clearance requirements.",
            weight=1.0
        ),
        BlueprintItem(
            id="bp-tax-registration",
            aspect="Tax ID & GST / Sales Tax Threshold",
            failure_scenario="Bank accounts frozen or hefty tax audit penalties for trading without compulsory turnover tax registration.",
            criticality="HIGH",
            description="Mandatory GST/sales tax registration triggers and timelines.",
            weight=1.0
        ),
        BlueprintItem(
            id="bp-fire-safety",
            aspect="Fire Department NOC & Safety Standards",
            failure_scenario="Commercial premises sealed due to lack of fire department inspection NOC.",
            criticality="HIGH",
            description="Fire safety equipment standards, emergency exit clearances, and periodic NOC renewals.",
            weight=1.0
        ),
        BlueprintItem(
            id="bp-license-renewal",
            aspect="Trade License Expiry & Renewal Period",
            failure_scenario="Operating with expired trade permit incurring compounding daily fines.",
            criticality="MEDIUM",
            description="Annual renewal window and penalties for late submission.",
            weight=0.6
        )
    ],
    "visa": [
        BlueprintItem(
            id="bp-financial-proof",
            aspect="Sufficient Maintenance Funds & Seasoning",
            failure_scenario="Visa denied under immigration rules for unseasoned funds, sudden lump-sum deposits, or unverified bank statements.",
            criticality="HIGH",
            description="Minimum liquid funds, proof of origin, and minimum 28-day / 90-day bank statement seasoning.",
            weight=1.0
        ),
        BlueprintItem(
            id="bp-passport-validity",
            aspect="Passport Validity Period Beyond Return",
            failure_scenario="Boarding denied or visa rejected due to passport having less than 6 months validity from planned departure.",
            criticality="HIGH",
            description="Minimum remaining passport validity and blank visa pages requirement.",
            weight=1.0
        ),
        BlueprintItem(
            id="bp-health-insurance",
            aspect="Approved Health & Medical Travel Cover",
            failure_scenario="Consulate rejection due to travel insurance not meeting minimum emergency coverage limit or Schengen/national standards.",
            criticality="HIGH",
            description="Policy minimum cover (e.g. €30,000 / $50,000), repatriation clause, and approved insurance underwriters.",
            weight=1.0
        ),
        BlueprintItem(
            id="bp-work-limitations",
            aspect="Permitted In-Country Activities & Employment Limits",
            failure_scenario="Deportation or visa cancellation for unauthorized freelance or part-time work exceeding weekly cap.",
            criticality="MEDIUM",
            description="Allowable activities, restrictions on paid employment, and maximum weekly working hours.",
            weight=0.6
        )
    ]
}

def generate_blueprint_for_goal(goal: str, context: str = "") -> List[BlueprintItem]:
    """
    Generates a pre-mortem blueprint worked backward from catastrophic real-world failure scenarios.
    Attempts Google Gemini LLM generation first, and seamlessly falls back to pre-cached domain blueprints
    and heuristic failure patterns.
    """
    # 1. Attempt Google Gemini LLM Generation
    try:
        from app.services.llm_service import generate_blueprint_with_gemini
        llm_items = generate_blueprint_with_gemini(goal, context)
        if llm_items and len(llm_items) >= 3:
            return llm_items
    except Exception as e:
        logger.warning(f"Gemini blueprint generation failed or timed out, using fallback: {e}")

    # 2. Seamless Fallback: Domain Pre-cached Blueprints
    goal_lower = goal.lower()
    
    if any(k in goal_lower for k in ["scholarship", "csss", "fellowship", "financial aid", "grant", "stipend"]):
        return DEFAULT_BLUEPRINTS["scholarship"]
    elif any(k in goal_lower for k in ["license", "business", "permit", "shop", "commercial", "trade"]):
        return DEFAULT_BLUEPRINTS["business_license"]
    elif any(k in goal_lower for k in ["visa", "immigration", "embassy", "schengen", "passport", "work permit", "travel"]):
        return DEFAULT_BLUEPRINTS["visa"]
    
    # 3. Generic Pre-Mortem Heuristic Generator
    keywords = re.findall(r'\b[A-Za-z]{3,}\b', goal)
    primary_topic = " ".join(keywords[:3]) if keywords else "Target Goal"

    return [
        BlueprintItem(
            id="bp-eligibility-limits",
            aspect=f"Core Eligibility & Gatekeeper Criteria for {primary_topic}",
            failure_scenario="Immediate disqualification due to unfulfilled minimum statutory or institutional criteria.",
            criticality="HIGH",
            description="Baseline thresholds, age/score/jurisdiction boundaries, and mandatory pre-requisites.",
            weight=1.0
        ),
        BlueprintItem(
            id="bp-critical-deadlines",
            aspect="Hard Filing Deadlines & Verification Grace Periods",
            failure_scenario="Permanent application lockout caused by relying on outdated or contradictory closing dates.",
            criticality="HIGH",
            description="Student/applicant submission cutoffs and subsequent third-party validation stages.",
            weight=1.0
        ),
        BlueprintItem(
            id="bp-mandatory-documentation",
            aspect="Mandatory Verification Documents & Attestation Rules",
            failure_scenario="Application rejected for providing expired certificates, self-declaration without notary, or invalid issuing authority.",
            criticality="HIGH",
            description="Official document formats, issuing authority guidelines, and acceptable issuance dates.",
            weight=1.0
        ),
        BlueprintItem(
            id="bp-financial-obligations",
            aspect="Financial / Disbursement Channel Requirements",
            failure_scenario="Payment failure, severe fine, or forfeiture caused by non-compliance with disbursement protocols.",
            criticality="HIGH",
            description="Payment channels, banking mandates, fee deposit schedules, and income proofs.",
            weight=1.0
        ),
        BlueprintItem(
            id="bp-ongoing-compliance",
            aspect="Maintenance & Renewal Conditions",
            failure_scenario="Loss of benefit or renewal cancellation after year one due to failing ongoing compliance tests.",
            criticality="MEDIUM",
            description="Periodic performance standards, attendance, audits, or recurring reporting duties.",
            weight=0.6
        ),
        BlueprintItem(
            id="bp-exceptions-restrictions",
            aspect="Exclusivity Clauses & Disqualifying Conditions",
            failure_scenario="Retroactive disqualification and penal recovery for violating concurrent entitlement rules.",
            criticality="MEDIUM",
            description="Restrictions against holding conflicting benefits, external activities, or dual registrations.",
            weight=0.6
        )
    ]
