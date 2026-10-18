import { WorkspaceCatalog } from "@/components/portal/workspace-catalog";
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <WorkspaceCatalog kind="classes" page={Number((await searchParams).page) || 1} />;
}
