import type { Metadata } from "next";
import { BusinessLanding } from "@/components/business/BusinessLanding";

export const metadata: Metadata = {
  title: "List Your Business — Reserve237 Partner Programme",
  description:
    "Join Reserve237 and start receiving bookings from customers across Cameroon. Free to list. 7% only on confirmed bookings. Paid via MTN MoMo or Orange Money.",
  openGraph: {
    title: "List Your Business on Reserve237",
    description:
      "Reach customers across Cameroon. Free to list — we only earn when you do.",
  },
};

export default function BusinessPage() {
  return <BusinessLanding />;
}
