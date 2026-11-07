"use client";

import { useState } from "react";
import Image from "next/image";
import { CopyButton } from "@/components/copy-button";
import { Download, ExternalLink, QrCode } from "lucide-react";

interface TargetOption {
  id: string;
  label: string;
  path: string;
  group: string;
}

export function QrGenerator({
  baseUrl,
  targets,
}: {
  baseUrl: string;
  targets: TargetOption[];
}) {
  const [selectedPath, setSelectedPath] = useState(targets[0]?.path ?? "/");
  const [size, setSize] = useState(560);

  const selectedTarget = targets.find((t) => t.path === selectedPath) ?? targets[0];
  const fullUrl = `${baseUrl.replace(/\/$/, "")}${selectedPath}`;
  const qrApiUrl = `/careers/api/qr?data=${encodeURIComponent(fullUrl)}&size=${size}`;
  const downloadUrl = `/careers/api/qr?data=${encodeURIComponent(fullUrl)}&size=${size}&download=1`;

  // Group targets
  const grouped: Record<string, TargetOption[]> = {};
  for (const t of targets) {
    if (!grouped[t.group]) grouped[t.group] = [];
    grouped[t.group].push(t);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-7">
        <div className="admin-card p-5">
          <label htmlFor="target-destination" className="label text-[13px] font-semibold text-ink">
            Select Destination Link
          </label>
          <select
            id="target-destination"
            value={selectedPath}
            onChange={(e) => setSelectedPath(e.target.value)}
            className="select mt-1 text-[13px]"
          >
            {Object.entries(grouped).map(([group, items]) => (
              <optgroup key={group} label={group}>
                {items.map((item) => (
                  <option key={item.id} value={item.path}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <div className="mt-4">
            <label className="label text-[11px] text-muted">Destination URL</label>
            <div className="mt-1 flex items-center justify-between gap-2 rounded border border-line bg-surface/50 p-2.5 font-mono text-[12px] text-ink">
              <span className="truncate">{fullUrl}</span>
              <CopyButton value={fullUrl} label="Copy Link" copiedLabel="Copied!" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div>
              <label htmlFor="qr-resolution" className="label text-[11px] text-muted">
                Resolution (px)
              </label>
              <select
                id="qr-resolution"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="select min-h-9 w-32 text-[12px]"
              >
                <option value={320}>320 × 320 (Mobile / Screen)</option>
                <option value={560}>560 × 560 (Standard)</option>
                <option value={800}>800 × 800 (High-res Print)</option>
                <option value={1200}>1200 × 1200 (Poster / Banner)</option>
              </select>
            </div>

            <div className="flex items-end pt-5">
              <a
                href={fullUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-9 items-center gap-1.5 border border-line px-3 text-[12px] font-medium text-ink transition-colors hover:border-ink"
              >
                Preview Destination
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="admin-card p-5">
          <h3 className="text-[13px] font-semibold text-ink">Printing & Pamphlet Guidelines</h3>
          <ul className="mt-2 space-y-1.5 text-[12px] text-muted leading-relaxed">
            <li>• Use minimum 25mm × 25mm print size on recruitment brochures.</li>
            <li>• For notice boards and factory gate posters, export at 800px or 1200px.</li>
            <li>• Ensure high contrast: dark ink on white background for reliable mobile camera scanning.</li>
          </ul>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="admin-card flex flex-col items-center p-6 text-center">
          <p className="eyebrow text-muted">QR Code Preview</p>
          <h4 className="mt-1 font-semibold text-ink">{selectedTarget?.label}</h4>

          <div className="mt-5 rounded border border-line bg-white p-4 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrApiUrl}
              alt={`QR Code for ${selectedTarget?.label}`}
              width={240}
              height={240}
              className="h-60 w-60 object-contain"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <a
              href={downloadUrl}
              className="inline-flex min-h-10 items-center justify-center gap-2 bg-brand px-5 text-[13px] font-medium text-white transition-colors hover:bg-brand-dark"
            >
              <Download className="h-4 w-4" />
              Download PNG
            </a>
            <CopyButton value={fullUrl} label="Copy Link" copiedLabel="Link Copied" />
          </div>
        </div>
      </div>
    </div>
  );
}
