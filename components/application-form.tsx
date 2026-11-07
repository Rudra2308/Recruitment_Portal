"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { ResolvedField } from "@/lib/types";
import { cn, formatBytes, isEmail, isPhone } from "@/lib/utils";

type FormValue = string | boolean;
type FormValues = Record<string, FormValue>;
type FormErrors = Record<string, string>;

interface Step {
  key: string;
  title: string;
  description: string;
  fields: ResolvedField[];
}

const SECTION_COPY: Record<string, string> = {
  Personal: "Tell us who you are and how we can reach you.",
  Professional: "A little about your experience and current role.",
  Documents: "Attach your CV if you have one. PDF, DOC or DOCX.",
  Additional: "Anything else the recruitment team should know.",
  Review: "Check your details before submitting.",
};

function sectionDescription(section: string): string {
  return SECTION_COPY[section] ?? "Additional information for your application.";
}

function fieldValueLabel(field: ResolvedField, value: FormValue | undefined): string {
  if (field.type === "checkbox") return value === true ? "Yes" : "No";
  if (field.type === "file") {
    return typeof value === "string" && value ? value : "Not attached";
  }
  if (field.type === "select" || field.type === "radio") {
    const option = field.options.find((item) => item.value === value);
    return option?.label ?? (typeof value === "string" && value ? value : "Not provided");
  }
  return typeof value === "string" && value.trim() ? value : "Not provided";
}

function validateField(
  field: ResolvedField,
  value: FormValue | undefined,
  file: File | null,
  maxBytes: number,
): string | null {
  if (field.type === "file") {
    if (!file) {
      return "Upload your resume / CV to continue.";
    }
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (![".pdf", ".doc", ".docx"].includes(extension)) {
      return "Upload a PDF, DOC or DOCX file.";
    }
    if (file.size > maxBytes) {
      return `The file is larger than ${Math.round(maxBytes / (1024 * 1024))} MB.`;
    }
    return null;
  }

  if (field.type === "checkbox") {
    if (field.required && value !== true) {
      return "Please tick this box to continue.";
    }
    return null;
  }

  const text = typeof value === "string" ? value.trim() : "";
  if (!text) {
    if (!field.required) return null;
    return field.type === "select" || field.type === "radio"
      ? "Choose an option to continue."
      : "This field is required.";
  }

  if (field.type === "email" && !isEmail(text)) {
    return "Enter a valid email address.";
  }
  if (field.type === "phone" && !isPhone(text)) {
    return "Enter a valid phone number.";
  }
  if (field.type === "number" && !Number.isFinite(Number(text))) {
    return "Enter a valid number.";
  }
  if (
    (field.type === "select" || field.type === "radio") &&
    !field.options.some((option) => option.value === text)
  ) {
    return "Choose a valid option.";
  }
  return null;
}

export function ApplicationForm({
  jobId,
  jobTitle,
  fields,
  cvAccept,
  cvMaxMb,
  preview = false,
}: {
  jobId: string;
  jobTitle: string;
  fields: ResolvedField[];
  cvAccept: string;
  cvMaxMb: number;
  preview?: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const maxBytes = cvMaxMb * 1024 * 1024;

  const steps = useMemo<Step[]>(() => {
    const groups: Step[] = [];
    for (const field of fields) {
      const section = field.section || "Additional";
      let group = groups.find((item) => item.key === section);
      if (!group) {
        group = {
          key: section,
          title: section,
          description: sectionDescription(section),
          fields: [],
        };
        groups.push(group);
      }
      group.fields.push(field);
    }
    groups.push({
      key: "Review",
      title: "Review",
      description: SECTION_COPY.Review,
      fields: [],
    });
    return groups;
  }, [fields]);

  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<FormValues>(() => {
    const initial: FormValues = {};
    for (const field of fields) {
      initial[field.key] = field.type === "checkbox" ? false : "";
    }
    return initial;
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  const current = steps[Math.min(stepIndex, steps.length - 1)];
  const isReview = current.key === "Review";
  const isStepBeforeReview = stepIndex === steps.length - 2;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    if (isReview) {
      const timer = window.setTimeout(() => setCanSubmit(true), 350);
      return () => window.clearTimeout(timer);
    } else {
      setCanSubmit(false);
    }
  }, [isReview]);

  useEffect(() => {
    const form = document.getElementById("application-form-start");
    if (!form) return;
    const top = form.getBoundingClientRect().top + window.scrollY - 96;
    if (window.scrollY > top + 40) {
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, [stepIndex]);

  const EXPERIENCED_ONLY_KEYS = [
    "experience_years",
    "current_employer",
    "current_ctc",
    "current_gross",
    "notice_period",
  ];

  function isFieldVisible(field: ResolvedField): boolean {
    if (EXPERIENCED_ONLY_KEYS.includes(field.key)) {
      return values.experience_type === "experienced";
    }
    return true;
  }

  function setValue(field: ResolvedField, value: FormValue) {
    setValues((previous) => {
      const next = { ...previous, [field.key]: value };
      if (field.key === "experience_type") {
        if (value === "fresher") {
          next.experience_years = "";
          next.current_employer = "N/A - Fresher";
          next.current_ctc = "N/A";
          next.current_gross = "N/A";
          next.notice_period = "Immediate";
        } else if (value === "experienced") {
          if (next.current_employer === "N/A - Fresher") next.current_employer = "";
          if (next.current_ctc === "N/A") next.current_ctc = "";
          if (next.current_gross === "N/A") next.current_gross = "";
          if (next.notice_period === "Immediate") next.notice_period = "";
        }
      }
      return next;
    });

    setErrors((previous) => {
      if (!previous[field.key]) return previous;
      const next = { ...previous };
      delete next[field.key];
      return next;
    });
  }

  function validateFields(target: ResolvedField[]): FormErrors {
    const next: FormErrors = {};
    for (const field of target) {
      if (!isFieldVisible(field)) continue;
      const message = validateField(field, values[field.key], file, maxBytes);
      if (message) next[field.key] = message;
    }
    return next;
  }

  function focusFirstError(nextErrors: FormErrors) {
    const firstKey = Object.keys(nextErrors)[0];
    if (!firstKey) return;
    window.setTimeout(() => {
      document.getElementById(`field-${firstKey}`)?.focus();
    }, 40);
  }

  function goNext() {
    const nextErrors = validateFields(current.fields);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      focusFirstError(nextErrors);
      return;
    }
    setErrors({});
    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  }

  function goBack() {
    setErrors({});
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  function goToStep(key: string) {
    const index = steps.findIndex((step) => step.key === key);
    if (index >= 0) setStepIndex(index);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Guard: Only allow submission from the Review step
    if (!isReview) {
      goNext();
      return;
    }

    if (preview || submitting || !canSubmit) return;

    const allErrors: FormErrors = {};
    for (const step of steps) {
      for (const field of step.fields) {
        if (!isFieldVisible(field)) continue;
        const message = validateField(field, values[field.key], file, maxBytes);
        if (message) allErrors[field.key] = message;
      }
    }
    if (!file) {
      allErrors.cv = "Upload your resume / CV to continue.";
    }

    if (Object.keys(allErrors).length) {
      setErrors(allErrors);
      const firstKey = Object.keys(allErrors)[0];
      const stepWithError = steps.findIndex((step) =>
        step.fields.some((field) => field.key === firstKey),
      );
      if (stepWithError >= 0) setStepIndex(stepWithError);
      focusFirstError(allErrors);
      return;
    }

    setSubmitting(true);
    setGlobalError("");

    const formData = new FormData();
    formData.set("position_id", jobId);
    formData.set("company_website", honeypotRef.current?.value ?? "");

    for (const field of fields) {
      if (field.type === "file") {
        if (file) formData.set(field.key, file);
        continue;
      }
      const value = values[field.key];
      if (field.type === "checkbox") {
        formData.set(field.key, value === true ? "true" : "false");
      } else {
        formData.set(field.key, typeof value === "string" ? value : "");
      }
    }

    try {
      const response = await fetch("/careers/api/applications", {
        method: "POST",
        body: formData,
      });
      let payload: {
        error?: string;
        fieldErrors?: Record<string, string>;
        applicationId?: string;
      } = {};
      try {
        payload = (await response.json()) as typeof payload;
      } catch {
        payload = {};
      }

      if (!response.ok) {
        setGlobalError(payload.error ?? "Your application could not be submitted.");
        if (payload.fieldErrors && Object.keys(payload.fieldErrors).length) {
          setErrors(payload.fieldErrors);
          const firstKey = Object.keys(payload.fieldErrors)[0];
          const stepWithError = steps.findIndex((step) =>
            step.fields.some((field) => field.key === firstKey),
          );
          if (stepWithError >= 0) setStepIndex(stepWithError);
          focusFirstError(payload.fieldErrors);
        }
        return;
      }

      const reference = payload.applicationId ?? "";
      router.push(`/apply/success?ref=${encodeURIComponent(reference)}`);
    } catch {
      setGlobalError(
        "We could not reach the server. Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function renderField(field: ResolvedField) {
    if (!isFieldVisible(field)) return null;

    const error = errors[field.key];
    const describedBy = [
      field.description ? `hint-${field.key}` : null,
      error ? `error-${field.key}` : null,
    ]
      .filter(Boolean)
      .join(" ");

    const common = {
      id: `field-${field.key}`,
      name: field.key,
      "aria-invalid": Boolean(error),
      "aria-describedby": describedBy || undefined,
      className: cn(
        field.type === "textarea" ? "textarea" : "input",
        error && "field-error",
      ),
    };

    return (
      <div key={field.key} className={cn(field.type === "checkbox" && "py-1")}>
        {field.type !== "checkbox" ? (
          <label htmlFor={`field-${field.key}`} className="label">
            {field.label}
            {field.required ? (
              <span className="ml-1 text-brand" aria-hidden="true">
                *
              </span>
            ) : (
              <span className="ml-2 text-[11px] font-normal text-muted">Optional</span>
            )}
          </label>
        ) : null}

        {field.description && field.type !== "checkbox" ? (
          <p id={`hint-${field.key}`} className="mb-2 text-[12px] leading-5 text-muted">
            {field.description}
          </p>
        ) : null}

        {field.type === "textarea" ? (
          <textarea
            {...common}
            rows={5}
            value={typeof values[field.key] === "string" ? (values[field.key] as string) : ""}
            onChange={(event) => setValue(field, event.target.value)}
            placeholder={field.description ? undefined : "Type your answer"}
          />
        ) : field.type === "select" ? (
          <select
            {...common}
            className={cn("select", error && "field-error")}
            value={typeof values[field.key] === "string" ? (values[field.key] as string) : ""}
            onChange={(event) => setValue(field, event.target.value)}
          >
            <option value="">Select an option</option>
            {field.options.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : field.type === "radio" ? (
          <div
            className="grid gap-2 sm:grid-cols-2"
            role="radiogroup"
            id={`field-${field.key}`}
            tabIndex={-1}
          >
            {field.options.map((option) => {
              const selected = values[field.key] === option.value;
              return (
                <label
                  key={option.id}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-3 rounded-[6px] border px-3.5 py-2.5 text-[13px] transition-colors",
                    selected ? "border-brand bg-brand-light/40 font-medium text-ink" : "border-line hover:border-ink/40",
                  )}
                >
                  <input
                    type="radio"
                    name={field.key}
                    value={option.value}
                    checked={selected}
                    onChange={() => setValue(field, option.value)}
                    className="h-4 w-4 accent-brand"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        ) : field.type === "checkbox" ? (
          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 border p-4 transition-colors",
              error ? "border-brand" : "border-line hover:border-ink/40",
            )}
          >
            <input
              type="checkbox"
              id={`field-${field.key}`}
              name={field.key}
              checked={values[field.key] === true}
              onChange={(event) => setValue(field, event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-brand"
              aria-invalid={Boolean(error)}
              aria-describedby={describedBy || undefined}
            />
            <span>
              <span className="block text-[13px] font-medium text-ink">
                {field.label}
                {field.required ? <span className="ml-1 text-brand">*</span> : null}
              </span>
              {field.description ? (
                <span id={`hint-${field.key}`} className="mt-1 block text-[12px] leading-5 text-muted">
                  {field.description}
                </span>
              ) : null}
            </span>
          </label>
        ) : field.type === "file" ? (
          <div>
            {file ? (
              <div className="flex items-center justify-between gap-3 border border-line bg-surface p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-muted" />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{file.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setValue(field, "");
                  }}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-line text-muted transition-colors hover:border-ink hover:text-ink"
                  aria-label="Remove uploaded file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <label
                  htmlFor={`field-${field.key}`}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center border border-dashed px-6 py-8 text-center transition-colors",
                    error ? "border-brand" : "border-line hover:border-ink",
                  )}
                >
                  <UploadCloud className="h-6 w-6 text-muted" />
                  <span className="mt-3 text-[13px] font-medium">Choose a file</span>
                  <span className="mt-1 text-[11px] text-muted">
                    PDF, DOC or DOCX · up to {cvMaxMb} MB
                  </span>
                  <input
                    id={`field-${field.key}`}
                    name={field.key}
                    type="file"
                    accept={cvAccept}
                    className="sr-only"
                    onChange={(event) => {
                      const selected = event.target.files?.[0] ?? null;
                      setFile(selected);
                      setValue(field, selected?.name ?? "");
                    }}
                    aria-invalid={Boolean(error)}
                    aria-describedby={describedBy || undefined}
                  />
                </label>
                <div className="mt-2 text-center">
                  <a
                    href="/careers/demo-cv.pdf"
                    download="demo-cv.pdf"
                    className="text-[11px] text-brand underline underline-offset-2 hover:opacity-80"
                  >
                    Need a sample CV for testing? Download demo CV (PDF)
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          <input
            {...common}
            type={
              field.type === "email"
                ? "email"
                : field.type === "phone"
                  ? "tel"
                  : field.type === "number"
                    ? "number"
                    : field.type === "date"
                      ? "date"
                      : "text"
            }
            inputMode={
              field.type === "phone"
                ? "tel"
                : field.type === "number"
                  ? "decimal"
                  : field.type === "email"
                    ? "email"
                    : undefined
            }
            autoComplete={
              field.key === "candidate_name"
                ? "name"
                : field.key === "email"
                  ? "email"
                  : field.key === "phone"
                    ? "tel"
                    : field.key === "location"
                      ? "address-level2"
                      : undefined
            }
            value={typeof values[field.key] === "string" ? (values[field.key] as string) : ""}
            onChange={(event) => setValue(field, event.target.value)}
            placeholder={field.type === "date" ? undefined : "Type your answer"}
          />
        )}

        {error ? (
          <p id={`error-${field.key}`} className="mt-1.5 text-[12px] font-medium text-brand">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div id="application-form-start" className="scroll-mt-24">
      <div className="overflow-hidden rounded-[10px] border border-line bg-white shadow-xs">
        <div className="border-b border-line px-5 py-5 md:px-7">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              {isReview ? "Review" : `Step ${stepIndex + 1} of ${steps.length}`}
            </p>
            <p className="text-[11px] text-muted">
              {Math.round(progress)}% complete
            </p>
          </div>
          <div className="mt-3 h-[2px] w-full bg-line">
            <div
              className="h-full bg-brand transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-x-2 gap-y-1">
            {steps.map((step, index) => (
              <span
                key={step.key}
                className={cn(
                  "text-[10px] uppercase tracking-[0.08em]",
                  index === stepIndex
                    ? "font-semibold text-ink"
                    : index < stepIndex
                      ? "text-muted"
                      : "text-muted/50",
                )}
              >
                {step.title}
                {index < steps.length - 1 ? (
                  <span className="ml-2 text-line">/</span>
                ) : null}
              </span>
            ))}
          </div>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !isReview &&
              (event.target as HTMLElement).tagName !== "TEXTAREA"
            ) {
              event.preventDefault();
              goNext();
            }
          }}
          noValidate
        >
          <div className="px-5 py-7 md:px-7 md:py-8">
            <h2 className="text-[24px] font-semibold tracking-[-0.025em]">
              {isReview ? "Review your application" : current.title}
            </h2>
            <p className="mt-1.5 text-[13px] leading-6 text-muted">
              {current.description}
            </p>

            {globalError ? (
              <div
                role="alert"
                className="mt-5 border border-[#f0ccd3] bg-[#fdf3f5] px-4 py-3 text-[12px] leading-5 text-brand"
              >
                {globalError}
              </div>
            ) : null}

            {isReview ? (
              <div className="mt-7 space-y-8">
                <div className="rounded-[8px] border border-line bg-surface/60 p-4 text-[12.5px] text-muted">
                  <p className="font-semibold text-ink">
                    Please review your application details below.
                  </p>
                  <p className="mt-1 text-[12px] text-muted">
                    If any detail needs correction, click &ldquo;Edit&rdquo; next to that section. Once you are satisfied, click &ldquo;Submit application&rdquo; at the bottom to complete your submission.
                  </p>
                </div>

                {steps
                  .filter((step) => step.key !== "Review" && step.fields.length)
                  .map((step) => (
                    <div key={step.key}>
                      <div className="flex items-center justify-between border-b border-line pb-2">
                        <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                          {step.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => goToStep(step.key)}
                          className="text-[11px] font-medium text-ink underline decoration-line underline-offset-2 hover:text-brand"
                        >
                          Edit
                        </button>
                      </div>
                      <dl className="mt-3 divide-y divide-line">
                        {step.fields
                          .filter((field) => isFieldVisible(field))
                          .map((field) => (
                            <div
                              key={field.key}
                              className="grid gap-1 py-2.5 sm:grid-cols-[180px_1fr] sm:gap-4"
                            >
                              <dt className="text-[12px] text-muted">{field.label}</dt>
                              <dd className="break-words text-[13px] text-ink">
                                {field.type === "file" && file
                                  ? file.name
                                  : fieldValueLabel(field, values[field.key])}
                              </dd>
                            </div>
                          ))}
                      </dl>
                    </div>
                  ))}

                <div className="border border-line bg-surface px-4 py-3">
                  <p className="text-[11px] leading-5 text-muted">
                    By submitting this application you confirm that the information
                    provided is accurate and consent to Malati Group contacting you
                    about this role. Your CV is stored privately and is only accessed
                    by the recruitment team.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-7 space-y-6">
                {current.fields.map((field) => renderField(field))}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-7">
            <button
              type="button"
              onClick={goBack}
              disabled={stepIndex === 0 || submitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] border border-line px-4 text-[13px] font-medium transition-colors hover:border-ink disabled:pointer-events-none disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {isReview ? (
              <button
                key="submit-application-btn"
                type="submit"
                disabled={submitting || preview || !canSubmit}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] bg-brand px-6 text-[13px] font-semibold text-white transition-colors hover:bg-brand-dark disabled:pointer-events-none disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    {preview ? "Submit disabled in preview" : "Submit application"}
                    {!preview ? <ArrowRight className="h-4 w-4" /> : null}
                  </>
                )}
              </button>
            ) : (
              <button
                key="continue-step-btn"
                type="button"
                onClick={goNext}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] bg-ink px-6 text-[13px] font-medium text-white transition-colors hover:bg-black"
              >
                {isStepBeforeReview ? "Review application" : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        <input
          ref={honeypotRef}
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
        />
      </div>

      <div className="mt-4 flex items-start gap-2 px-1 text-[11px] leading-5 text-muted">
        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1a7f4b]" />
        <p>
          Your details are used only for this recruitment process. No candidate
          account is created and no public profile is visible.
        </p>
      </div>

      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
      />
    </div>
  );
}
