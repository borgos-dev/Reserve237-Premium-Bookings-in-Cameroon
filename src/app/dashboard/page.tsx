import { auth } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";
import { getDashboardStats } from "@/actions/dashboard";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

export default async function DashboardPage() {
  const { userId } = await auth();

  // Cache stats per user for 30 seconds — dashboard feels snappy on repeat visits
  const getCachedStats = unstable_cache(
    () => getDashboardStats(userId!),
    [`dashboard-stats-${userId}`],
    { revalidate: 30 }
  );

  const stats = await getCachedStats();
  return <DashboardOverview stats={stats} />;
}
