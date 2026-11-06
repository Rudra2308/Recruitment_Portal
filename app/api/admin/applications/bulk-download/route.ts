import { getSession } from "@/lib/auth";
import { getAllPositions } from "@/lib/data/jobs";
import { getCvStream } from "@/lib/google/drive";
import { jsonError } from "@/lib/http";
import { getStore } from "@/lib/data";
import type { Application } from "@/lib/types";
import JSZip from "jszip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

function cleanFilename(
  candidateName: string,
  applicationId: string,
  originalFilename: string,
): string {
  const cleanName = (candidateName || "Candidate")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  const cleanAppId = (applicationId || "Application").replace(/[^\w-]/g, "");
  const ext =
    originalFilename && originalFilename.includes(".")
      ? originalFilename.slice(originalFilename.lastIndexOf(".")).toLowerCase()
      : ".pdf";
  return `${cleanName}_${cleanAppId}${ext}`;
}

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

function buildCsv(
  applications: Application[],
  positionsMap: Map<string, { title: string; department: string }>,
): string {
  const headers = [
    "Application ID",
    "Candidate Name",
    "Position Title",
    "Department",
    "Email",
    "Phone",
    "Current Location",
    "Experience Type",
    "Total Experience Years",
    "Highest Qualification",
    "Current Organisation",
    "Current Salary (CTC)",
    "Current Gross Salary",
    "Expected Gross Salary",
    "Notice Period",
    "Status",
    "Applied At",
    "CV Attached?",
    "CV Filename",
    "Additional Information",
  ];

  const rows = applications.map((app) => {
    const job = positionsMap.get(app.position_id);
    const expType =
      app.experience_type ||
      (app.experience?.toLowerCase().includes("fresher")
        ? "Fresher"
        : "Experienced");

    return [
      escapeCsv(app.application_id),
      escapeCsv(app.candidate_name),
      escapeCsv(job?.title || app.position_id),
      escapeCsv(job?.department || "—"),
      escapeCsv(app.email),
      escapeCsv(app.phone),
      escapeCsv(app.location),
      escapeCsv(expType),
      escapeCsv(app.experience_years || (expType === "Fresher" ? "0" : app.experience)),
      escapeCsv(app.qualification),
      escapeCsv(app.current_employer || (expType === "Fresher" ? "N/A - Fresher" : "—")),
      escapeCsv(app.current_ctc || "N/A"),
      escapeCsv(app.current_gross || "N/A"),
      escapeCsv(app.expected_gross || "N/A"),
      escapeCsv(app.notice_period || (expType === "Fresher" ? "Immediate" : "—")),
      escapeCsv(app.status),
      escapeCsv(app.created_at),
      escapeCsv(app.cv_file_id ? "Yes" : "No"),
      escapeCsv(app.cv_filename || "None"),
      escapeCsv(app.additional_info || ""),
    ].join(",");
  });

  // UTF-8 BOM (\uFEFF) ensures Excel opens special characters and Indian Rupee symbols properly
  return "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return jsonError("Authentication required.", 401);
  }

  let body: {
    applicationIds?: string[];
    all?: boolean;
    positionId?: string;
    status?: string;
  } = {};

  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const store = await getStore();
  const [withCvRows, withoutCvRows, positions] = await Promise.all([
    store.list("WITH_CV"),
    store.list("WITHOUT_CV"),
    getAllPositions(),
  ]);

  const positionsMap = new Map(
    positions.map((p) => [p.id, { title: p.title, department: p.department }]),
  );

  // Parse all applications for the master sheet export
  const allApplications: Application[] = [...withCvRows, ...withoutCvRows].map(
    (row) => {
      const payload = row.payload ? JSON.parse(row.payload) : {};
      return {
        id: row.id,
        application_id: row.application_id || "",
        position_id: row.position_id || "",
        candidate_name: row.candidate_name || "",
        email: row.email || "",
        phone: row.phone || "",
        location: row.location || "",
        experience_type:
          row.experience_type || payload.experience_type || "",
        experience_years:
          row.experience_years || payload.experience_years || "",
        experience: row.experience || "",
        qualification: row.qualification || "",
        current_employer:
          row.current_employer || payload.current_employer || "",
        current_ctc: row.current_ctc || payload.current_ctc || "",
        current_gross: row.current_gross || payload.current_gross || "",
        expected_gross: row.expected_gross || payload.expected_gross || "",
        notice_period: row.notice_period || payload.notice_period || "",
        additional_info: row.additional_info || "",
        cv_file_id: row.cv_file_id || "",
        cv_filename: row.cv_filename || "",
        status: row.status || "NEW",
        created_at: row.created_at || "",
        payload,
        form_snapshot: null,
        status_history: [],
      };
    },
  );

  // Sort by created date descending
  allApplications.sort(
    (a, b) =>
      Date.parse(b.created_at || "1970-01-01") -
      Date.parse(a.created_at || "1970-01-01"),
  );

  const timestamp = formatTimestamp();
  const zip = new JSZip();

  // 1. Always include the complete master sheet data export with requested date/time format
  const excelCsvFilename = `Applicants_Master_Export_${timestamp}.csv`;
  const csvContent = buildCsv(allApplications, positionsMap);
  zip.file(excelCsvFilename, csvContent);

  // 2. Determine which CVs to package into the zip
  let targetAppsForCvs: Application[] = [];

  if (body.all) {
    targetAppsForCvs = allApplications.filter((app) => Boolean(app.cv_file_id));
  } else if (Array.isArray(body.applicationIds) && body.applicationIds.length > 0) {
    const selectedSet = new Set(body.applicationIds);
    targetAppsForCvs = allApplications.filter(
      (app) =>
        (selectedSet.has(app.id) || selectedSet.has(app.application_id)) &&
        Boolean(app.cv_file_id),
    );
  } else {
    // If filtered by position or status
    let filtered = allApplications;
    if (body.positionId) {
      filtered = filtered.filter((app) => app.position_id === body.positionId);
    }
    if (body.status) {
      filtered = filtered.filter(
        (app) => app.status.toLowerCase() === body.status?.toLowerCase(),
      );
    }
    targetAppsForCvs = filtered.filter((app) => Boolean(app.cv_file_id));
  }

  // 3. Package CV files with requested format: name_applicantid.pdf
  const cvFolder = zip.folder("CVs");

  for (const app of targetAppsForCvs) {
    try {
      const stream = await getCvStream(app.cv_file_id);
      const reader = stream.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      const fileBuffer = Buffer.concat(chunks);
      const formattedPdfName = cleanFilename(
        app.candidate_name,
        app.application_id,
        app.cv_filename,
      );
      cvFolder?.file(formattedPdfName, fileBuffer);
    } catch (err) {
      console.warn(`Could not fetch CV for ${app.candidate_name} (${app.id}):`, err);
    }
  }

  // Generate ZIP file
  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const zipFilename = `Malati_Recruitment_Export_${timestamp}.zip`;

  return new Response(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFilename}"`,
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
