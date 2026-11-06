import { ActionForm } from "@/components/admin/action-form";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import { saveSettingsAction } from "@/app/admin/actions";
import { getSettings } from "@/lib/data/settings";
import { getDataMode, getDriveFolderId, getSpreadsheetId } from "@/lib/config";
import { isEmailConfigured } from "@/lib/email";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  let mode = "unknown";
  try {
    mode = getDataMode();
  } catch {
    mode = "unknown";
  }

  const hasSpreadsheet = !!getSpreadsheetId();
  const hasDrive = !!getDriveFolderId();
  const emailEnabled = isEmailConfigured();

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Portal identity, contact information, recruitment status, and landing page content."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <SectionCard
            title="General recruitment settings"
            description="These details appear across the public portal, in email confirmations, and on job headers."
          >
            <ActionForm
              action={saveSettingsAction}
              submitLabel="Save settings"
              footerClassName="mt-6"
            >
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="company_name" className="label">
                      Company Name <span className="text-brand">*</span>
                    </label>
                    <input
                      id="company_name"
                      name="company_name"
                      defaultValue={settings.company_name}
                      required
                      className="input"
                    />
                  </div>

                  <div>
                    <label htmlFor="recruitment_status" className="label">
                      Recruitment Status <span className="text-brand">*</span>
                    </label>
                    <select
                      id="recruitment_status"
                      name="recruitment_status"
                      defaultValue={settings.recruitment_status}
                      className="select"
                    >
                      <option value="OPEN">OPEN — Accepting applications</option>
                      <option value="PAUSED">PAUSED — Review in progress, paused</option>
                      <option value="CLOSED">CLOSED — Closed to applications</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact_email" className="label">
                      Recruitment Contact Email <span className="text-brand">*</span>
                    </label>
                    <input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      defaultValue={settings.contact_email}
                      required
                      className="input"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact_phone" className="label">
                      Recruitment Contact Phone <span className="text-brand">*</span>
                    </label>
                    <input
                      id="contact_phone"
                      name="contact_phone"
                      defaultValue={settings.contact_phone}
                      required
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="portal_location" className="label">
                    Primary Plant / Portal Location <span className="text-brand">*</span>
                  </label>
                  <input
                    id="portal_location"
                    name="portal_location"
                    defaultValue={settings.portal_location}
                    required
                    className="input"
                  />
                  <p className="mt-1 text-[11px] text-muted">
                    e.g. Hatkanangale, Kolhapur
                  </p>
                </div>

                <div className="border-t border-line pt-5">
                  <h3 className="text-[13px] font-semibold text-ink">
                    Candidate Landing Page Copy
                  </h3>
                  <p className="mt-0.5 text-[11.5px] text-muted">
                    Customise the main title and introduction seen by candidates.
                  </p>
                </div>

                <div>
                  <label htmlFor="hero_heading" className="label">
                    Headline <span className="text-brand">*</span>
                  </label>
                  <input
                    id="hero_heading"
                    name="hero_heading"
                    defaultValue={settings.hero_heading}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="hero_subheading" className="label">
                    Subheading
                  </label>
                  <textarea
                    id="hero_subheading"
                    name="hero_subheading"
                    defaultValue={settings.hero_subheading}
                    rows={2}
                    className="textarea"
                  />
                </div>

                <div>
                  <label htmlFor="hero_support" className="label">
                    Supporting Text
                  </label>
                  <textarea
                    id="hero_support"
                    name="hero_support"
                    defaultValue={settings.hero_support}
                    rows={3}
                    className="textarea"
                  />
                </div>
              </div>
            </ActionForm>
          </SectionCard>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <SectionCard
            title="System & Storage Architecture"
            description="Status of connected services."
          >
            <div className="space-y-4 text-[12px]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                  Data Engine
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      mode === "google" ? "bg-[#1a7f4b]" : "bg-brand"
                    }`}
                  />
                  <span className="font-medium text-ink">
                    {mode === "google" ? "Google Sheets (Cloud)" : "Local Development Store"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted leading-relaxed">
                  {mode === "google"
                    ? "Live sync with Google Sheets master database."
                    : "Running locally using atomic JSON storage (.data/db.json). Ready for Google Cloud credentials anytime."}
                </p>
              </div>

              <div className="border-t border-line pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                  Google Sheets ID
                </p>
                <p className="mt-1 font-mono text-[11px] text-ink">
                  {hasSpreadsheet ? "Configured" : "Not configured (Local store active)"}
                </p>
              </div>

              <div className="border-t border-line pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                  Google Drive Folder
                </p>
                <p className="mt-1 font-mono text-[11px] text-ink">
                  {hasDrive ? "Configured" : "Not configured (Local disk active)"}
                </p>
              </div>

              <div className="border-t border-line pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                  Email Notifications (SMTP)
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      emailEnabled ? "bg-[#1a7f4b]" : "bg-muted/40"
                    }`}
                  />
                  <span className="font-medium text-ink">
                    {emailEnabled ? "Enabled" : "Disabled (Optional)"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted leading-relaxed">
                  {emailEnabled
                    ? "Sending candidate acknowledgements and HR alerts."
                    : "Application submission is fully functional without SMTP."}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
