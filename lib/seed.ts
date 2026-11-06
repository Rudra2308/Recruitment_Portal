import { DEFAULT_SETTINGS } from "@/lib/defaults";
import type {
  ApplicationStatus,
  Department,
  FormField,
  FormOption,
  JobDetail,
  Position,
  Settings,
} from "@/lib/types";

const PLANT = "Hatkanangale, Kolhapur";
const CITY = "Kolhapur, Maharashtra";

function isoDate(offsetDays: number, now: Date): string {
  const date = new Date(now.getTime() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export const SEED_DEPARTMENTS: Omit<Department, "display_order">[] = [
  {
    id: "quality",
    name: "Quality",
    description:
      "Integrated management systems, inspection and assurance across foundry and machine shop operations.",
    active: true,
  },
  {
    id: "foundry",
    name: "Foundry",
    description:
      "Melting, moulding, process development and outsourcing for ferrous and machined castings.",
    active: true,
  },
  {
    id: "machine-shop",
    name: "Machine Shop",
    description:
      "CNC and VMC machining, production planning, programming and precision inspection.",
    active: true,
  },
  {
    id: "supply-chain",
    name: "Supply Chain",
    description:
      "Sourcing, procurement, planning and vendor development for a multi-unit engineering business.",
    active: true,
  },
  {
    id: "human-resources",
    name: "Human Resources",
    description:
      "People operations, administration, statutory compliance and industrial relations.",
    active: true,
  },
  {
    id: "marketing-sales",
    name: "Marketing & Sales",
    description:
      "Techno-commercial growth, customer relationships and market development with industrial OEMs.",
    active: true,
  },
  {
    id: "engineering-maintenance",
    name: "Engineering & Maintenance",
    description:
      "Electrical, electronics, PLC and plant engineering that keeps critical equipment running.",
    active: true,
  },
  {
    id: "information-technology",
    name: "Information Technology",
    description:
      "Business systems, software, integrations and the digital infrastructure behind the group.",
    active: true,
  },
  {
    id: "creative-digital",
    name: "Creative & Digital",
    description:
      "Brand, content, photography and digital operations that tell the story of what we make.",
    active: true,
  },
  {
    id: "trainee-programs",
    name: "Trainee & Early Careers",
    description:
      "Structured starts for graduates and technicians through rotation, mentorship and real projects.",
    active: true,
  },
];

interface JobSeed {
  id: string;
  title: string;
  department: string;
  location?: string;
  experience: string;
  qualification: string;
  description: string;
  responsibilities: string;
  requirements: string;
  deadlineDays: number | null;
}

const JOB_SEEDS: JobSeed[] = [
  {
    id: "qms-ims-representative-head",
    title: "QMS / IMS Representative Head",
    department: "Quality",
    experience: "10–15 years",
    qualification: "B.E. / B.Tech (Mechanical or Metallurgy); lead auditor certification preferred",
    description:
      "Own the integrated management system for the group and make sure quality, environment and safety processes are documented, audited and improved across plants. You will be the custodian of certifications and the primary interface for customer and third-party audits.",
    responsibilities:
      "Own QMS/IMS documentation, revision control and process mapping across plants.\nPlan and lead internal audits, and coordinate certification, customer and surveillance audits.\nDrive corrective and preventive actions with department heads, and verify effectiveness.\nMaintain quality KPIs, management review inputs and audit closure tracking.\nTrain process owners on standards, SOPs and documentation discipline.",
    requirements:
      "10–15 years in QMS/IMS roles within an automotive or engineering manufacturing environment.\nHands-on experience with ISO 9001 and IATF 16949; ISO 14001 / ISO 45001 exposure preferred.\nProven ownership of certification and customer audits end to end.\nStrong documentation, facilitation and cross-functional influencing skills.\nDegree in engineering; lead auditor certification is an advantage.",
    deadlineDays: 38,
  },
  {
    id: "supply-chain-management-head",
    title: "Supply Chain Management Head",
    department: "Supply Chain",
    experience: "12–18 years",
    qualification: "B.E. / B.Tech or MBA (Supply Chain / Operations)",
    description:
      "Lead sourcing, procurement and planning for a multi-unit engineering business, balancing cost, delivery and supplier quality. Build a supply base that can support foundry and machining growth without compromising reliability.",
    responsibilities:
      "Own the end-to-end supply chain: forecasting, sourcing, procurement, stores and logistics.\nBuild and develop a reliable vendor base for castings, forgings, consumables and bought-out parts.\nNegotiate commercial terms while protecting quality, delivery and cash flow.\nRun S&OP with sales, production and finance to align capacity and inventory.\nSet supplier scorecards and drive improvement on cost, OTIF and rejection.",
    requirements:
      "12–18 years in supply chain or procurement, with at least 5 years in a manufacturing leadership role.\nStrong exposure to castings, machining or automotive component supply chains.\nWorking knowledge of ERP planning and inventory control.\nProven vendor development and negotiation outcomes.\nDegree in engineering, operations or supply chain; MBA preferred.",
    deadlineDays: 52,
  },
  {
    id: "hr-administration-senior",
    title: "HR & Administration Senior",
    department: "Human Resources",
    location: CITY,
    experience: "6–10 years",
    qualification: "MBA / PGDM in HR or equivalent",
    description:
      "Own end-to-end people operations for plant and corporate teams, from hiring and onboarding to performance, compliance and engagement. You will be a hands-on partner to department heads and the custodian of HR records and statutory discipline.",
    responsibilities:
      "Run recruitment coordination, onboarding and confirmation processes for plant and office roles.\nMaintain attendance, payroll inputs, personnel files and statutory records.\nSupport performance reviews, goal setting and employee development plans.\nHandle employee queries and grievances with fairness and documentation.\nCoordinate administration, vendor management and plant-level employee engagement.",
    requirements:
      "6–10 years of generalist HR experience in a manufacturing environment.\nWorking knowledge of PF, ESIC, factory compliance and labour regulations.\nConfidence with HRMS, spreadsheets and documentation.\nClear written and spoken communication in Marathi, Hindi and English.\nMBA / PGDM in HR or an equivalent qualification.",
    deadlineDays: 27,
  },
  {
    id: "hr-junior",
    title: "HR Junior",
    department: "Human Resources",
    location: CITY,
    experience: "1–3 years",
    qualification: "MBA / PGDM in HR or equivalent",
    description:
      "Support day-to-day HR operations — recruitment coordination, onboarding, attendance, records and employee queries. A broad entry point into the employee lifecycle for someone who is organised and people-facing.",
    responsibilities:
      "Coordinate interview scheduling, candidate follow-ups and joining formalities.\nMaintain attendance, leave and personnel records accurately.\nPrepare HR reports, letters and statutory documentation.\nSupport onboarding, induction and engagement activities.\nRespond to routine employee queries and route concerns appropriately.",
    requirements:
      "1–3 years of HR or HR operations experience; manufacturing exposure is a plus.\nComfort with spreadsheets, HRMS and record keeping.\nHigh attention to detail and confidentiality.\nWarm, professional communication in Marathi, Hindi and English.\nMBA / PGDM in HR or equivalent.",
    deadlineDays: 33,
  },
  {
    id: "quality-head-foundry",
    title: "Quality Head – Foundry",
    department: "Quality",
    experience: "10–15 years",
    qualification: "B.E. / B.Tech (Metallurgy or Mechanical)",
    description:
      "Lead quality for the foundry business, from incoming metal and sand to final casting inspection and dispatch. Drive defect prevention, customer complaint closure and process capability across moulding, melting and finishing.",
    responsibilities:
      "Own foundry quality assurance and inspection across all shifts.\nAnalyse casting defects and drive root-cause elimination with process owners.\nHandle customer complaints, 8D reports and containment actions.\nMaintain process capability, metallurgical and sand testing discipline.\nLead customer audits and qualify new castings alongside development.",
    requirements:
      "10–15 years in foundry quality, including leadership responsibility.\nStrong understanding of sand casting defects, metallurgy and NDT.\nExperience with automotive or industrial OEM quality systems and PPAP.\nData-driven problem solving with 8D, why-why and Pareto methods.\nDegree in metallurgy or mechanical engineering.",
    deadlineDays: 19,
  },
  {
    id: "development-in-charge-foundry",
    title: "Development In-Charge – Foundry",
    department: "Foundry",
    experience: "7–12 years",
    qualification: "B.E. / B.Tech (Metallurgy or Mechanical)",
    description:
      "Own new product and process development for castings, from drawing review and feasibility to pattern, process validation and first-off approval. Translate customer requirements into stable, manufacturable processes.",
    responsibilities:
      "Review customer drawings and specifications, and prepare feasibility and process plans.\nCoordinate pattern making, tooling trials and first-off sample approval.\nValidate gating, risering and process parameters with the foundry team.\nPrepare PPAP documentation and support customer approvals.\nResolve development-stage defects and hand over stable processes to production.",
    requirements:
      "7–12 years in foundry development or process engineering.\nHands-on experience with pattern, gating and solidification-related problem solving.\nWorking knowledge of simulation tools and casting drawing standards.\nExperience with PPAP, control plans and customer qualification processes.\nDegree in metallurgy or mechanical engineering.",
    deadlineDays: 46,
  },
  {
    id: "foundry-outsourcing-executive",
    title: "Foundry Outsourcing Executive / In-Charge",
    department: "Foundry",
    experience: "4–8 years",
    qualification: "Diploma or B.E. in Mechanical / Metallurgy",
    description:
      "Develop and manage the external foundry supply base, tracking capacity, quality and delivery for outsourced castings. Coordinate closely with planning, quality and vendors to keep commitments on time.",
    responsibilities:
      "Identify and qualify external foundries for capacity and process capability.\nRelease schedules, track production and ensure on-time dispatch.\nCoordinate inspection, rejection containment and rework with vendors.\nMaintain vendor scorecards and drive improvement plans.\nResolve commercial and technical deviations with internal stakeholders.",
    requirements:
      "4–8 years in foundry production, outsourcing or vendor development.\nWorking understanding of casting processes and inspection requirements.\nComfort with schedules, reconciliation and vendor follow-up.\nWillingness to travel to vendor locations.\nDiploma or degree in mechanical or metallurgy engineering.",
    deadlineDays: 41,
  },
  {
    id: "marketing-executive-techno-commercial",
    title: "Marketing Executive – Techno-Commercial",
    department: "Marketing & Sales",
    location: CITY,
    experience: "5–9 years",
    qualification: "B.E. / B.Tech with commercial aptitude",
    description:
      "Grow business with OEM and industrial customers by combining technical understanding with commercial ownership. Prepare offers, manage enquiries and build long-term relationships from first contact to order.",
    responsibilities:
      "Develop new OEM and industrial accounts in target segments.\nReview enquiries, prepare costed offers and follow through to order.\nCoordinate feasibility, samples and approvals with engineering and quality.\nManage customer relationships, forecasts and commercial negotiations.\nTrack the pipeline, order intake and customer satisfaction metrics.",
    requirements:
      "5–9 years in techno-commercial sales for castings, machined parts or engineering components.\nAbility to read drawings and discuss technical requirements credibly.\nStrong proposal, negotiation and relationship-building skills.\nWillingness to travel to customer locations.\nEngineering degree with commercial aptitude.",
    deadlineDays: 35,
  },
  {
    id: "marketing-supervisor",
    title: "Marketing Supervisor",
    department: "Marketing & Sales",
    location: CITY,
    experience: "3–6 years",
    qualification: "Any graduate; technical background preferred",
    description:
      "Coordinate marketing execution and customer communication — enquiries, quotations, order follow-ups and reporting. Keep the commercial pipeline organised and responsive.",
    responsibilities:
      "Log and route enquiries, and maintain the opportunity pipeline.\nPrepare quotation drafts, comparison sheets and follow-up trackers.\nCoordinate sample dispatch, approvals and customer documentation.\nSupport order processing and communication with planning and dispatch.\nPrepare weekly and monthly sales reports.",
    requirements:
      "3–6 years in sales coordination, customer support or marketing in manufacturing.\nStrong spreadsheet and documentation skills.\nClear communication and disciplined follow-up.\nAbility to work across sales, planning and quality teams.\nAny graduate; technical or engineering background preferred.",
    deadlineDays: 58,
  },
  {
    id: "maintenance-in-charge-foundry",
    title: "Maintenance In-Charge – Foundry",
    department: "Foundry",
    experience: "8–12 years",
    qualification: "B.E. or Diploma in Mechanical / Electrical",
    description:
      "Lead mechanical and electrical maintenance for foundry equipment, improving uptime and reducing breakdowns through planned maintenance and root-cause discipline.",
    responsibilities:
      "Own preventive, predictive and breakdown maintenance for foundry equipment.\nPlan shutdowns, spares and manpower to protect production schedules.\nLead root-cause analysis for repeated failures and implement countermeasures.\nMaintain equipment history, checklists and statutory records.\nDevelop the maintenance team's diagnostic and safety capability.",
    requirements:
      "8–12 years in plant maintenance, with foundry or heavy engineering exposure.\nHands-on knowledge of moulding lines, sand plant, melting and utilities.\nExperience with preventive maintenance systems and spares planning.\nPractical understanding of hydraulics, pneumatics and electrical controls.\nDegree or diploma in mechanical or electrical engineering.",
    deadlineDays: 24,
  },
  {
    id: "maintenance-in-charge-machine-shop",
    title: "Maintenance In-Charge – Machine Shop",
    department: "Machine Shop",
    experience: "8–12 years",
    qualification: "B.E. or Diploma in Mechanical / Electrical",
    description:
      "Own maintenance for CNC, VMC and conventional machine shop equipment, including preventive schedules, spares and breakdown response.",
    responsibilities:
      "Lead maintenance for CNC, VMC and conventional machining equipment.\nBuild and execute preventive maintenance calendars with production.\nDiagnose mechanical, hydraulic and control faults and close them quickly.\nManage critical spares, service vendors and AMC contracts.\nTrack uptime, MTTR and repeat failures with corrective actions.",
    requirements:
      "8–12 years in machine tool maintenance, including CNC and VMC systems.\nWorking knowledge of Fanuc / Siemens controls and servo systems.\nExperience with spares planning, AMC management and shutdown execution.\nStrong troubleshooting discipline and team supervision.\nDegree or diploma in mechanical or electrical engineering.",
    deadlineDays: 43,
  },
  {
    id: "maintenance-supervisor-foundry",
    title: "Maintenance Supervisor – Foundry",
    department: "Foundry",
    experience: "4–7 years",
    qualification: "Diploma in Mechanical / Electrical",
    description:
      "Supervise shift maintenance for foundry equipment, handle breakdowns, and execute preventive maintenance plans with the maintenance team.",
    responsibilities:
      "Supervise shift technicians and respond to equipment breakdowns.\nExecute preventive maintenance checklists and record completion.\nDiagnose mechanical, hydraulic and basic electrical faults.\nCoordinate spares, tools and external service support.\nEnforce safety and housekeeping in maintenance work areas.",
    requirements:
      "4–7 years in maintenance supervision, preferably in a foundry.\nHands-on fault-finding in hydraulics, pneumatics and utilities.\nAbility to lead a shift team and prioritise breakdowns.\nWillingness to work rotational shifts.\nDiploma in mechanical or electrical engineering.",
    deadlineDays: 14,
  },
  {
    id: "electrical-electronics-plc-maintenance-engineer",
    title: "Electrical / Electronics / PLC Maintenance Engineer",
    department: "Engineering & Maintenance",
    experience: "4–8 years",
    qualification: "B.E. / B.Tech in Electrical, Electronics or Instrumentation",
    description:
      "Maintain and improve electrical, electronics and PLC systems across plant equipment, from fault diagnosis to control upgrades and documentation.",
    responsibilities:
      "Diagnose and repair electrical, electronics and PLC faults on plant equipment.\nMaintain PLC programs, HMI screens, drives and instrumentation.\nPlan preventive maintenance for panels, motors, drives and sensors.\nLead small control upgrades and energy-saving improvements.\nMaintain electrical drawings, backups and calibration records.",
    requirements:
      "4–8 years in electrical or controls maintenance in manufacturing.\nHands-on programming and troubleshooting with Siemens or Allen-Bradley PLCs.\nWorking knowledge of VFDs, servo drives, sensors and industrial networks.\nAbility to read electrical drawings and maintain documentation.\nDegree in electrical, electronics or instrumentation engineering.",
    deadlineDays: 29,
  },
  {
    id: "machine-shop-head",
    title: "Machine Shop Head",
    department: "Machine Shop",
    experience: "12–18 years",
    qualification: "B.E. / B.Tech (Mechanical or Production)",
    description:
      "Lead the machine shop as a delivery centre — production planning, machining operations, quality, maintenance and people. Build capability for precision components and on-time customer delivery.",
    responsibilities:
      "Own machine shop output, quality, cost and delivery performance.\nPlan capacity, schedules and manpower across CNC, VMC and conventional operations.\nDrive productivity, tool life and cycle-time improvement.\nPartner with quality and maintenance on capability and uptime.\nDevelop supervisors and technicians, and build a strong safety culture.",
    requirements:
      "12–18 years in machining operations, with at least 5 years in a leadership role.\nDeep knowledge of CNC turning, VMC machining, tooling and fixtures.\nExperience with precision component manufacturing and customer schedules.\nStrong planning, cost control and people leadership skills.\nDegree in mechanical or production engineering.",
    deadlineDays: 61,
  },
  {
    id: "machine-shop-outsourcing-development",
    title: "Machine Shop Outsourcing Development",
    department: "Machine Shop",
    experience: "5–9 years",
    qualification: "Diploma or B.E. in Mechanical / Production",
    description:
      "Identify, qualify and develop machining vendors for capacity and process needs. Own vendor performance on quality, cost and delivery while expanding the external machining network.",
    responsibilities:
      "Develop machining vendors for capacity, process capability and cost.\nEvaluate drawings, process plans and feasibility with vendors.\nCoordinate first-off approval, PPAP and quality handover.\nMonitor delivery, rejection and capacity, and drive corrective actions.\nNegotiate rates and maintain supplier agreements and scorecards.",
    requirements:
      "5–9 years in machining vendor development or outsourced manufacturing.\nAbility to assess machining processes, tooling and inspection capability.\nWorking knowledge of drawings, GD&T and process validation.\nStrong follow-up and negotiation skills.\nDiploma or degree in mechanical or production engineering.",
    deadlineDays: 49,
  },
  {
    id: "machine-shop-production-engineer",
    title: "Machine Shop Production Engineer",
    department: "Machine Shop",
    experience: "3–6 years",
    qualification: "B.E. / B.Tech (Mechanical or Production)",
    description:
      "Plan and control machining production on the shop floor, balancing schedules, machine capacity, tooling and manpower. Improve output and consistency through measurable process discipline.",
    responsibilities:
      "Prepare daily and weekly machining schedules against customer requirements.\nMonitor output, downtime, rejection and tool consumption.\nCoordinate with maintenance, quality and stores to remove constraints.\nDrive cycle-time, setup-time and first-pass-yield improvements.\nMaintain production reports and update ERP or planning sheets.",
    requirements:
      "3–6 years in machine shop production planning or shop-floor engineering.\nUnderstanding of CNC turning, VMC operations and tooling.\nComfort with production data, capacity planning and root-cause analysis.\nStrong coordination and shift-level ownership.\nDegree in mechanical or production engineering.",
    deadlineDays: 31,
  },
  {
    id: "quality-head-quality-assurance-machine-shop",
    title: "Quality Head & Quality Assurance – Machine Shop",
    department: "Quality",
    experience: "10–15 years",
    qualification: "B.E. / B.Tech (Mechanical or Production)",
    description:
      "Lead quality assurance for machined components, from inspection and GD&T to customer complaints and process audits. Ensure that first-time-right and measurement systems are dependable.",
    responsibilities:
      "Own incoming, in-process and final inspection for machined components.\nMaintain control plans, inspection standards and calibration systems.\nLead customer complaint investigations, 8D closure and containment.\nDrive process audits, capability studies and first-pass-yield improvement.\nDevelop the inspection team and measurement infrastructure.",
    requirements:
      "10–15 years in quality assurance for precision machining.\nStrong GD&T, CMM and measurement-system knowledge.\nExperience with automotive customer requirements, PPAP and 8D.\nAbility to lead audits and influence production teams.\nDegree in mechanical or production engineering.",
    deadlineDays: 21,
  },
  {
    id: "cnc-vmc-programmer",
    title: "CNC & VMC Programmer",
    department: "Machine Shop",
    experience: "4–8 years",
    qualification: "Diploma or B.E. in Mechanical / Production",
    description:
      "Program and prove out CNC turning and VMC jobs, optimise cycle times, and support the shop floor with reliable programs, tooling and fixtures.",
    responsibilities:
      "Write, prove out and optimise CNC turning and VMC programs.\nSelect tooling, fixtures and cutting parameters for stable production.\nReduce cycle times without compromising drawing requirements.\nTroubleshoot program and machining issues on the shop floor.\nMaintain program backups, setup sheets and revision records.",
    requirements:
      "4–8 years of hands-on CNC and VMC programming.\nStrong command of Fanuc and Siemens controls; G-code and macro experience.\nAbility to read complex drawings and apply GD&T.\nExperience with tooling selection, fixtures and cycle-time optimisation.\nDiploma or degree in mechanical or production engineering.",
    deadlineDays: 12,
  },
  {
    id: "machine-shop-outsourcing-inspector",
    title: "Machine Shop Outsourcing Inspector",
    department: "Machine Shop",
    experience: "4–7 years",
    qualification: "Diploma in Mechanical; GD&T and CMM experience",
    description:
      "Inspect outsourced machined parts against drawings and quality plans, and work with vendors on containment, correction and capability improvement.",
    responsibilities:
      "Inspect outsourced machined components against drawings and control plans.\nRecord measurements, prepare inspection reports and raise deviations.\nCoordinate containment, sorting and rework with vendors.\nSupport vendor process audits and capability improvement.\nMaintain calibration and inspection record discipline.",
    requirements:
      "4–7 years in machining inspection, including vendor or incoming quality.\nStrong drawing reading, GD&T and measuring instrument skills.\nCMM operation or programming exposure preferred.\nComfort with inspection reports and non-conformance processes.\nDiploma in mechanical engineering or equivalent.",
    deadlineDays: 36,
  },
  {
    id: "3d-cad-cam-works-designer",
    title: "3D CAD/CAM Works Designer",
    department: "Machine Shop",
    experience: "3–6 years",
    qualification: "Diploma or B.E. in Mechanical / Production; CAD/CAM certification",
    description:
      "Create 3D models, drawings, machining strategies and CAM programs for new and existing components. Support development and production with accurate, manufacturable digital definitions.",
    responsibilities:
      "Create 3D models and manufacturing drawings from customer inputs.\nGenerate CAM programs, toolpaths and setup documentation.\nSupport new product development with feasibility and process models.\nMaintain drawing, model and program revision control.\nWork with production to resolve manufacturability issues.",
    requirements:
      "3–6 years in CAD/CAM design for machined components.\nProficiency in SolidWorks or equivalent, and Mastercam or similar CAM software.\nStrong drawing standards, GD&T and tolerance analysis.\nUnderstanding of machining processes and fixturing.\nDiploma or degree in mechanical or production engineering.",
    deadlineDays: 44,
  },
  {
    id: "it-in-charge-software-engineer",
    title: "IT In-Charge / Software Engineer",
    department: "Information Technology",
    location: CITY,
    experience: "5–9 years",
    qualification: "B.E. / B.Tech (CSE / IT) or MCA",
    description:
      "Run the group's IT backbone and build practical internal software that removes manual work. You will balance day-to-day systems support with hands-on development of portals, integrations and reporting.",
    responsibilities:
      "Maintain networks, systems, email, backups and endpoint security across locations.\nBuild and maintain internal web applications and integrations.\nSupport ERP, attendance and reporting systems with vendors and users.\nAutomate repetitive workflows and improve data quality.\nDocument systems, access controls and recovery procedures.",
    requirements:
      "5–9 years across IT operations and software development.\nHands-on with TypeScript/JavaScript, SQL and a modern web framework.\nExperience with APIs, Google Workspace or Microsoft 365 administration.\nWorking knowledge of networking, backups and security hygiene.\nDegree in computer science, IT or MCA.",
    deadlineDays: 55,
  },
  {
    id: "graduate-trainee-technical-trainee",
    title: "Graduate Trainee / Technical Trainee",
    department: "Trainee & Early Careers",
    experience: "0–1 years",
    qualification: "B.E. / B.Tech / Diploma (Mechanical, Metallurgy, Electrical or Production)",
    description:
      "Start your career with structured exposure across production, quality, maintenance and planning. Trainees rotate through plant functions, work on real improvement projects and are mentored by department heads.",
    responsibilities:
      "Rotate through foundry, machine shop, quality, maintenance and planning.\nSupport daily production, inspection and documentation routines.\nComplete assigned improvement projects with measurable outcomes.\nLearn plant systems, safety practices and engineering standards.\nPresent learning and project outcomes at the end of each rotation.",
    requirements:
      "B.E. / B.Tech or Diploma in mechanical, metallurgy, electrical or production engineering.\n0–1 years of experience; final-year students may apply.\nWillingness to learn on the shop floor and work rotational shifts.\nBasic drawing reading and spreadsheet skills.\nStrong ownership, curiosity and communication.",
    deadlineDays: 68,
  },
  {
    id: "creative-media-digital-operations-intern",
    title: "Creative Media / Digital Operations Intern",
    department: "Creative & Digital",
    location: CITY,
    experience: "0–1 years",
    qualification: "Degree or diploma in design, media, communications, or a strong portfolio",
    description:
      "Support the group's digital presence — photography, video, social content, website updates and recruitment campaigns. A hands-on internship for someone who can turn industrial work into clear, compelling stories.",
    responsibilities:
      "Capture photo and video content across plant and office environments.\nCreate social, recruitment and brand content for digital channels.\nSupport website updates, campaign pages and basic analytics reporting.\nMaintain an organised content library and publishing calendar.\nCollaborate with HR and marketing on employer-brand campaigns.",
    requirements:
      "0–1 years of content, design or digital operations experience.\nWorking knowledge of Canva, Adobe tools or equivalent, and video editing.\nComfort shooting photos and short-form video in an industrial setting.\nClear writing and a good eye for detail.\nPortfolio or samples requested at interview.",
    deadlineDays: 17,
  },
];

export function buildSeedJobs(now = new Date()): Position[] {
  return JOB_SEEDS.map((seed, index) => ({
    id: seed.id,
    title: seed.title,
    department: seed.department,
    location: seed.location ?? PLANT,
    employment_type: "Full-time",
    experience: seed.experience,
    qualification: seed.qualification,
    description: seed.description,
    responsibilities: seed.responsibilities,
    requirements: seed.requirements,
    deadline: seed.deadlineDays === null ? "" : isoDate(seed.deadlineDays, now),
    status: "OPEN",
    display_order: (index + 1) * 10,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  }));
}

export function buildSeedDepartments(): Department[] {
  return SEED_DEPARTMENTS.map((department, index) => ({
    ...department,
    display_order: (index + 1) * 10,
  }));
}

const FORM_FIELDS: Array<Omit<FormField, "created_at" | "updated_at">> = [
  {
    id: "field-candidate-name",
    key: "candidate_name",
    label: "Full name",
    description: "As it appears on your government ID.",
    type: "text",
    required: true,
    visible: true,
    system_field: true,
    display_order: 10,
    active: true,
    section: "Personal",
  },
  {
    id: "field-email",
    key: "email",
    label: "Email address",
    description: "We will use this for all application updates.",
    type: "email",
    required: true,
    visible: true,
    system_field: true,
    display_order: 20,
    active: true,
    section: "Personal",
  },
  {
    id: "field-phone",
    key: "phone",
    label: "Phone number",
    description: "Include your country code if applying from outside India.",
    type: "phone",
    required: true,
    visible: true,
    system_field: true,
    display_order: 30,
    active: true,
    section: "Personal",
  },
  {
    id: "field-gender",
    key: "gender",
    label: "Gender",
    description: "Select your gender.",
    type: "select",
    required: true,
    visible: true,
    system_field: true,
    display_order: 35,
    active: true,
    section: "Personal",
  },
  {
    id: "field-location",
    key: "location",
    label: "Current location",
    description: "City and state.",
    type: "text",
    required: true,
    visible: true,
    system_field: true,
    display_order: 40,
    active: true,
    section: "Personal",
  },
  {
    id: "field-experience-type",
    key: "experience_type",
    label: "Total experience",
    description: "Select whether you are a Fresher or Experienced professional.",
    type: "select",
    required: true,
    visible: true,
    system_field: true,
    display_order: 50,
    active: true,
    section: "Professional",
  },
  {
    id: "field-qualification",
    key: "qualification",
    label: "Highest qualification",
    description: "Degree, diploma or certification (e.g. B.E. Mechanical, Diploma).",
    type: "text",
    required: true,
    visible: true,
    system_field: true,
    display_order: 60,
    active: true,
    section: "Professional",
  },
  {
    id: "field-experience-years",
    key: "experience_years",
    label: "Total years of experience",
    description: "Relevant industry experience (e.g. 3.5 years).",
    type: "text",
    required: true,
    visible: true,
    system_field: true,
    display_order: 70,
    active: true,
    section: "Professional",
  },
  {
    id: "field-current-employer",
    key: "current_employer",
    label: "Current organisation",
    description: "Your present or most recent organisation / company.",
    type: "text",
    required: true,
    visible: true,
    system_field: true,
    display_order: 80,
    active: true,
    section: "Professional",
  },
  {
    id: "field-current-ctc",
    key: "current_ctc",
    label: "Current salary (CTC drawn)",
    description: "Annual CTC (e.g. ₹ 4.5 LPA).",
    type: "text",
    required: true,
    visible: true,
    system_field: true,
    display_order: 90,
    active: true,
    section: "Professional",
  },
  {
    id: "field-current-gross",
    key: "current_gross",
    label: "Current gross salary drawn",
    description: "Monthly gross salary (e.g. ₹ 32,000 / month).",
    type: "text",
    required: true,
    visible: true,
    system_field: true,
    display_order: 100,
    active: true,
    section: "Professional",
  },
  {
    id: "field-expected-gross",
    key: "expected_gross",
    label: "Expected gross salary",
    description: "Monthly gross expectation (e.g. ₹ 40,000 / month).",
    type: "text",
    required: true,
    visible: true,
    system_field: true,
    display_order: 110,
    active: true,
    section: "Professional",
  },
  {
    id: "field-notice-period",
    key: "notice_period",
    label: "Notice period",
    description: "How soon you can join if selected.",
    type: "select",
    required: true,
    visible: true,
    system_field: true,
    display_order: 120,
    active: true,
    section: "Professional",
  },
  {
    id: "field-additional-info",
    key: "additional_info",
    label: "Additional information",
    description: "Optional notes on skills, certifications or machinery handled.",
    type: "textarea",
    required: false,
    visible: true,
    system_field: true,
    display_order: 130,
    active: true,
    section: "Documents",
  },
  {
    id: "field-cv",
    key: "cv",
    label: "Resume / CV",
    description: "PDF, DOC or DOCX up to 4 MB. Required for all applicants.",
    type: "file",
    required: true,
    visible: true,
    system_field: true,
    display_order: 140,
    active: true,
    section: "Documents",
  },
];

export function buildSeedFormFields(now = new Date()): FormField[] {
  return FORM_FIELDS.map((field) => ({
    ...field,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  }));
}

export function buildSeedFormOptions(): FormOption[] {
  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];

  const expTypeOptions = [
    { label: "Fresher", value: "fresher" },
    { label: "Experienced", value: "experienced" },
  ];

  const noticeOptions = [
    "Immediate",
    "15 Days",
    "30 Days",
    "45 Days",
    "60 Days",
    "90 Days",
  ];

  const options: FormOption[] = [];

  genderOptions.forEach((item, index) => {
    options.push({
      id: `option-gender-${index + 1}`,
      field_id: "field-gender",
      label: item.label,
      value: item.value,
      display_order: (index + 1) * 10,
      active: true,
    });
  });

  expTypeOptions.forEach((item, index) => {
    options.push({
      id: `option-exp-type-${index + 1}`,
      field_id: "field-experience-type",
      label: item.label,
      value: item.value,
      display_order: (index + 1) * 10,
      active: true,
    });
  });

  noticeOptions.forEach((label, index) => {
    options.push({
      id: `option-notice-${index + 1}`,
      field_id: "field-notice-period",
      label,
      value: label.toLowerCase().replace(/\s+/g, "-"),
      display_order: (index + 1) * 10,
      active: true,
    });
  });

  return options;
}

export function buildSeedStatuses(): ApplicationStatus[] {
  return [
    "NEW",
    "UNDER REVIEW",
    "SHORTLISTED",
    "INTERVIEW",
    "SELECTED",
    "REJECTED",
  ].map((name, index) => ({
    id: `status-${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    display_order: (index + 1) * 10,
    active: true,
  }));
}

const JOB_DETAIL_SEEDS: Record<string, Array<[string, string, string, JobDetail["type"]]>> = {
  "qms-ims-representative-head": [
    ["standards", "Standards", "ISO 9001, IATF 16949, ISO 14001", "text"],
    ["audits", "Audit ownership", "Certification, customer and internal audits", "text"],
    ["reports_to", "Reports to", "Managing Director", "text"],
  ],
  "supply-chain-management-head": [
    ["categories", "Categories", "Castings, forgings, consumables, bought-outs", "text"],
    ["erp", "Planning systems", "ERP-based planning and inventory control", "text"],
    ["reports_to", "Reports to", "Managing Director", "text"],
  ],
  "hr-administration-senior": [
    ["statutory", "Statutory scope", "PF, ESIC and factory compliance", "text"],
    ["reports_to", "Reports to", "HR Head", "text"],
  ],
  "hr-junior": [
    ["reports_to", "Reports to", "HR & Administration Senior", "text"],
    ["exposure", "Exposure", "Recruitment, onboarding, records and engagement", "text"],
  ],
  "quality-head-foundry": [
    ["process", "Process", "Sand casting — ferrous and machined castings", "text"],
    ["customers", "Customer segments", "Automotive and industrial OEMs", "text"],
    ["reports_to", "Reports to", "Group Quality Head", "text"],
  ],
  "development-in-charge-foundry": [
    ["software", "Design tools", "AutoCAD, SolidWorks and casting simulation", "text"],
    ["parts", "Product scope", "Ferrous castings for OEM applications", "text"],
  ],
  "foundry-outsourcing-executive": [
    ["vendors", "Vendor base", "External foundries and processing partners", "text"],
    ["travel", "Travel", "As required across the region", "text"],
  ],
  "marketing-executive-techno-commercial": [
    ["markets", "Markets", "Domestic OEM and industrial accounts", "text"],
    ["travel", "Travel", "As required for customer visits", "text"],
  ],
  "marketing-supervisor": [
    ["systems", "Systems", "ERP, quotation trackers and CRM", "text"],
    ["reports_to", "Reports to", "Marketing Lead", "text"],
  ],
  "maintenance-in-charge-foundry": [
    ["equipment", "Equipment", "Moulding line, sand plant, melting and utilities", "text"],
    ["shift", "Shift", "General with on-call breakdown support", "text"],
  ],
  "maintenance-in-charge-machine-shop": [
    ["equipment", "Equipment", "CNC, VMC and conventional machine tools", "text"],
    ["shift", "Shift", "General with on-call breakdown support", "text"],
  ],
  "maintenance-supervisor-foundry": [
    ["shift", "Shift", "Rotational shifts", "text"],
    ["equipment", "Equipment", "Foundry plant and utilities", "text"],
  ],
  "electrical-electronics-plc-maintenance-engineer": [
    ["systems", "Control systems", "Siemens and Allen-Bradley PLCs, VFDs and HMIs", "text"],
    ["shift", "Shift", "General with on-call breakdown support", "text"],
  ],
  "machine-shop-head": [
    ["machines", "Machine base", "CNC turning centres, VMC and conventional machines", "text"],
    ["reports_to", "Reports to", "Managing Director", "text"],
  ],
  "machine-shop-outsourcing-development": [
    ["categories", "Categories", "Machined components and assemblies", "text"],
    ["travel", "Travel", "As required for vendor visits", "text"],
  ],
  "machine-shop-production-engineer": [
    ["machines", "Machines", "CNC turning and VMC", "text"],
    ["shift", "Shift", "General / rotational as per schedule", "text"],
  ],
  "quality-head-quality-assurance-machine-shop": [
    ["standards", "Standards", "GD&T, CMM and PPAP", "text"],
    ["reports_to", "Reports to", "Group Quality Head", "text"],
  ],
  "cnc-vmc-programmer": [
    ["machines", "Machines", "CNC turning centres and VMC", "text"],
    ["controls", "Controls", "Fanuc, Siemens and Mazak", "text"],
    ["shift", "Shift", "Rotational shifts", "text"],
  ],
  "machine-shop-outsourcing-inspector": [
    ["instruments", "Instruments", "CMM, height gauge and micrometers", "text"],
    ["travel", "Travel", "As required for vendor inspection", "text"],
  ],
  "3d-cad-cam-works-designer": [
    ["software", "Software", "SolidWorks and Mastercam", "text"],
    ["reports_to", "Reports to", "Machine Shop Head", "text"],
  ],
  "it-in-charge-software-engineer": [
    ["stack", "Application stack", "Next.js, TypeScript and SQL", "text"],
    ["systems", "Business systems", "ERP, MES and Google Workspace", "text"],
    ["reports_to", "Reports to", "Managing Director", "text"],
  ],
  "graduate-trainee-technical-trainee": [
    ["program", "Programme", "12-month structured rotation", "text"],
    ["stipend", "Stipend", "As per company policy", "text"],
    ["reports_to", "Mentorship", "Department heads across plant functions", "text"],
  ],
  "creative-media-digital-operations-intern": [
    ["duration", "Duration", "6 months, extendable", "text"],
    ["portfolio", "Portfolio", "Samples requested at interview", "text"],
    ["reports_to", "Reports to", "Marketing & Digital Lead", "text"],
  ],
};

export function buildSeedJobDetails(now = new Date()): JobDetail[] {
  const jobs = buildSeedJobs(now);
  const details: JobDetail[] = [];

  for (const job of jobs) {
    const entries = JOB_DETAIL_SEEDS[job.id] ?? [];
    entries.forEach(([key, label, value, type], index) => {
      details.push({
        id: `detail-${job.id}-${key}`,
        position_id: job.id,
        key,
        label,
        value,
        type,
        visible: true,
        display_order: (index + 1) * 10,
        active: true,
      });
    });
  }

  return details;
}

export function buildSeedSettings(): Settings {
  return { ...DEFAULT_SETTINGS };
}

export const OPENING_COUNT = JOB_SEEDS.length;
