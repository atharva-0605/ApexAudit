import { AnalysisResponse, BlueprintItem, DemoPack, SourceInput } from "./types";
import { evaluateLocally } from "./clientEngine";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function checkBackendHealth(): Promise<{ online: boolean; message: string }> {
  try {
    const rootUrl = BACKEND_URL.replace(/\/api\/?$/, "");
    const res = await fetch(`${rootUrl}/health`, {
      method: "GET",
      headers: { Accept: "application/json" }
    });
    if (res.ok) {
      return { online: true, message: "FastAPI Backend Online & Connected" };
    }
    return { online: false, message: `Backend returned status ${res.status}` };
  } catch (err: any) {
    return { online: false, message: "Backend offline - fallback active" };
  }
}

export async function fetchDemos(): Promise<{ id: string; name: string; description: string; sources_count: number }[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/sources/demos`);
    if (!res.ok) throw new Error("Failed to fetch demos from backend");
    return await res.json();
  } catch (err) {
    console.warn("Backend not reached for demos, returning client fallback:", err);
    return [
      {
        id: "csss-scholarship-renewal",
        name: "Central Sector Scheme of Scholarship (CSSS) - Renewal & Eligibility Pack",
        description: "Official Ministry guidelines vs. aggregator blog vs. forum echo showing income conflicts, outdated deadlines, and DBT bank account pitfalls.",
        sources_count: 3
      }
    ];
  }
}

export async function fetchDemoPack(demoId: string = "csss-scholarship-renewal"): Promise<DemoPack> {
  try {
    const res = await fetch(`${BACKEND_URL}/sources/demo/${demoId}`);
    if (!res.ok) throw new Error("Failed to fetch demo pack");
    return await res.json();
  } catch (err) {
    console.warn("Backend not reached for demo pack, using client fallback:", err);
    return {
      id: "csss-scholarship-renewal",
      name: "Central Sector Scheme of Scholarship (CSSS) - Renewal & Eligibility Pack",
      goal: "Verify eligibility, renewal criteria, and submission deadlines for the Central Sector Scheme of Scholarship (CSSS) for College and University Students to avoid cancellation or lapse.",
      blueprint: [
        {
          id: "bp-income",
          aspect: "Family Annual Income Ceiling",
          failure_scenario: "Application rejected or scholarship clawed back due to exceeding maximum parental income threshold or submitting invalid financial year certificate.",
          criticality: "HIGH",
          description: "Gross parental/family annual income limit from all sources, including validity of certificate.",
          weight: 1.0
        },
        {
          id: "bp-academic-marks",
          aspect: "Minimum Academic Performance for Renewal",
          failure_scenario: "Scholarship discontinued mid-degree due to falling below the required grade/percentage threshold or having backlogs in semester examinations.",
          criticality: "HIGH",
          description: "Minimum aggregate marks or CGPA required in previous year/semester exam to retain scholarship.",
          weight: 1.0
        },
        {
          id: "bp-attendance",
          aspect: "Mandatory College Attendance Requirement",
          failure_scenario: "College nodal officer refuses to verify renewal application on the portal due to shortage in attendance records.",
          criticality: "MEDIUM",
          description: "Minimum verified percentage of attendance in college or university.",
          weight: 0.6
        },
        {
          id: "bp-concurrent-scholarship",
          aspect: "Prohibition of Dual / Concurrent Scholarships",
          failure_scenario: "Student booked for fraudulent duplicate claim or barred from future government benefits for accepting state fee waiver concurrently.",
          criticality: "HIGH",
          description: "Strict restrictions against holding any other Central, State, or Institutional financial aid/scholarship.",
          weight: 1.0
        },
        {
          id: "bp-bank-npci",
          aspect: "Aadhaar Seeding with NPCI Mapper for DBT",
          failure_scenario: "Payment fails permanently at PFMS/DBT gateway because the student's bank account was merely linked to Aadhaar but not active on NPCI mapper.",
          criticality: "HIGH",
          description: "Requirement for active DBT enabled bank account mapped with NPCI, in student's sole name.",
          weight: 1.0
        },
        {
          id: "bp-submission-deadline",
          aspect: "National Scholarship Portal (NSP) Renewal Deadline",
          failure_scenario: "Portal window closes; late submissions are completely locked out without appeal or grace periods.",
          criticality: "HIGH",
          description: "Exact cutoff date for student submission and subsequent Institute Verification Level 1.",
          weight: 1.0
        },
        {
          id: "bp-course-switch",
          aspect: "Rules on Changing Degree College or Subject Stream",
          failure_scenario: "Scholarship cancelled following transfer between colleges or course change without prior directorate sanction.",
          criticality: "LOW",
          description: "Procedures and restrictions if a student changes university, campus, or academic discipline.",
          weight: 0.3
        }
      ],
      sources: [
        {
          id: "src-official-guidelines",
          title: "Ministry of Education (MoE) - Official CSSS Scheme Guidelines (Revised)",
          url: "https://scholarships.gov.in/public/schemeGuidelines/CSSS_Guidelines_Revised.pdf",
          source_type: "official",
          published_date: "2024-07-15",
          authority_score: 0.98,
          raw_text: `CENTRAL SECTOR SCHEME OF SCHOLARSHIP FOR COLLEGE AND UNIVERSITY STUDENTS\n\n1. ELIGIBILITY CRITERIA:\nStudents must be above the 80th percentile of successful candidates in the relevant stream from a recognized Board of Examination in Class XII. The student must not be receiving any other scholarship from Central or State Government or any other private/public agency.\n\n2. INCOME CEILING:\nThe parental/family income ceiling for eligibility under the scheme is Rs. 4,50,000/- per annum for all categories. An authentic income certificate issued by the competent revenue authority must be uploaded annually.\n\n3. RENEWAL CONDITIONS:\nA scholarship once awarded shall continue across undergraduate and postgraduate study subject to the candidate securing at least 50% marks in the annual examination (or aggregate of both semesters in semester system) and maintaining not less than 75% attendance in the institution. Students with unresolved backlogs or punitive disciplinary action will not be eligible for renewal in that academic year.\n\n4. DISBURSEMENT AND DBT REQUIREMENT:\nDisbursement of scholarship amount (Rs. 12,000/- per annum for graduation; Rs. 20,000/- per annum for post-graduation) will be made directly through Direct Benefit Transfer (DBT) into the student's personal bank account. The bank account must be Aadhaar-seeded and active on the NPCI (National Payments Corporation of India) mapper. Accounts with joint status or only basic KYC will encounter payment bounce.\n\n5. APPLICATION TIMELINE:\nFor the current academic cycle, the National Scholarship Portal (NSP) deadline for student online renewal application submission is strictly October 31, 2024. Institutional verification closes on November 15, 2024. No offline or physical applications shall be entertained under any circumstance.`
        },
        {
          id: "src-aggregator-careers",
          title: "EduInfo Career Portal - National Scholarship Guide & Eligibility 2024",
          url: "https://eduinfo-careers-example.in/csss-scholarship-details",
          source_type: "aggregator",
          published_date: "2023-11-10",
          authority_score: 0.62,
          raw_text: `CSSS Scholarship Guide - Complete Overview, Income Criteria, and Last Date.\n\nAre you looking to renew or apply for the Central Sector Scholarship? Here are the key details:\n- Income Limit: According to older circulars, parental income was Rs. 8,00,000 per annum, but recent portal notifications suggest students up to Rs. 8 Lakh per annum can apply under EWS category.\n- Academic Requirements: For renewal, you need minimum 60% marks in your semester exams and good attendance conduct.\n- Important Dates: The last date to submit CSSS renewal on the national scholarship portal has been extended to December 31, 2024 according to state notifications.\n- Bank Details: Just provide your 16-digit bank account number and IFSC code of any nationalized bank during online form filling. Aadhaar card is optional for identity proof.`
        },
        {
          id: "src-student-blog-echo",
          title: "StudentSpot Today - How to Renew Central Sector Scholarship Online",
          url: "https://studentspot-today.org/posts/csss-renewal-guide",
          source_type: "forum",
          published_date: "2023-12-02",
          authority_score: 0.35,
          raw_text: `StudentSpot Today - How to Renew Central Sector Scholarship Online.\n\nAccording to older circulars, parental income was Rs. 8,00,000 per annum, but recent portal notifications suggest students up to Rs. 8 Lakh per annum can apply under EWS category. For renewal, you need minimum 60% marks in your semester exams and good attendance conduct. The last date to submit CSSS renewal on the national scholarship portal has been extended to December 31, 2024 according to state notifications. Always double check with your college clerk.`
        }
      ]
    };
  }
}

export async function generateBlueprint(goal: string, context: string = ""): Promise<BlueprintItem[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/blueprint/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, context })
    });
    if (!res.ok) throw new Error("Failed to generate blueprint from backend");
    const data = await res.json();
    return data.items;
  } catch (err) {
    console.warn("Using fallback blueprint generation:", err);
    const demo = await fetchDemoPack();
    return demo.blueprint;
  }
}

export async function fetchSourceUrl(url: string): Promise<SourceInput> {
  const res = await fetch(`${BACKEND_URL}/sources/fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });
  if (!res.ok) throw new Error("Failed to fetch source URL");
  return await res.json();
}

export async function runAnalysis(
  goal: string,
  blueprint: BlueprintItem[],
  sources: SourceInput[],
  verifiedChecklistIds: string[] = []
): Promise<AnalysisResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s network timeout

    const res = await fetch(`${BACKEND_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goal,
        blueprint,
        sources,
        verified_checklist_ids: verifiedChecklistIds
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Analysis failed (${res.status}): ${errText}`);
    }
    return await res.json();
  } catch (err: any) {
    console.warn("Backend analysis API unreachable or failed; using resilient client fallback engine:", err);
    return evaluateLocally(goal, blueprint, sources, verifiedChecklistIds);
  }
}

export async function markChecklistItem(
  checklistItemId: string,
  verified: boolean,
  notes?: string
): Promise<{ checklist_item_id: string; verified: boolean; notes?: string; message: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/verify/mark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checklist_item_id: checklistItemId,
        verified,
        notes
      })
    });
    if (!res.ok) throw new Error(`Mark verify HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.warn("Fallback local mark verify:", err);
    return {
      checklist_item_id: checklistItemId,
      verified,
      notes,
      message: verified ? "Locally marked as verified." : "Locally marked unverified."
    };
  }
}
