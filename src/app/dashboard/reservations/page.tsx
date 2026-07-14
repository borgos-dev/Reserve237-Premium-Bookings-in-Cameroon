import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPartnerBookings } from "@/actions/bookings";
import { ReservationsManager } from "@/components/dashboard/ReservationsManager";

export default async function ReservationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const bookings = await getPartnerBookings(userId);

  return <ReservationsManager initialBookings={bookings} userId={userId} />;
}
