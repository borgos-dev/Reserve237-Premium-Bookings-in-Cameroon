import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getPendingBookingsSummary } from "@/actions/dashboard";

export const metadata: Metadata = {
  title: "Dashboard - Reserve237",
  description: "Partner dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const firstName = user?.firstName ?? "Partner";

  // Partner-only area: verify the role in the DB (authoritative), falling back
  // to Clerk metadata for partner accounts created before users rows existed.
  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const isPartner =
    dbUser?.role === "partner" ||
    dbUser?.role === "admin" ||
    (!dbUser && user?.unsafeMetadata?.role === "partner");
  if (!isPartner) redirect("/business/sign-in?error=customer-account");

  // Cache per user for 30 seconds — shown on every dashboard page via the shell
  const getCachedPending = unstable_cache(
    () => getPendingBookingsSummary(userId),
    [`pending-bookings-${userId}`],
    { revalidate: 30 }
  );
  const pendingBookings = await getCachedPending();

  return (
    <DashboardShell userId={userId} firstName={firstName} pendingBookings={pendingBookings}>
      {children}
    </DashboardShell>
  );
}
