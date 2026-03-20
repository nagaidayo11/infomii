import { redirect } from "next/navigation";

type LegacyEditorRedirectPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Legacy route redirect:
 * /editor/page/:id -> /editor/:id
 */
export default async function LegacyEditorRedirectPage({
  params,
}: LegacyEditorRedirectPageProps) {
  const { id } = await params;
  redirect(`/editor/${id}`);
}
