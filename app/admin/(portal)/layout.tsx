import { getDataMode } from "@/lib/config";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  let mode = "unknown";
  try {
    mode = getDataMode();
  } catch {
    mode = "unknown";
  }

  return (
    <AdminShell session={session} mode={mode}>
      {children}
    </AdminShell>
  );
}
