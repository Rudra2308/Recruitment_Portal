import nodemailer from "nodemailer";

import { absoluteUrl, getEmailConfig, getHrEmail } from "@/lib/config";
import type { Application, Position } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function textValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value ?? "");
}

function emailShell(bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f6f6;font-family:Inter,Arial,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f6f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e7e7;">
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid #e7e7e7;">
                <div style="font-size:13px;letter-spacing:0.14em;font-weight:700;">MALATI GROUP</div>
                <div style="font-size:12px;color:#666666;margin-top:4px;">Careers</div>
              </td>
            </tr>
            <tr><td style="padding:32px;">${bodyHtml}</td></tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #e7e7e7;font-size:12px;color:#666666;">
                Malati Group · Hatkanangale, Kolhapur<br />
                <a href="mailto:hrandadmin@malatigroup.com" style="color:#666666;">hrandadmin@malatigroup.com</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function getTransport() {
  const config = getEmailConfig();
  if (!config) return null;
  return {
    config,
    transport: nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: { user: config.user, pass: config.password },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    }),
  };
}

/**
 * Optional notifications. Callers must never let email failures affect the
 * application submission or admin workflow.
 */
export async function sendApplicationEmails(
  application: Application,
  position: Position | null,
): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.info(
      `Email disabled; skipped notifications for ${application.application_id}.`,
    );
    return;
  }

  const jobTitle = position?.title ?? "the advertised position";
  const reference = application.application_id;
  const jobUrl = position ? absoluteUrl(`/jobs/${position.id}`) : absoluteUrl("/jobs");
  const adminUrl = absoluteUrl(`/admin/applicants/${application.id}`);

  const candidateHtml = emailShell(`
    <p style="margin:0 0 14px;font-size:13px;letter-spacing:0.08em;color:#c8102e;font-weight:600;">APPLICATION RECEIVED</p>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">Thank you, ${escapeHtml(application.candidate_name)}.</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#333333;">
      We have received your application for <strong>${escapeHtml(jobTitle)}</strong>.
      Our recruitment team will review it and contact you if your profile moves forward.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border:1px solid #e7e7e7;margin:24px 0;">
      <tr>
        <td style="padding:14px 16px;font-size:12px;color:#666666;border-bottom:1px solid #e7e7e7;">Application reference</td>
        <td style="padding:14px 16px;font-size:14px;font-weight:600;border-bottom:1px solid #e7e7e7;">${escapeHtml(reference)}</td>
      </tr>
      <tr>
        <td style="padding:14px 16px;font-size:12px;color:#666666;">Position</td>
        <td style="padding:14px 16px;font-size:14px;">${escapeHtml(jobTitle)}</td>
      </tr>
    </table>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#333333;">
      Keep your reference number handy. For any questions, reply to this email or write to
      <a href="mailto:hrandadmin@malatigroup.com" style="color:#111111;">hrandadmin@malatigroup.com</a>.
    </p>
    <p style="margin:0;font-size:13px;color:#666666;">View the job: <a href="${jobUrl}" style="color:#666666;">${jobUrl}</a></p>
  `);

  const detailRows = (application.form_snapshot?.fields ?? [])
    .map((field) => {
      const value = application.payload[field.key];
      if (value === undefined || value === "" || value === false) return "";
      return `<tr>
        <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#666666;width:42%;">${escapeHtml(field.label)}</td>
        <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:13px;">${escapeHtml(textValue(value))}</td>
      </tr>`;
    })
    .join("");

  const hrHtml = emailShell(`
    <p style="margin:0 0 14px;font-size:13px;letter-spacing:0.08em;color:#c8102e;font-weight:600;">NEW APPLICATION</p>
    <h1 style="margin:0 0 8px;font-size:22px;line-height:1.3;">${escapeHtml(application.candidate_name)}</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#666666;">${escapeHtml(jobTitle)} · ${escapeHtml(reference)}</p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;">${detailRows}</table>
    <p style="margin:20px 0 0;font-size:14px;">Received ${escapeHtml(formatDateTime(application.created_at))}</p>
    <p style="margin:24px 0 0;">
      <a href="${adminUrl}" style="display:inline-block;background:#c8102e;color:#ffffff;padding:12px 20px;text-decoration:none;font-size:14px;font-weight:600;">Open applicant record</a>
    </p>
    ${
      application.cv_filename
        ? `<p style="margin:16px 0 0;font-size:13px;color:#666666;">CV attached securely: ${escapeHtml(application.cv_filename)}</p>`
        : `<p style="margin:16px 0 0;font-size:13px;color:#666666;">No CV was uploaded.</p>`
    }
  `);

  const tasks: Promise<unknown>[] = [];
  if (application.email) {
    tasks.push(
      transport.transport.sendMail({
        from: transport.config.from,
        to: application.email,
        subject: `Application received — ${jobTitle} (${reference})`,
        text: `Thank you, ${application.candidate_name}. We received your application for ${jobTitle}. Reference: ${reference}. View the job: ${jobUrl}`,
        html: candidateHtml,
      }),
    );
  }

  tasks.push(
    transport.transport.sendMail({
      from: transport.config.from,
      to: getHrEmail(),
      replyTo: application.email || undefined,
      subject: `New application — ${application.candidate_name} — ${jobTitle}`,
      text: `New application from ${application.candidate_name} for ${jobTitle}. Reference: ${reference}. Open: ${adminUrl}`,
      html: hrHtml,
    }),
  );

  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Email notification failed", result.reason);
    }
  }
}

export async function sendStatusNotification(
  application: Application,
  position: Position | null,
  newStatus: string,
): Promise<void> {
  const transport = getTransport();
  if (!transport || !application.email) return;

  const jobTitle = position?.title ?? "your application";
  try {
    await transport.transport.sendMail({
      from: transport.config.from,
      to: application.email,
      subject: `Application update — ${jobTitle} (${application.application_id})`,
      text: `Hello ${application.candidate_name}, your application status for ${jobTitle} is now: ${newStatus}. Reference: ${application.application_id}.`,
      html: emailShell(`
        <p style="margin:0 0 14px;font-size:13px;letter-spacing:0.08em;color:#c8102e;font-weight:600;">APPLICATION UPDATE</p>
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">Your application status has changed.</h1>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#333333;">
          Hello ${escapeHtml(application.candidate_name)}, your application for
          <strong>${escapeHtml(jobTitle)}</strong> is now marked
          <strong>${escapeHtml(newStatus)}</strong>.
        </p>
        <p style="margin:0 0 18px;font-size:13px;color:#666666;">Reference: ${escapeHtml(application.application_id)}</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#333333;">
          If you have questions, reply to this email or write to
          <a href="mailto:hrandadmin@malatigroup.com" style="color:#111111;">hrandadmin@malatigroup.com</a>.
        </p>
      `),
    });
  } catch (error) {
    console.error("Status notification failed", error);
  }
}

export function isEmailConfigured(): boolean {
  return getEmailConfig() !== null;
}
