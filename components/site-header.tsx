import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MobileNav } from "@/components/mobile-nav";
import { Wordmark } from "@/components/wordmark";
import { recruitmentStatusLabel } from "@/lib/data/settings";
import type { Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

function statusTone(status: Settings["recruitment_status"]) {
  switch (status) {
    case "OPEN":
      return "bg-[#1a7f4b]";
    case "PAUSED":
      return "bg-[#b27a00]";
    default:
      return "bg-brand";
  }
}

export function SiteHeader({ settings }: { settings: Settings }) {
  const isOpen = settings.recruitment_status === "OPEN";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-sm">
      <div className="container-page flex h-[74px] items-center justify-between gap-6">
        <Wordmark />

        <nav className="hidden items-center gap-8 text-[13px] font-medium md:flex">
          <Link
            href="/jobs"
            className="text-ink transition-colors hover:text-brand"
          >
            Open positions
          </Link>
          <Link
            href="/departments"
            className="text-ink transition-colors hover:text-brand"
          >
            Departments
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 text-[11px] text-muted lg:flex">
            <span
              className={cn("h-1.5 w-1.5 rounded-full", statusTone(settings.recruitment_status))}
            />
            {recruitmentStatusLabel(settings.recruitment_status)}
          </span>
          <Link
            href="/jobs"
            className={cn(
              "hidden min-h-11 items-center gap-2 px-5 text-[13px] font-medium sm:inline-flex",
              isOpen
                ? "bg-brand text-white transition-colors hover:bg-brand-dark"
                : "border border-line text-ink transition-colors hover:border-ink",
            )}
          >
            {isOpen ? "View open roles" : "View positions"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <MobileNav isOpen={isOpen} />
        </div>
      </div>
    </header>
  );
}
