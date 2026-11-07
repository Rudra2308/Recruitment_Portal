import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Mail, Phone } from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import { getSettings } from "@/lib/data/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Application received",
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const settings = await getSettings();
  const reference = (ref ?? "").trim().slice(0, 40);
  const validReference = /^MG-\d{4}-[A-Z0-9]{4,12}$/.test(reference)
    ? reference
    : "";

  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#cce3d8] bg-[#f1f8f4]">
          <Check className="h-5 w-5 text-[#17694a]" />
        </div>

        <p className="eyebrow mt-7 text-brand">Application received</p>
        <h1 className="display mt-3 text-[38px] md:text-[52px]">
          Thank you. We have your application.
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted">
          Our recruitment team will review your details and contact you using the
          email or phone number you provided if your profile moves forward.
        </p>

        {validReference ? (
          <div className="mt-8 flex flex-col gap-4 border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                Your application reference
              </p>
              <p className="mt-1.5 font-mono text-[17px] font-semibold tracking-wide text-ink">
                {validReference}
              </p>
            </div>
            <CopyButton value={validReference} label="Copy reference" />
          </div>
        ) : null}

        <section className="mt-10 border-t border-line pt-7">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            What happens next
          </h2>
          <ol className="mt-5 space-y-5">
            {[
              {
                title: "Application review",
                text: "The recruitment team reviews your experience, qualification and CV against the role.",
              },
              {
                title: "Shortlisting",
                text: "Shortlisted candidates are contacted for a conversation or interview. This can take a little time.",
              },
              {
                title: "Keep your reference",
                text: "Quote your application reference if you write to us about this application.",
              },
            ].map((item, index) => (
              <li key={item.title} className="flex gap-4">
                <span className="mt-0.5 font-mono text-[11px] tabular-nums text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[13px] font-medium">{item.title}</p>
                  <p className="mt-1 text-[12px] leading-6 text-muted">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/jobs"
            prefetch={false}
            className="inline-flex min-h-11 items-center justify-center gap-2 bg-ink px-5 text-[13px] font-medium text-white transition-colors hover:bg-black"
          >
            Browse other roles
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            prefetch={false}
            className="inline-flex min-h-11 items-center justify-center border border-line px-5 text-[13px] font-medium transition-colors hover:border-ink"
          >
            Back to home
          </Link>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-[12px] text-muted sm:flex-row sm:items-center sm:gap-6">
          <a
            href={`mailto:${settings.contact_email}`}
            className="inline-flex items-center gap-2 transition-colors hover:text-ink"
          >
            <Mail className="h-3.5 w-3.5" />
            {settings.contact_email}
          </a>
          <a
            href={`tel:${settings.contact_phone.replace(/\s+/g, "")}`}
            className="inline-flex items-center gap-2 transition-colors hover:text-ink"
          >
            <Phone className="h-3.5 w-3.5" />
            {settings.contact_phone}
          </a>
        </div>
      </div>
    </div>
  );
}
