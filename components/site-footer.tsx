import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

import { Wordmark } from "@/components/wordmark";
import type { Settings } from "@/lib/types";

export function SiteFooter({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line bg-surface text-ink">
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Wordmark size="lg" />
            <p className="mt-5 max-w-xs text-[13.5px] leading-6 text-muted">
              Industrial Precision × Modern Engineering. A single place to
              explore open roles across Malati Group and apply online.
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              <span className="h-1 w-6 rounded-full bg-brand" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                Recruitment portal · {year}
              </p>
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="eyebrow text-brand">Explore</p>
            <ul className="mt-4 space-y-2.5 text-[13.5px]">
              <li>
                <Link
                  href="/jobs"
                  className="text-muted transition-colors hover:text-brand"
                >
                  Open positions
                </Link>
              </li>
              <li>
                <Link
                  href="/departments"
                  className="text-muted transition-colors hover:text-brand"
                >
                  Departments
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  prefetch={false}
                  className="inline-flex items-center gap-1 text-muted transition-colors hover:text-brand"
                >
                  Admin <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="eyebrow text-brand">Contact</p>
            <ul className="mt-4 space-y-3 text-[13.5px] text-muted">
              <li>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="flex items-start gap-2.5 transition-colors hover:text-brand"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span className="text-ink">{settings.contact_email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${settings.contact_phone.replace(/\s+/g, "")}`}
                  className="flex items-start gap-2.5 transition-colors hover:text-brand"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span className="text-ink">{settings.contact_phone}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span className="text-ink">{settings.portal_location}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-line/80 bg-white/70">
        <div className="container-page flex flex-col gap-2 py-4 text-[11px] tracking-wide text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Malati Group. All rights reserved.</p>
          <p>Careers at Malati Group · {settings.portal_location}</p>
        </div>
      </div>
    </footer>
  );
}
