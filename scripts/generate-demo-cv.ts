import fs from "node:fs";
import path from "node:path";

function createPdfBuffer(lines: { text: string; size: number; bold?: boolean; y: number }[]): Buffer {
  const contentStream = lines
    .map(
      (l) =>
        `BT /F1 ${l.size} Tf 50 ${l.y} Td (${l.text.replace(/[\(\)\\]/g, "\\$&")}) Tj ET`,
    )
    .join("\n");

  const streamLength = Buffer.byteLength(contentStream, "utf8");

  const objects = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj`,
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`,
    `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj`,
  ];

  let offset = 9; // length of "%PDF-1.4\n"
  const xrefOffsets = [0];
  let body = "%PDF-1.4\n";

  for (const obj of objects) {
    xrefOffsets.push(offset);
    body += `${obj}\n`;
    offset += Buffer.byteLength(`${obj}\n`, "utf8");
  }

  const startXref = offset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += `${String(xrefOffsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;
  return Buffer.from(body + xref + trailer, "utf8");
}

export function generateSampleResumeBuffer(): Buffer {
  return createPdfBuffer([
    { text: "RAHUL S. PATIL", size: 20, y: 780 },
    { text: "Senior CNC & VMC Programmer | Machinist", size: 12, y: 755 },
    { text: "rahul.patil.sample@example.com  |  +91 98220 12345  |  Kolhapur, Maharashtra", size: 10, y: 735 },
    { text: "------------------------------------------------------------------------------------------------------------------------", size: 10, y: 720 },
    { text: "PROFESSIONAL SUMMARY", size: 12, y: 695 },
    { text: "Results-driven CNC & VMC Programmer with 5+ years of hands-on experience in manufacturing,", size: 10, y: 675 },
    { text: "ferrous casting machining, tooling selection, and cycle-time optimization.", size: 10, y: 660 },
    { text: "Expert in Fanuc and Siemens controls, Mastercam 2D/3D programming, and GD&T compliance.", size: 10, y: 645 },
    { text: "EXPERIENCE", size: 12, y: 615 },
    { text: "Senior CNC Programmer - Precision Components Pvt Ltd, Kolhapur (2022 - Present)", size: 10, y: 595 },
    { text: "  - Programmed 3-axis and 4-axis VMC machining centers for graded iron casting components.", size: 9, y: 580 },
    { text: "  - Reduced cycle times by 14% through optimized toolpaths and high-feed milling strategies.", size: 9, y: 565 },
    { text: "  - Collaborated with QA team to resolve machining deviations and PPAP documentation.", size: 9, y: 550 },
    { text: "CNC & VMC Operator - Auto Casting Works, Hatkanangale (2019 - 2022)", size: 10, y: 525 },
    { text: "  - Operated Twin-Spindle CNC Lathes and Vertical Machining Centers.", size: 9, y: 510 },
    { text: "  - Conducted first-piece inspection using vernier callipers, micrometers, and height gauges.", size: 9, y: 495 },
    { text: "EDUCATION & CERTIFICATIONS", size: 12, y: 465 },
    { text: "Diploma in Mechanical Engineering (2019) - Government Polytechnic, Kolhapur", size: 10, y: 445 },
    { text: "Certified Mastercam & Fanuc CNC Programming Specialist (2020)", size: 10, y: 430 },
    { text: "TECHNICAL SKILLS", size: 12, y: 400 },
    { text: "Controls: Fanuc 0i-MF, Siemens 828D, Mitsubishi  |  Software: Mastercam, AutoCAD", size: 10, y: 380 },
    { text: "Inspection: CMM Basics, Surface Roughness Tester, Dial Gauges, GD&T", size: 10, y: 365 },
  ]);
}

async function main() {
  const publicDir = path.resolve("public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const pdfBuffer = generateSampleResumeBuffer();
  const targetFile = path.join(publicDir, "demo-cv.pdf");
  fs.writeFileSync(targetFile, pdfBuffer);
  console.log(`✓ Demo CV created successfully at: ${targetFile} (${pdfBuffer.length} bytes)`);
}

main().catch(console.error);
