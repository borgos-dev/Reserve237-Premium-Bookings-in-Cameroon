import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPartnerListings } from "@/actions/listings";
import { getListingAvailability, getBookedDates } from "@/actions/availability";
import { AvailabilityManager } from "@/components/dashboard/AvailabilityManager";

export default async function AvailabilityPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const partnerListings = await getPartnerListings(userId);

  // Pre-load availability for the first listing
  const firstId = partnerListings[0]?.id ?? null;

  const [blockedDates, bookedDates] = firstId
    ? await Promise.all([
        getListingAvailability(firstId),
        getBookedDates(firstId),
      ])
    : [[], []];

  return (
    <AvailabilityManager
      userId={userId}
      listings={partnerListings.map((l) => ({
        id: l.id,
        name: l.name,
        category: l.mainCategory,
      }))}
      initialListingId={firstId}
      initialBlockedDates={blockedDates}
      initialBookedDates={bookedDates}
    />
  );
}
