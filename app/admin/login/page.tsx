import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";

import { LoginForm } from "@/components/admin/login-form";
import { Wordmark } from "@/components/wordmark";
import { getSession, safeNextPath } from "@/lib/auth";
import { isUsingDevAdminCredentials } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/admin");

  const params = await searchParams;
  const next = safeNextPath(params.next ?? null);
  const devHint = isUsingDevAdminCredentials();

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-white lg:flex xl:p-14">
        <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
        <div className="absolute -right-24 top-1/3 h-[360px] w-[360px] rounded-full border border-white/10" />
        <div className="absolute -right-10 top-1/3 h-[220px] w-[220px] rounded-full border border-white/10" />

        <Wordmark tone="light" />

        <div className="relative max-w-lg">
          <p className="eyebrow text-white/45">Recruitment administration</p>
          <h1 className="mt-5 text-[42px] font-semibold leading-[1.08] tracking-[-0.035em] xl:text-[52px]">
            One place to run recruitment.
          </h1>
          <p className="mt-5 max-w-md text-[14px] leading-7 text-white/55">
            Manage positions, review applications, configure the form and keep
            every candidate record in one auditable system.
          </p>

          <ul className="mt-9 space-y-3 text-[13px] text-white/65">
            {[
              "Job and department management",
              "Configurable application forms",
              "Secure CV access and audit history",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center border border-white/15">
                  <Check className="h-3 w-3 text-white/70" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[10px] uppercase tracking-[0.16em] text-white/30">
          Malati Group · Recruitment Portal V4
        </p>
      </section>

      <section className="flex flex-col bg-white">
        <div className="flex h-16 items-center justify-between border-b border-line px-5 lg:hidden">
          <Wordmark />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[380px]">
            <p className="eyebrow text-brand">Admin access</p>
            <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.03em]">
              Sign in.
            </h2>
            <p className="mt-2 text-[13px] leading-6 text-muted">
              Use the administrator credentials provided by Malati Group.
            </p>

            {devHint ? (
              <div className="mt-5 border border-[#ecdcb9] bg-[#fdf8ec] px-4 py-3 text-[11px] leading-5 text-[#6b4a00]">
                <strong className="font-semibold">Local development:</strong> sign in
                with <span className="font-mono">admin@malatigroup.com</span> and{" "}
                <span className="font-mono">Admin@123</span>. Configure{" "}
                <span className="font-mono">ADMIN_PASSWORD_HASH</span> before deploying.
              </div>
            ) : null}

            <LoginForm next={next} defaultEmail={devHint ? "admin@malatigroup.com" : undefined} />

            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 text-[11px] text-muted transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to careers site
            </Link>
          </div>
        </div>

        <div className="border-t border-line px-5 py-4 text-[10px] text-muted sm:px-8">
          Protected by JWT session authentication. Unauthorised access is prohibited.
        </div>
      </section>
    </div>
  );
}
