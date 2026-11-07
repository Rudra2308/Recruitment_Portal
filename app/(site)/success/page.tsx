import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SuccessRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; ref?: string }>;
}) {
  const params = await searchParams;
  const ref = params.ref || params.id;
  redirect(ref ? `/apply/success?ref=${encodeURIComponent(ref)}` : "/apply/success");
}
