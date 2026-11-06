import { redirect } from "next/navigation";

export default async function SuccessRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  redirect(id ? `/apply/success?id=${encodeURIComponent(id)}` : "/apply/success");
}
