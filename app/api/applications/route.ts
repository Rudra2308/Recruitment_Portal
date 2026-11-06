import { after } from "next/server";

import { getCvMaxBytes } from "@/lib/config";
import { isSameOrigin, jsonError } from "@/lib/http";
import { getClientIp, limitApplicationSubmission } from "@/lib/rate-limit";
import { submitApplication } from "@/lib/submission";
import { sendApplicationEmails } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("This request could not be verified.", 403);
  }

  const ip = getClientIp(request);
  const limit = limitApplicationSubmission(ip);
  if (!limit.ok) {
    return jsonError(
      "Too many applications from this connection. Please wait a few minutes and try again.",
      429,
      { retryAfter: limit.retryAfterSeconds },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  const maxBytes = getCvMaxBytes() + 512 * 1024;
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return jsonError(
      `The upload is too large. Keep the total submission under ${Math.round(
        maxBytes / (1024 * 1024),
      )} MB.`,
      413,
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("The form could not be read. Please try again.", 400);
  }

  const result = await submitApplication(formData);
  if (!result.ok || !result.application) {
    return jsonError(
      result.error ?? "Your application could not be submitted.",
      400,
      { fieldErrors: result.fieldErrors ?? {} },
    );
  }

  const application = result.application;
  const position = result.position ?? null;

  // Email is optional and must never block or fail the submission response.
  if (position) {
    after(async () => {
      try {
        await sendApplicationEmails(application, position);
      } catch (error) {
        console.error("Post-submission email failed", error);
      }
    });
  }

  return Response.json(
    {
      ok: true,
      applicationId: application.application_id,
      id: application.id,
    },
    {
      status: 201,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function GET() {
  return jsonError("Method not allowed.", 405);
}
