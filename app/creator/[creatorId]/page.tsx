import DashboardClient from "@/app/dashboard/DashboardClient";

export default async function CreatorPage({ params }: { params: Promise<{ creatorId: string }> }) {
  const { creatorId } = await params;
  console.log("params:", { creatorId });
  return (
    <div>
      <DashboardClient creatorId={creatorId} />
    </div>
  );
}