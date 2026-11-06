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
};

export const RECRUITMENT_STATUSES = ["OPEN", "PAUSED", "CLOSED"] as const;
