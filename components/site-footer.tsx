import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

import { Wordmark } from "@/components/wordmark";
import type { Settings } from "@/lib/types";

export function SiteFooter({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="container-page py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Wordmark tone="light" size="lg" />
            <p className="mt-6 max-w-xs text-sm leading-6 text-white/60">
              Industrial Precision × Modern Engineering. A single place to
              explore open roles across Malati Group and apply online.
            </p>
            <div className="mt-7 flex items-center gap-2.5">
              <span className="h-1 w-6 rounded-full bg-brand" />
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">
                Recruitment portal · {year}
              </p>
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="eyebrow text-white/40">Explore</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  href="/jobs"
                  className="text-white/75 transition-colors hover:text-white"
                >
                  Open positions
                </Link>
              </li>
              <li>
                <Link
                  href="/departments"
                  className="text-white/75 transition-colors hover:text-white"
                >
                  Departments
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 text-white/40 transition-colors hover:text-white"
                >
                  Admin <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="eyebrow text-white/40">Contact</p>
            <ul className="mt-5 space-y-4 text-sm text-white/75">
              <li>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="flex items-start gap-3 transition-colors hover:text-white"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
                  <span>{settings.contact_email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${settings.contact_phone.replace(/\s+/g, "")}`}
                  className="flex items-start gap-3 transition-colors hover:text-white"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
                  <span>{settings.contact_phone}</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
                <span>{settings.portal_location}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-[11px] tracking-wide text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Malati Group. All rights reserved.</p>
          <p>Careers at Malati Group · {settings.portal_location}</p>
        </div>
      </div>
    </footer>
  );
}
