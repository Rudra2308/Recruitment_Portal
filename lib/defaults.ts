import type { Settings } from "@/lib/types";

export const DEFAULT_SETTINGS: Settings = {
  company_name: "Malati Group",
  contact_email: "hrandadmin@malatigroup.com",
  contact_phone: "+91 91 68 66 32 36",
  portal_location: "Hatkanangale, Kolhapur",
  recruitment_status: "OPEN",
  hero_heading: "Careers at Malati Group.",
  hero_subheading: "Explore current opportunities and apply online.",
  hero_support:
    "Work on real industrial problems with foundry, machining, quality and business teams that build for demanding customers.",
  hero_tag1: "No Account Required",
  hero_tag2: "Apply in 2 Minutes",
  positions_heading: "Open Positions",
  positions_subheading:
    "Select a role to view detailed responsibilities and submit your application.",
  departments_eyebrow: "Explore Functions",
  departments_heading: "Hiring Departments",
  departments_link_text: "View all departments",
  process_step1_title: "Find Your Position",
  process_step1_desc:
    "Explore roles across foundry, machining, quality, and administrative teams.",
  process_step2_title: "Quick Online Application",
  process_step2_desc:
    "Complete the short form on any phone or desktop and attach your CV.",
  process_step3_title: "Direct Review by HR",
  process_step3_desc:
    "Every submission goes straight to the Malati Group recruitment desk for interview scheduling.",
  contact_banner_title: "Questions about applying?",
  contact_banner_desc:
    "Contact our recruitment and HR team directly during working hours.",
};

export const RECRUITMENT_STATUSES = ["OPEN", "PAUSED", "CLOSED"] as const;
