import Link from "next/link";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.03em] text-ink md:text-[30px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-6 text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
  bodyClassName = "p-5",
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`admin-card ${className}`}>
      {title || action ? (
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            {title ? <h2 className="admin-section-title">{title}</h2> : null}
            {description ? (
              <p className="mt-0.5 text-[11.5px] leading-5 text-muted">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-[34px] font-semibold leading-none tracking-[-0.04em] text-ink">
        {value}
      </p>
      {sub ? <p className="mt-2 text-[11px] text-muted">{sub}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="admin-card block p-5 transition-colors hover:border-ink"
      >
        {content}
      </Link>
    );
  }
  return <div className="admin-card p-5">{content}</div>;
}

export function AdminEmpty({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="border border-dashed border-line bg-[#fcfcfc] px-6 py-12 text-center">
      <p className="text-[13px] font-medium text-ink">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-[12px] leading-5 text-muted">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex min-h-9 items-center border border-ink px-4 text-[12px] font-medium transition-colors hover:bg-ink hover:text-white"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function Pagination({
  page,
  pages,
  total,
  basePath,
  params = {},
}: {
  page: number;
  pages: number;
  total?: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (pages <= 1) {
    return total !== undefined ? (
      <p className="text-[11px] text-muted">{total} total</p>
    ) : null;
  }

  const hrefFor = (target: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value);
    }
    search.set("page", String(target));
    return `${basePath}?${search.toString()}`;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
      <p className="text-[11px] text-muted">
        Page {page} of {pages}
        {total !== undefined ? ` · ${total} total` : ""}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={hrefFor(page - 1)}
            className="inline-flex min-h-8 items-center border border-line px-3 text-[11px] transition-colors hover:border-ink"
          >
            Previous
          </Link>
        ) : (
          <span className="inline-flex min-h-8 items-center border border-line px-3 text-[11px] text-muted opacity-50">
            Previous
          </span>
        )}
        {page < pages ? (
          <Link
            href={hrefFor(page + 1)}
            className="inline-flex min-h-8 items-center border border-line px-3 text-[11px] transition-colors hover:border-ink"
          >
            Next
          </Link>
        ) : (
          <span className="inline-flex min-h-8 items-center border border-line px-3 text-[11px] text-muted opacity-50">
            Next
          </span>
        )}
      </div>
    </div>
  );
}

export function Flash({
  tone = "success",
  children,
}: {
  tone?: "success" | "warning" | "error";
  children: React.ReactNode;
}) {
  const styles = {
    success: "border-[#cce3d8] bg-[#f1f8f4] text-[#17694a]",
    warning: "border-[#ecdcb9] bg-[#fdf8ec] text-[#7a5200]",
    error: "border-[#f0ccd3] bg-[#fdf3f5] text-brand",
  };
  return (
    <div className={`mb-5 border px-4 py-3 text-[12px] leading-5 ${styles[tone]}`}>
      {children}
    </div>
  );
}
