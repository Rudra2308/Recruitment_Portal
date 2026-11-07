import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Clock, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

import { CandidateJobsBrowser } from "@/components/candidate-jobs-browser";
import { DepartmentCard } from "@/components/department-card";
import { SectionHeading } from "@/components/section-heading";
import {
  getDepartmentJobCounts,
  getPublicPositions,
} from "@/lib/data/jobs";
import { getActiveDepartments } from "@/lib/data/departments";
import { getSettings, recruitmentStatusLabel } from "@/lib/data/settings";
import type { RecruitmentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<RecruitmentStatus, string> = {
  OPEN: "bg-[#1a7f4b]",
  PAUSED: "bg-[#b27a00]",
  CLOSED: "bg-brand",
};

export default async function HomePage() {
  const [settings, positions, departments, counts] = await Promise.all([
    getSettings(),
    getPublicPositions(),
    getActiveDepartments(),
    getDepartmentJobCounts(),
  ]);

  const isOpen = settings.recruitment_status === "OPEN";

  return (
    <>
      {/* Recruitment Status Notice (if paused or closed) */}
      {!isOpen ? (
        <div className="border-b border-[#ecdcb9] bg-[#fdf8ec]">
          <div className="container-page flex flex-col gap-1 py-3 text-[12px] text-[#6b4a00] sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-semibold">
                {recruitmentStatusLabel(settings.recruitment_status)}.
              </span>{" "}
              You can explore roles, but new applications are temporarily on hold.
            </p>
            <a href={`mailto:${settings.contact_email}`} className="font-medium underline">
              Contact the recruitment team
            </a>
          </div>
        </div>
      ) : null}

      {/* Main Hero Header */}
      <section className="relative overflow-hidden border-b border-line bg-white brand-pattern">
        <div className="container-page py-12 md:py-16 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2.5">
                <span className={cn("h-2 w-2 rounded-full", STATUS_STYLES[settings.recruitment_status])} />
                <p className="eyebrow text-brand text-[11px] font-semibold tracking-[0.18em]">
                  {isOpen ? "MALATI GROUP · NOW HIRING" : "MALATI GROUP · UPDATE"} · {settings.portal_location}
                </p>
              </div>

              <h1 className="display mt-4 text-[38px] text-ink sm:text-[48px] md:text-[56px] leading-[1.08] tracking-[-0.035em]">
                {settings.hero_heading}
              </h1>

              <p className="mt-5 text-[16px] leading-relaxed text-muted md:text-[18px]">
                {settings.hero_subheading}
              </p>

              {settings.hero_support ? (
                <p className="mt-3 text-[14px] leading-relaxed text-muted/80">
                  {settings.hero_support}
                </p>
              ) : null}

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#positions"
                  className="btn btn-primary min-h-[46px] px-6 text-[13px] font-semibold tracking-wide"
                >
                  View Open Positions
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/departments"
                  className="btn btn-outline min-h-[46px] px-5 text-[13px] font-semibold tracking-wide"
                >
                  Explore Departments
                </Link>
              </div>

              {/* Quick highlight points */}
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line/80 pt-6 text-[12.5px] text-muted">
                <span className="flex items-center gap-1.5 font-medium text-ink">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  {positions.length} Open Positions
                </span>
                <span className="flex items-center gap-1.5 font-medium text-ink">
                  <Building2 className="h-3.5 w-3.5 text-brand" />
                  {departments.length} Departments
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#17694a]" />
                  {settings.hero_tag1 || "No Account Required"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted" />
                  {settings.hero_tag2 || "Apply in 2 Minutes"}
                </span>
              </div>
            </div>

            {/* Industrial Precision Graphic Card */}
            <div className="hidden lg:col-span-5 lg:block">
              <div className="relative mx-auto max-w-[420px]">
                <div className="absolute -top-3 -right-3 h-24 w-24 border-t-2 border-r-2 border-brand/40 pointer-events-none" />
                <div className="overflow-hidden rounded-[12px] border border-line bg-surface shadow-lg">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink">
                    <img
                      src="/careers/brand/industrial-precision.webp"
                      alt="Malati Group Precision Engineering"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="eyebrow text-white/90 tracking-[0.2em] text-[10px]">
                        Industrial Precision × Foundry
                      </span>
                      <p className="mt-1 text-[15px] font-semibold text-white">
                        Engineered for High-Duty Performance
                      </p>
                    </div>
                  </div>
                  <div className="p-5 bg-white">
                    <div className="flex items-center justify-between text-[11px] text-muted uppercase tracking-[0.14em]">
                      <span>Direct HR Review</span>
                      <span className="font-semibold text-brand">Zero Friction</span>
                    </div>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                      Join an established engineering & manufacturing team with direct access to career advancement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Open Positions & Instant Filters */}
      <section id="positions" className="container-page py-10 md:py-14">
        <div className="mb-6">
          <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-ink md:text-[28px]">
            {settings.positions_heading || "Open Positions"}
          </h2>
          <p className="mt-1 text-[13px] text-muted">
            {settings.positions_subheading ||
              "Select a role to view detailed responsibilities and submit your application."}
          </p>
        </div>

        <CandidateJobsBrowser positions={positions} departments={departments} />
      </section>

      {/* Explore by Department */}
      <section className="border-t border-line bg-surface/30">
        <div className="container-page py-12 md:py-16">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <p className="eyebrow text-muted">
                {settings.departments_eyebrow || "Explore Functions"}
              </p>
              <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-ink md:text-[26px]">
                {settings.departments_heading || "Hiring Departments"}
              </h2>
            </div>
            <Link
              href="/departments"
              className="text-[13px] font-medium text-brand hover:underline inline-flex items-center gap-1"
            >
              {settings.departments_link_text || "View all departments"} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {departments.slice(0, 6).map((department, index) => (
              <DepartmentCard
                key={department.id}
                department={department}
                index={index + 1}
                openCount={counts[department.id]?.open ?? 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Fast 3-Step Process */}
      <section className="border-t border-line bg-surface/50">
        <div className="container-page py-12 md:py-16">
          <div className="mb-8">
            <p className="eyebrow text-brand">Zero-Friction Recruitment</p>
            <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-ink md:text-[26px]">
              How Candidates Apply
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[10px] border border-line bg-white p-6 shadow-xs">
              <span className="font-mono text-[20px] font-bold text-brand">
                01
              </span>
              <h3 className="mt-3 text-[15px] font-semibold text-ink">
                {settings.process_step1_title || "Find Your Position"}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {settings.process_step1_desc ||
                  "Explore roles across foundry, machining, quality, and administrative teams."}
              </p>
            </div>

            <div className="rounded-[10px] border border-line bg-white p-6 shadow-xs">
              <span className="font-mono text-[20px] font-bold text-brand">
                02
              </span>
              <h3 className="mt-3 text-[15px] font-semibold text-ink">
                {settings.process_step2_title || "Quick Online Application"}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {settings.process_step2_desc ||
                  "Complete the short form on any phone or desktop and attach your CV."}
              </p>
            </div>

            <div className="rounded-[10px] border border-line bg-white p-6 shadow-xs">
              <span className="font-mono text-[20px] font-bold text-brand">
                03
              </span>
              <h3 className="mt-3 text-[15px] font-semibold text-ink">
                {settings.process_step3_title || "Direct Review by HR"}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {settings.process_step3_desc ||
                  "Every submission goes straight to the Malati Group recruitment desk for interview scheduling."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recruitment Contact Strip */}
      <section className="border-t border-line bg-surface">
        <div className="container-page flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between text-[13px]">
          <div>
            <p className="font-semibold text-ink">
              {settings.contact_banner_title || "Questions about applying?"}
            </p>
            <p className="text-muted">
              {settings.contact_banner_desc ||
                "Contact our recruitment and HR team directly during working hours."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <a
              href={`mailto:${settings.contact_email}`}
              className="inline-flex items-center gap-1.5 font-medium text-ink transition-colors hover:text-brand"
            >
              <Mail className="h-4 w-4 text-brand" />
              {settings.contact_email}
            </a>
            <a
              href={`tel:${settings.contact_phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-1.5 font-medium text-ink transition-colors hover:text-brand"
            >
              <Phone className="h-4 w-4 text-brand" />
              {settings.contact_phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
