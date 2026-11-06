import { getDataMode, isEmailEnabled } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let mode: string = "unknown";
  let configured = true;
  let error: string | undefined;

  try {
    mode = getDataMode();
  } catch (cause) {
    configured = false;
    error = cause instanceof Error ? cause.message : "Configuration error";
  }

  return Response.json(
    {
      ok: configured,
      mode,
      emailEnabled: isEmailEnabled(),
      timestamp: new Date().toISOString(),
      ...(error ? { error } : {}),
    },
    {
      status: configured ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
