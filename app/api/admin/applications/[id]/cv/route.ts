import { getSession } from "@/lib/auth";
import { getApplicationById } from "@/lib/data/applications";
import { getCvStream } from "@/lib/google/drive";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME_BY_EXTENSION: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function safeDownloadName(value: string): string {
  const name = (value || "cv").replace(/[^\w.\-() ]+/g, "_").slice(0, 120);
  return name || "cv";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return jsonError("Authentication required.", 401);
  }

  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) {
    return jsonError("Application not found.", 404);
  }
  if (!application.cv_file_id) {
    return jsonError("No CV was attached to this application.", 404);
  }

  let stream: ReadableStream<Uint8Array>;
  try {
    stream = await getCvStream(application.cv_file_id);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The CV could not be retrieved right now.";
    console.error("CV download failed", error);
    return jsonError(message, 500);
  }

  const filename = safeDownloadName(application.cv_filename);
  const extension = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  const contentType = MIME_BY_EXTENSION[extension] ?? "application/octet-stream";

  return new Response(stream, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
