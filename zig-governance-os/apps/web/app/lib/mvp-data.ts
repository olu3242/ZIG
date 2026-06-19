export interface LearningPath {
  id: string;
  title: string;
  track: string;
  level: string;
  description: string;
  progress: number;
}

export interface LearningModule {
  id: string;
  pathId: string;
  title: string;
  objective: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  duration: number;
  outcome: string;
  objectives: string[];
  takeaways: string[];
  knowledgeCheck: string;
  reflection: string;
  completionCriteria: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  framework: string;
  domain: string;
  skill: string;
  careerAlignment: string;
}

export interface Lab {
  id: string;
  title: string;
  scenario: string;
  tasks: string[];
  deliverables: string[];
  rubric: string[];
  score: number;
}

export interface MvpRisk {
  id: string;
  title: string;
  owner: string;
  likelihood: number;
  impact: number;
  treatment: "Mitigate" | "Transfer" | "Accept" | "Avoid";
  status: "Open" | "In Treatment" | "Accepted" | "Closed";
}

export interface EvidenceTemplate {
  id: string;
  title: string;
  type: string;
  framework: string;
  control: string;
  status: "Current" | "Pending Review" | "Missing";
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  inherentRisk: "Low" | "Medium" | "High";
  assessmentStatus: "Not Started" | "In Progress" | "Complete";
  rating: number;
}

export interface Assessment {
  id: string;
  title: string;
  type: "Multiple Choice" | "Multi-Select" | "Scenario";
  framework: string;
  passingScore: number;
  score: number;
}

const learningPathSeeds: Array<[string, string, string, string, string, number]> = [
  ["iso-foundations", "ISO 27001 Foundations", "Analyst", "Beginner", "Build a working understanding of ISMS scope, clauses, Annex A controls, and audit evidence.", 40],
  ["soc2-practitioner", "SOC 2 Practitioner", "Consultant", "Intermediate", "Prepare a Trust Services Criteria readiness review and evidence request plan.", 25],
  ["nist-csf-governance", "NIST CSF 2.0 Governance", "Manager", "Intermediate", "Map governance outcomes to cyber risk management and executive reporting.", 35],
  ["risk-register-builder", "Risk Register Builder", "Analyst", "Beginner", "Identify, score, treat, and monitor operational GRC risks.", 55],
  ["vendor-risk-essentials", "Vendor Risk Essentials", "Consultant", "Intermediate", "Run a third-party assessment from intake through residual risk decision.", 20],
  ["evidence-operations", "Evidence Operations", "Analyst", "Beginner", "Collect, classify, review, and maintain audit-ready evidence.", 60],
  ["internal-audit-ready", "Internal Audit Ready", "Auditor", "Intermediate", "Plan interviews, test controls, document findings, and write audit-ready workpapers.", 30],
  ["hipaa-security", "HIPAA Security Rule", "Practitioner", "Intermediate", "Translate HIPAA safeguards into controls, policies, and evidence.", 15],
  ["pci-readiness", "PCI DSS Readiness", "Manager", "Advanced", "Scope cardholder data environments and prepare PCI evidence packs.", 10],
  ["career-grc-analyst", "GRC Analyst Career Launch", "Analyst", "Beginner", "Turn projects, labs, and certifications into a job-ready GRC portfolio.", 45],
];

export const learningPaths: LearningPath[] = learningPathSeeds.map(([id, title, track, level, description, progress]) => ({ id, title, track, level, description, progress }));

export const learningModules: LearningModule[] = learningPaths.flatMap((path) =>
  ["Context", "Control Practice", "Evidence & Reporting"].map((suffix, moduleIndex) => ({
    id: `${path.id}-module-${moduleIndex + 1}`,
    pathId: path.id,
    title: `${path.title}: ${suffix}`,
    objective: [
      "Explain the business and regulatory context before selecting a control response.",
      "Apply GRC methods to a realistic operating scenario.",
      "Produce evidence, notes, and next actions that a manager could review.",
    ][moduleIndex],
  })),
);

export const lessons: Lesson[] = learningModules.flatMap((module, moduleIndex) =>
  Array.from({ length: moduleIndex < 20 ? 2 : 1 }, (_, lessonIndex) => ({
    id: `${module.id}-lesson-${lessonIndex + 1}`,
    moduleId: module.id,
    title: [
      "Define scope and stakeholders",
      "Map obligations to controls",
      "Interview owners and collect facts",
      "Score readiness and identify gaps",
      "Create the workpaper and next-action plan",
    ][(moduleIndex + lessonIndex) % 5],
    duration: 12 + ((moduleIndex + lessonIndex) % 4) * 6,
    outcome: [
      "Draft a scope statement with assets, systems, roles, and assumptions.",
      "Build a control-to-requirement map with clear rationale.",
      "Capture interview notes that support a defensible finding.",
      "Translate evidence quality into a readiness score.",
      "Write a concise remediation action with owner and due date.",
    ][(moduleIndex + lessonIndex) % 5],
    objectives: ["Identify the control objective", "Apply the framework requirement", "Produce an audit-ready work product"],
    takeaways: ["Good GRC work is evidence-backed", "Context determines control depth", "Clear ownership turns findings into action"],
    knowledgeCheck: "Which evidence would best support the control assertion in this scenario?",
    reflection: "What would make this workpaper defensible during an audit interview?",
    completionCriteria: "Submit a concise workpaper with scope, evidence, finding, and next action.",
    difficulty: ["Beginner", "Intermediate", "Advanced"][moduleIndex % 3] as Lesson["difficulty"],
    framework: ["ISO 27001", "SOC 2", "NIST CSF", "HIPAA", "PCI DSS"][moduleIndex % 5],
    domain: ["Governance", "Risk", "Controls", "Evidence", "Audit"][moduleIndex % 5],
    skill: ["Control Mapping", "Risk Assessment", "Evidence Review", "Audit Interviewing", "Executive Reporting"][moduleIndex % 5],
    careerAlignment: ["GRC Analyst", "Security Analyst", "Internal Auditor", "Compliance Specialist", "Vendor Risk Analyst"][moduleIndex % 5],
  })),
).slice(0, 50);

const labSeeds: Array<[string, string, string, number]> = [
  ["iso-internal-audit", "ISO Internal Audit", "A SaaS company needs an internal audit of access control and risk treatment before certification.", 86],
  ["soc-readiness", "SOC Readiness Review", "A startup needs a gap review across Security, Availability, and Confidentiality criteria.", 78],
  ["vendor-risk-assessment", "Vendor Risk Assessment", "A business owner wants to onboard a payroll platform with sensitive employee data.", 74],
  ["risk-register-workshop", "Risk Register Workshop", "Leadership needs a prioritized risk register for cloud operations and identity management.", 82],
  ["evidence-collection", "Evidence Collection Exercise", "Audit evidence is scattered across tickets, policies, screenshots, and access exports.", 88],
  ["policy-review", "Policy Review Sprint", "Security policies must be reviewed for ownership, approval, scope, and exception handling.", 72],
  ["hipaa-safeguards", "HIPAA Safeguards Lab", "A health-tech product team needs safeguards mapped to operational controls.", 70],
  ["pci-scope", "PCI Scope Mapping", "A payments workflow must be scoped and segmented before a readiness assessment.", 68],
  ["finding-remediation", "Audit Finding Remediation", "An auditor found weak access reviews and expects a management response.", 80],
  ["board-briefing", "Executive Board Briefing", "The executive team needs a one-page risk and compliance readiness narrative.", 90],
];

export const labs: Lab[] = labSeeds.map(([id, title, scenario, score]) => ({
  id,
  title,
  scenario,
  score,
  tasks: ["Read the scenario brief", "Identify stakeholders and controls", "Produce the required workpaper", "Submit evidence and remediation notes"],
  deliverables: ["Control map", "Evidence request list", "Risk or finding summary", "Executive-ready recommendation"],
  rubric: ["Accuracy of framework mapping", "Evidence quality", "Risk reasoning", "Clarity of next actions"],
}));

const assessmentSeeds: Array<[string, string, Assessment["type"], string, number, number]> = [
  ["iso-readiness", "ISO 27001 Readiness Quiz", "Multiple Choice", "ISO 27001", 80, 86],
  ["soc2-scenario", "SOC 2 Evidence Scenario", "Scenario", "SOC 2", 80, 78],
  ["risk-treatment", "Risk Treatment Assessment", "Multi-Select", "NIST CSF", 75, 82],
  ["vendor-review", "Vendor Review Exam", "Scenario", "ISO 27001", 75, 88],
  ["career-foundations", "GRC Career Foundations", "Multiple Choice", "Career", 70, 91],
];

export const assessments: Assessment[] = assessmentSeeds.map(([id, title, type, framework, passingScore, score]) => ({
  id,
  title,
  type,
  framework,
  passingScore,
  score,
}));

export const risks: MvpRisk[] = Array.from({ length: 25 }, (_, index) => {
  const names = [
    "Privileged access review delays",
    "Incomplete vendor security review",
    "Cloud storage misconfiguration",
    "Policy exception without approval",
    "Evidence expires before audit window",
  ];
  const likelihood = (index % 5) + 1;
  const impact = ((index + 2) % 5) + 1;
  return {
    id: `risk-${index + 1}`,
    title: names[index % names.length],
    owner: ["Risk Manager", "Compliance Manager", "IT Owner", "Vendor Manager", "Control Owner"][index % 5],
    likelihood,
    impact,
    treatment: ["Mitigate", "Transfer", "Accept", "Avoid"][index % 4] as MvpRisk["treatment"],
    status: ["Open", "In Treatment", "Accepted", "Closed"][index % 4] as MvpRisk["status"],
  };
});

export const evidenceTemplates: EvidenceTemplate[] = [
  "Information Security Policy",
  "Access Review Export",
  "Risk Assessment",
  "Audit Report",
  "Vendor Review",
  "Training Record",
  "Incident Response Test",
  "Business Continuity Test",
  "Change Management Sample",
  "Encryption Standard",
  "Asset Inventory",
  "Vulnerability Scan",
  "Backup Restoration Evidence",
  "Board Risk Summary",
  "Data Retention Procedure",
  "Exception Approval",
  "Control Test Workpaper",
  "Security Awareness Completion",
  "Logging Configuration",
  "Third-Party Contract Review",
].map((title, index) => ({
  id: `evidence-${index + 1}`,
  title,
  type: ["Policy", "Procedure", "Risk Assessment", "Audit Report", "Vendor Review", "Training Record"][index % 6],
  framework: ["ISO 27001", "SOC 2", "NIST CSF", "HIPAA", "PCI DSS"][index % 5],
  control: ["Access Control", "Risk Management", "Vendor Management", "Awareness", "Incident Response"][index % 5],
  status: ["Current", "Pending Review", "Missing"][index % 3] as EvidenceTemplate["status"],
}));

export const vendors: Vendor[] = [
  "Microsoft", "Google", "AWS", "Okta", "CrowdStrike", "Salesforce", "Slack", "GitHub", "Vercel", "Stripe",
  "Workday", "ServiceNow", "Atlassian", "Datadog", "Snowflake", "Zoom", "DocuSign", "Box", "Cloudflare", "HubSpot",
].map((name, index) => ({
  id: name.toLowerCase().replaceAll(" ", "-"),
  name,
  category: ["Cloud", "Identity", "Security", "CRM", "Developer", "Finance"][index % 6],
  inherentRisk: ["Low", "Medium", "High"][index % 3] as Vendor["inherentRisk"],
  assessmentStatus: ["Not Started", "In Progress", "Complete"][index % 3] as Vendor["assessmentStatus"],
  rating: 60 + ((index * 7) % 36),
}));

export const aiCoaches = [
  { id: "zig-coach", name: "ZIG Coach", focus: "General GRC workflow guidance and next best action planning." },
  { id: "audit-coach", name: "Audit Coach", focus: "Audit planning, evidence quality, findings, and management responses." },
  { id: "risk-coach", name: "Risk Coach", focus: "Risk identification, scoring, treatment, and residual-risk decisions." },
  { id: "compliance-coach", name: "Compliance Coach", focus: "Framework interpretation, control mapping, and policy alignment." },
  { id: "career-coach", name: "Career Coach", focus: "Portfolio, certification, interview, and career progression guidance." },
];

export const badges = ["ISO Explorer", "SOC Analyst", "Risk Specialist", "Vendor Reviewer", "Audit Apprentice"];
export const achievements = ["First Audit", "First Risk Register", "Vendor Reviewer", "Control Mapper", "Evidence Expert"];
export const portfolioArtifacts = ["Risk Register", "Audit Report", "Control Assessment", "Vendor Assessment", "Gap Analysis", "Policy Review"];
export const scenarioCompanies = ["CloudCorp", "FinBank", "MediCare Health", "GovSecure", "RetailOne"];
export const frameworkMappings = [
  { source: "ISO 27001 A.5.1", soc2: "SOC 2 CC1.1", nist: "NIST CSF GV.OC", coverage: "Governance policy and accountability" },
  { source: "ISO 27001 A.5.15", soc2: "SOC 2 CC6.1", nist: "NIST CSF PR.AA", coverage: "Access control and identity assurance" },
  { source: "ISO 27001 A.8.8", soc2: "SOC 2 CC7.1", nist: "NIST CSF DE.CM", coverage: "Vulnerability and monitoring controls" },
  { source: "ISO 27001 A.5.19", soc2: "SOC 2 CC9.2", nist: "NIST CSF GV.SC", coverage: "Supplier and third-party risk" },
];

export const careerTracks = ["Analyst", "Consultant", "Manager", "Director", "vCISO"];
export const careerJourneyRoles = ["GRC Analyst", "Security Analyst", "Internal Auditor", "Compliance Specialist", "Risk Manager", "Vendor Risk Analyst", "vCISO"];
export const careerLevels = Array.from({ length: 10 }, (_, index) => `Level ${index + 1}: ${["Foundation", "Operator", "Practitioner", "Lead", "Strategist"][index % 5]}`);
export const certifications = ["ISO 27001 Foundation", "ISO 27001 Lead Implementer", "ISO 27001 Lead Auditor", "SOC 2 Practitioner", "NIST CSF Practitioner", "CISA", "CRISC", "CISM", "CISSP", "Security+", "CySA+"];

export function scoreRisk(risk: MvpRisk) {
  return risk.likelihood * risk.impact;
}

export function vendorScores(vendor: Vendor) {
  const security = Math.min(100, vendor.rating + (vendor.inherentRisk === "Low" ? 8 : vendor.inherentRisk === "Medium" ? 0 : -8));
  const privacy = Math.min(100, vendor.rating + (vendor.category === "Identity" ? 4 : 0));
  const compliance = Math.min(100, vendor.rating + (vendor.assessmentStatus === "Complete" ? 6 : -4));
  const overall = Math.round((security + privacy + compliance) / 3);
  return {
    security,
    privacy,
    compliance,
    overall,
    decision: overall >= 80 ? "Approved" : overall >= 65 ? "Conditional" : "Rejected",
  };
}

export function zigScore() {
  const learning = Math.round(learningPaths.reduce((sum, path) => sum + path.progress, 0) / learningPaths.length);
  const lab = Math.round(labs.reduce((sum, item) => sum + item.score, 0) / labs.length);
  const assessment = Math.round(assessments.reduce((sum, item) => sum + item.score, 0) / assessments.length);
  const portfolio = 82;
  const certification = 76;
  return Math.round(learning * 0.25 + lab * 0.25 + assessment * 0.2 + portfolio * 0.15 + certification * 0.15);
}
