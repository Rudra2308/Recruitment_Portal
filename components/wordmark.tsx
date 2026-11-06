import Link from "next/link";

import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "light";
}) {
  return (
    <Link
      href="/"
      aria-label="Malati Group careers home"
      className={cn(
        "inline-flex flex-col leading-none",
        tone === "light" ? "text-white" : "text-ink",
        className,
      )}
    >
      <span className="text-[15px] font-bold tracking-[0.19em]">
        MALATI GROUP
      </span>
      <span
        className={cn(
          "mt-1.5 text-[9px] font-medium uppercase tracking-[0.28em]",
          tone === "light" ? "text-white/55" : "text-muted",
        )}
      >
        Careers
      </span>
    </Link>
  );
}
