import type { Metadata } from "next";
import { BookingLookup } from "@/components/booking/BookingLookup";

export const metadata: Metadata = {
  title: "Track your booking",
  description:
    "Check the status of a Reserve237 booking with your reference number — no account needed.",
};

// Booking never required a sign-in, but every status surface did. Guests could
// book and then never learn anything again; this is their way back in.
export default function BookingLookupPage() {
  return <BookingLookup />;
}
