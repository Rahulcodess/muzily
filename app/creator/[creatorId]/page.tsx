import DashboardClient from "@/app/dashboard/DashboardClient";

export default async function CreatorPage({ params }: { params: { creatorId: string } }) {
  console.log("params:", params);
  return (
    <div>
      <DashboardClient creatorId={params.creatorId} />
    </div>
  );
}