import QRCode from "qrcode";

import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`qr:${ip}`, 60, 60_000);
  if (!limit.ok) {
    return new Response("Too many requests.", {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfterSeconds) },
    });
  }

  const url = new URL(request.url);
  const data = (url.searchParams.get("data") ?? "").trim();
  if (!data || data.length > 600) {
    return new Response("Invalid QR payload.", { status: 400 });
  }
  if (!/^https?:\/\//i.test(data)) {
    return new Response("QR payload must be an http(s) URL.", { status: 400 });
  }

  const requestedSize = Number(url.searchParams.get("size") ?? "560");
  const size = Number.isFinite(requestedSize)
    ? Math.min(Math.max(Math.round(requestedSize), 160), 1200)
    : 560;
  const download = url.searchParams.get("download") === "1";

  try {
    const buffer = await QRCode.toBuffer(data, {
      type: "png",
      width: size,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#111111", light: "#FFFFFF" },
    });

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
        ...(download
          ? { "Content-Disposition": 'attachment; filename="malati-qr.png"' }
          : {}),
      },
    });
  } catch (error) {
    console.error("QR generation failed", error);
    return new Response("QR could not be generated.", { status: 500 });
  }
}
