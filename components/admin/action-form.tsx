"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

import type { ActionState } from "@/lib/types";
import { cn } from "@/lib/utils";

type FormAction = (
  state: ActionState,
  formData: FormData,
) => Promise<ActionState>;

const VARIANTS = {
  primary: "bg-brand text-white hover:bg-brand-dark border-brand",
  secondary: "bg-ink text-white hover:bg-black border-ink",
  outline: "border-line bg-white text-ink hover:border-ink",
  ghost: "border-transparent bg-transparent text-ink hover:bg-surface",
  danger: "border-[#f0ccd3] bg-white text-brand hover:bg-[#fdf3f5]",
} as const;

const SIZES = {
  md: "min-h-11 px-5 text-[13px]",
  sm: "min-h-9 px-3 text-[12px]",
  xs: "min-h-8 px-2.5 text-[11px]",
  icon: "h-8 w-8 p-0",
} as const;

export function ActionForm({
  action,
  children,
  submitLabel,
  submitContent,
  pendingLabel,
  variant = "primary",
  size = "md",
  className,
  buttonClassName,
  footerClassName,
  confirm,
  resetOnSuccess = false,
  showMessage = true,
  align = "start",
  hidden = false,
}: {
  action: FormAction;
  children?: React.ReactNode;
  submitLabel: string;
  submitContent?: React.ReactNode;
  pendingLabel?: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  className?: string;
  buttonClassName?: string;
  footerClassName?: string;
  confirm?: string;
  resetOnSuccess?: boolean;
  showMessage?: boolean;
  align?: "start" | "end" | "between";
  hidden?: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    { ok: false },
  );
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!state.ok) return;
    if (state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
      return;
    }
    if (resetOnSuccess) formRef.current?.reset();
    router.refresh();
  }, [state, resetOnSuccess, router]);

  if (hidden) {
    return (
      <form ref={formRef} action={formAction} className="hidden">
        {children}
        <button type="submit">{submitLabel}</button>
      </form>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className={className}
      onSubmit={(event) => {
        if (confirm && !window.confirm(confirm)) {
          event.preventDefault();
        }
      }}
    >
      {children}

      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-2",
          align === "end" && "justify-end",
          align === "between" && "justify-between",
          footerClassName ?? "mt-4",
        )}
      >
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 border font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
            VARIANTS[variant],
            SIZES[size],
            buttonClassName,
          )}
        >
          {pending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {size === "icon" ? null : (pendingLabel ?? "Saving…")}
            </>
          ) : (
            (submitContent ?? submitLabel)
          )}
        </button>

        {state.error ? (
          <p role="alert" className="text-[12px] font-medium text-brand">
            {state.error}
          </p>
        ) : null}
        {showMessage && state.ok && state.message ? (
          <p role="status" className="text-[12px] font-medium text-[#17694a]">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
