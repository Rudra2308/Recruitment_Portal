import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface WordmarkProps {
  className?: string;
  tone?: "ink" | "light";
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  markOnly?: boolean;
}

export function Wordmark({
  className,
  tone = "ink",
  subtitle = "Careers",
  size = "md",
  markOnly = false,
}: WordmarkProps) {
  const isLight = tone === "light";
  const markSrc = isLight
    ? "/careers/brand/malati-mark-white-header.png"
    : "/careers/brand/malati-mark-header.png";

  const dimensions = {
    sm: { width: 44, height: 27 },
    md: { width: 52, height: 32 },
    lg: { width: 62, height: 38 },
  }[size];

  return (
    <Link
      href="/"
      aria-label="Malati Group careers home"
      className={cn(
        "group inline-flex items-center gap-3 leading-none transition-opacity hover:opacity-95",
        isLight ? "text-white" : "text-ink",
        className,
      )}
    >
      <div className="relative shrink-0 flex items-center">
        <Image
          src={markSrc}
          alt="Malati Group"
          width={dimensions.width}
          height={dimensions.height}
          priority
          className="h-auto w-auto object-contain"
        />
      </div>

      {!markOnly && (
        <div className="flex flex-col justify-center">
          <span
            className={cn(
              "font-bold tracking-[0.16em] uppercase",
              size === "sm" && "text-[13px]",
              size === "md" && "text-[14.5px]",
              size === "lg" && "text-[16px]",
              isLight ? "text-white" : "text-ink",
            )}
          >
            MALATI GROUP
          </span>
          {subtitle && (
            <span
              className={cn(
                "mt-1 text-[9px] font-semibold uppercase tracking-[0.24em]",
                isLight ? "text-white/55" : "text-muted",
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
