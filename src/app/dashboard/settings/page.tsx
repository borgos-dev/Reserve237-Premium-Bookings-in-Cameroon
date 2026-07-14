import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getBusinessProfile } from "@/actions/businesses";
import { SettingsManager } from "@/components/dashboard/SettingsManager";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [user, business] = await Promise.all([
    currentUser(),
    getBusinessProfile(userId),
  ]);

  return (
    <SettingsManager
      userId={userId}
      userEmail={user?.emailAddresses[0]?.emailAddress ?? ""}
      userName={user?.firstName ?? ""}
      business={business}
    />
  );
}
