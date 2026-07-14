import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPartnerListings } from "@/actions/listings";
import { getOrCreateBusiness } from "@/actions/businesses";
import { ListingsManager } from "@/components/dashboard/ListingsManager";

export default async function ListingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [partnerListings, business] = await Promise.all([
    getPartnerListings(userId),
    getOrCreateBusiness(userId),
  ]);

  return (
    <ListingsManager
      initialListings={partnerListings}
      userId={userId}
      businessPlan={business.plan}
    />
  );
}
