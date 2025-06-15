import DashboardClient from './DashboardClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const creatorId = session?.user?.id;

  if (!creatorId) {
    return <div>Please sign in to access the dashboard</div>;
  }

  return <DashboardClient creatorId={creatorId} />;
}
