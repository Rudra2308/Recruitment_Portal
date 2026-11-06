"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  ClipboardList,
  ExternalLink,
  FolderDown,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Menu,
  QrCode,
  ScrollText,
  Settings,
  SlidersHorizontal,
  Tags,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Wordmark } from "@/components/wordmark";
import type { AdminSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Recruitment",
    items: [
      { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
      { href: "/admin/applicants", label: "Applicants", icon: Users },
      { href: "/admin/departments", label: "Departments", icon: Building2 },
    ],
  },
  {
    label: "Configuration",
    items: [
      { href: "/admin/config/form", label: "Application Form", icon: ClipboardList },
      { href: "/admin/config/job-details", label: "Job Details", icon: SlidersHorizontal },
      { href: "/admin/config/statuses", label: "Statuses", icon: Tags },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/admin/tools/bulk-download", label: "Bulk Download", icon: FolderDown },
      { href: "/admin/tools/qr", label: "QR Codes", icon: QrCode },
      { href: "/admin/tools/audit", label: "Audit Log", icon: ScrollText },
    ],
  },
  {
    label: null,
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({
  pathname,
  session,
  mode,
  onNavigate,
}: {
  pathname: string;
  session: AdminSession;
  mode: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-5 py-5">
        <Wordmark subtitle="Recruitment Admin" />
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-4">
        {GROUPS.map((group, groupIndex) => (
          <div key={group.label ?? `group-${groupIndex}`} className={groupIndex ? "mt-5" : ""}>
            {group.label ? (
              <p className="mb-1.5 px-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted/70">
                {group.label}
              </p>
            ) : null}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-9 items-center gap-2.5 border-l-2 px-2.5 py-2 text-[12.5px] transition-colors",
                      active
                        ? "border-brand bg-surface font-medium text-ink"
                        : "border-transparent text-muted hover:bg-surface hover:text-ink",
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active ? "text-brand" : "text-muted")} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <div
          className={cn(
            "mb-3 flex items-center gap-2 border px-2.5 py-2 text-[10px]",
            mode === "google"
              ? "border-[#cce3d8] bg-[#f1f8f4] text-[#17694a]"
              : "border-[#ecdcb9] bg-[#fdf8ec] text-[#7a5200]",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              mode === "google" ? "bg-[#1a7f4b]" : "bg-[#b27a00]",
            )}
          />
          {mode === "google" ? "Google Sheets connected" : "Local demo data"}
        </div>

        <div className="px-1">
          <p className="truncate text-[11px] font-medium text-ink">{session.email}</p>
          <p className="mt-0.5 text-[10px] text-muted">Signed in as administrator</p>
        </div>

        <form action="/api/admin/logout" method="post" className="mt-2.5">
          <button
            type="submit"
            className="flex min-h-9 w-full items-center gap-2 border border-line px-2.5 py-1.5 text-[11px] font-medium text-muted transition-colors hover:border-ink hover:text-ink"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({
  session,
  mode,
  children,
}: {
  session: AdminSession;
  mode: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-line bg-white lg:block">
        <SidebarContent pathname={pathname} session={session} mode={mode} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <aside className="absolute inset-y-0 left-0 w-[280px] border-r border-line bg-white">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-4 z-10 flex h-9 w-9 items-center justify-center border border-line bg-white"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent
              pathname={pathname}
              session={session}
              mode={mode}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-[260px]">
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="flex h-9 w-9 items-center justify-center border border-line"
            >
              <Menu className="h-4 w-4" />
            </button>
            <Wordmark />
          </div>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 text-[11px] text-muted"
          >
            Site <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <header className="sticky top-0 z-20 hidden h-14 items-center justify-between border-b border-line bg-white px-7 lg:flex">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted">
            Recruitment administration
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/admin/tools/qr"
              className="inline-flex items-center gap-1.5 text-[11px] text-muted transition-colors hover:text-ink"
            >
              <QrCode className="h-3.5 w-3.5" />
              QR tools
            </Link>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-[11px] text-muted transition-colors hover:text-ink"
            >
              View site <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1240px] px-4 py-6 md:px-7 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
